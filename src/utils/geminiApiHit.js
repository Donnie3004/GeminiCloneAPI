import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function chatWithGemini(message) {
  console.log(message);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(message);
  const reply = result.response.text();
  return reply;
}