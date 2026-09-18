import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function testVision() {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // create a tiny white pixel base64 image
        const b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
        const mimeType = "image/png";

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: "what is this?" },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: b64,
                            }
                        }
                    ]
                }
            ]
        });
        console.log("SUCCESS:");
        console.log(response.text);
    } catch (e) {
        console.error("ERROR:");
        console.error(e);
    }
}
testVision();
