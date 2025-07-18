import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Load your API key from environment variable or replace with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function chatExample() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hi!" }],
      },
      {
        role: "model",
        parts: [{ text: "Hello! How can I help you?" }],
      },
    ],
  });

  const result = await chat.sendMessage("What is the capital of France?");
  const response = result.response;
  const text = response.text();

  return text;
}

chatExample();