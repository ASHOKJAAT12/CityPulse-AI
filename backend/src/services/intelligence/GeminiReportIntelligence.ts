import { GoogleGenAI } from '@google/genai';

// Singleton client — instantiated once, reused for all requests
let _geminiClient: GoogleGenAI | null = null;

const PRIMARY_MODEL = 'gemini-3.6-flash';
const FALLBACK_MODEL = 'gemini-1.5-flash';

/** Sleep for `ms` milliseconds */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calls fn() up to maxRetries times, retrying on 503 UNAVAILABLE with exponential backoff.
 * Falls back to fallbackModel on the last retry if primary is still overloaded.
 */
async function withRetry<T>(
    fn: (model: string) => Promise<T>,
    maxRetries = 3
): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const model = attempt < maxRetries - 1 ? PRIMARY_MODEL : FALLBACK_MODEL;
        try {
            return await fn(model);
        } catch (err: any) {
            lastError = err;
            const is503 = err?.status === 503 || err?.message?.includes('503');
            if (!is503 || attempt === maxRetries - 1) throw err;
            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, then fallback
            console.warn(`Gemini 503 overload (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }
    throw lastError;
}

export class GeminiReportIntelligence {
    private static getClient(): GoogleGenAI {
        if (!_geminiClient) {
            if (!process.env.GEMINI_API_KEY) {
                console.warn('GEMINI_API_KEY is not set. AI features will fail.');
            }
            _geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
        return _geminiClient;
    }

    static async analyzeReport(title: string, description: string): Promise<{ category: string, subcategory: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } | null> {
        try {
            const ai = this.getClient();
            const prompt = `Analyze the following citizen report to determine its appropriate classification and severity. 
Title: "${title}"
Description: "${description}"

Respond ONLY with a valid minified JSON object containing:
- "category": Broad civic category (e.g., "Infrastructure", "Waste Management", "Public Safety", "Water & Sanitation", "Electricity", "Environment")
- "subcategory": Specific issue (e.g., "Pothole", "Garbage Collection", "Streetlight Broken", "Pipe Leak", "Noise Complaint")
- "severity": Must be exactly one of "LOW", "MEDIUM", "HIGH", "CRITICAL".

Example format:
{"category":"Infrastructure","subcategory":"Pothole","severity":"MEDIUM"}`;

            const response = await withRetry((model) =>
                ai.models.generateContent({ model, contents: prompt })
            );

            const text = response.text;
            if (!text) return null;

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return null;

            const parsed = JSON.parse(jsonMatch[0]);
            return {
                category: parsed.category || 'General',
                subcategory: parsed.subcategory || 'Other',
                severity: parsed.severity || 'MEDIUM'
            };
        } catch (error) {
            console.error('Gemini AI classification error:', error);
            return null;
        }
    }

    static async analyzeImage(mimeType: string, base64Data: string): Promise<{ title: string, description: string, category: string, subcategory: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } | null> {
        try {
            const ai = this.getClient();
            const prompt = `Analyze this image of a civic issue. Respond ONLY with a minified JSON object containing:
- "title": A short, concise title (max 50 chars).
- "description": A paragraph describing the issue, severity, and context based solely on what is visible.
- "category": Broad civic category (e.g., "Infrastructure", "Waste Management", "Public Safety", "Water", "Electricity", "Environment")
- "subcategory": Specific issue (e.g., "Pothole", "Garbage", "Streetlight", "Pipe")
- "severity": Must be exactly one of "LOW", "MEDIUM", "HIGH", "CRITICAL".

Example format:
{"title":"Pothole","description":"There is a large pothole.","category":"Infrastructure","subcategory":"Pothole","severity":"MEDIUM"}`;

            // @google/genai v2: multimodal contents must use role/parts structure
            const response = await withRetry((model) =>
                ai.models.generateContent({
                    model,
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                { text: prompt },
                                {
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: base64Data,
                                    }
                                }
                            ]
                        }
                    ]
                })
            );

            const text = response.text;
            if (!text) return null;

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return null;

            const parsed = JSON.parse(jsonMatch[0]);
            return {
                title: parsed.title || 'Auto-Detected Issue',
                description: parsed.description || 'Issue detected from uploaded image.',
                category: parsed.category || 'General',
                subcategory: parsed.subcategory || 'Other',
                severity: parsed.severity || 'MEDIUM'
            };
        } catch (error) {
            console.error('Gemini AI vision classification error:', error);
            return null;
        }
    }
}
