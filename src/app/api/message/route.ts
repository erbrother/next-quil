import { db } from "@/db"
import { pinecone } from "@/lib/pinecone"
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { PineconeStore } from "@langchain/pinecone"
import { NextRequest } from "next/server"
import { createOpenAI  } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { openaiEmbeddings } from "@/lib/openai"

export const POST = async (req: NextRequest) => {
  const body = await req.json()

  const { getUser } = getKindeServerSession()
  const user = await getUser()

  const { id: userId } = user

  if (!userId) return new Response('Unauthorized', {
    status: 401
  })

  const { fileId, message } = SendMessageValidator.parse(body)

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file)
    return new Response('Not found', { status: 404 })

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  })

  const embeddings = openaiEmbeddings

  const pineconeIndex = pinecone.Index('quill')

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id
  })

  const results = await vectorStore.similaritySearch(message, 4)

  const prevMessages = await db.message.findMany({
    where: {
      fileId
    },
    orderBy: {
      createdAt: 'asc'
    },
    take: 6
  })

  // console.log('results:', results)

  // console.log('prevMessages', prevMessages)

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? "user" : "assistant",
    content: msg.text
  }))

  const openai = createOpenAI({
    baseURL: 'https://api.openai-proxy.com/v1',
    // custom settings, e.g.
    compatibility: 'strict', // strict mode, enable when using the OpenAI API
  });

  const result = streamText({
    model: openai('gpt-3.5-turbo'),
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.',
      },
      {
        role: 'user',
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        \n----------------\n
        
        PREVIOUS CONVERSATION:
        ${formattedPrevMessages.map((message) => {
          if (message.role === 'user') {
            return `User: ${message.content}\n`
          }
          return `Assistant: ${message.content}\n`
        })}
        
        \n----------------\n
        
        CONTEXT:
        ${results.map((r) => r.pageContent).join('\n\n')}
        
        USER INPUT: ${message}`,
      },
    ],
    onFinish:async ({ text }) => {
      // console.log('=================')
      // console.log('text======', response.messages)
      await db.message.create({
        data: {
          text: text,
          isUserMessage: false,
          fileId,
          userId,
        },
      })
    }
  })

  let completeText = ''
  for await (const text of result.textStream) {
    // console.log('text', text)
    completeText += text
  }

  // console.log('streamTextRes', result)

  return new Response(JSON.stringify({
    text: completeText
  }))

}