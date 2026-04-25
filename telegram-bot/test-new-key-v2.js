import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyBtqWYxvemb-XBGC4xecIpNgP038nv6fo0");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" }); // Even lighter

async function run() {
  try {
    const result = await model.generateContent("Hi");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}
run();
