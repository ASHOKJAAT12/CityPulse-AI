import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: 'respond strictly in json: { "ok": true }',
            config: { responseMimeType: 'application/json' }
        });
        console.log("SUCCESS:");
        console.log(response.text);
    } catch (e) {
        console.error("ERROR:");
        console.error(e);
    }
}
test();
