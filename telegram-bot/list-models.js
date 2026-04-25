import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyBtqWYxvemb-XBGC4xecIpNgP038nv6fo0");

async function list() {
  try {
    // There isn't a direct listModels in the simple SDK, but we can try common ones.
    const models = ["gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-pro"];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("test");
            console.log(`Model ${m} is AVAILABLE`);
        } catch (e) {
            console.log(`Model ${m} is NOT available: ${e.message}`);
        }
    }
  } catch (e) {
    console.error("List Error:", e.message);
  }
}
list();
