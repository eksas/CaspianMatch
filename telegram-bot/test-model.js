import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyCZvTQfWmtdrHw3hpzPRBbBeOsSYQJiUBo");
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

async function run() {
  try {
    const result = await model.generateContent("Hi");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
