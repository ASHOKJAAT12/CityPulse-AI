import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function test() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Create a tiny 1x1 pixel base64 PNG
    const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const mimeType = "image/png";

    const prompt = `Provide a minified JSON object containing: {"title": "title", "description": "desc", "category": "General", "subcategory": "Other", "severity": "MEDIUM"}`;

    console.log("Sending request to Gemini Vision...");
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [
                { text: prompt },
                { inlineData: { data: base64Data, mimeType: mimeType } }
            ]
        });

        console.log("Request successful!");
        const textResult = response.text;
        console.log("Result (property):", textResult);
    } catch (e) {
        console.error("Error during request:", e);
    }
}

test().catch(console.error);
