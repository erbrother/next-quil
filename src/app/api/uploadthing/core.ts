import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { openaiEmbeddings } from "@/lib/openai";
const f = createUploadthing();


// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({
    pdf: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({  }) => {
      const { getUser } = getKindeServerSession()
      const user = await getUser()
    
      if (!user || !user.id) throw new Error('Unauthorized')
    
    
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const isFileExist = await db.file.findFirst({
        where: {
          key: file.key,
        },
      })

      if (isFileExist) return
    
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.url,
          uploadStatus: 'PROCESSING',
        },
      })

      try {
        const response = await fetch(file.url)
        const blob = await response.blob()
        const loader = new PDFLoader(blob)

        const pageLevelDocs = await loader.load();

        console.log('pageLevelDocs:', pageLevelDocs)

        // const pageAmt = pageLevelDocs.length
        
        // vectorize and index entire document
        const pineconeIndex = pinecone.Index('quill')

        
        // 访问API需要设置代理
        const embeddings = openaiEmbeddings

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id
        })

        await db.file.update({
          data: {
            uploadStatus: 'SUCCESS'
          },
          where :{
            id: createdFile.id
          }
        })

      } catch (error) {
        console.error(`document Pdf upload error`, error)
        await db.file.update({
          data: {
            uploadStatus: 'FAILED'
          },
          where :{
            id: createdFile.id
          }
        })
      }

    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
