import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function list() {
    const ai = new GoogleGenAI({});
    const models = await ai.models.list();
    const modelNames = [];
    for await (const m of models) {
        modelNames.push(m.name);
    }
    console.log("Available Models:", modelNames);
}
list().catch(console.error);
