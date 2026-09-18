import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const list = await ai.models.list();
        for await (const model of list) {
            console.log(model.name);
        }
    } catch (e) {
        console.error(e);
    }
}
listModels();
