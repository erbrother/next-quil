import OpenAI from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HttpsProxyAgent } from 'https-proxy-agent';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})
const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:7890');

export const openaiEmbeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    configuration:{
      httpAgent: proxyAgent
    }
  });