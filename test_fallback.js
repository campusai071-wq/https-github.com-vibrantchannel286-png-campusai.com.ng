import { GoogleGenAI } from "@google/genai";

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are a Senior Investigative Education Journalist in Nigeria. 
Based on today's date, curate 5 highly authoritative news articles for the 2026/2027 academic session.
USE YOUR SEARCH TOOL to find the latest updates on JAMB, Post-UTME, ASUU, and Scholarships.
Return ONLY a valid JSON object matching this schema:
{ "news": [ { "id": "string", "title": "string", "category": "string", "date": "string", "excerpt": "string", "fullContent": "string", "sourceUrl": "string" } ] }`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", tools: [{ googleSearch: {} }] }
    });
    console.log("Success! Length of text:", response.text.length);
    console.log(response.text);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
