import { GoogleGenAI } from '@google/genai';

export class GeminiReportIntelligence {
    private static getClient() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is not set in the environment. AI features will fail.");
        }
        return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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

            const response = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: prompt,
            });

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
            return null; // Fallback to normal flow if AI fails
        }
    }

    static async analyzeImage(mimeType: string, base64Data: string): Promise<{ title: string, description: string, category: string, subcategory: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } | null> {
        try {
            const ai = this.getClient();
            const prompt = `Analyze this image of a civic issue. Provide a minified JSON object containing:
- "title": A short, concise title (max 50 chars).
- "description": A paragraph describing the issue, severity, and context based solely on what is visible.
- "category": Broad civic category (e.g., "Infrastructure", "Waste Management", "Public Safety", "Water", "Electricity", "Environment")
- "subcategory": Specific issue (e.g., "Pothole", "Garbage", "Streetlight", "Pipe")
- "severity": Must be exactly one of "LOW", "MEDIUM", "HIGH", "CRITICAL".

Example format:
{"title":"Pothole","description":"There is a large pothole.","category":"Infrastructure","subcategory":"Pothole","severity":"MEDIUM"}`;

            const response = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: [
                    {
                        text: prompt
                    },
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    }
                ]
            });

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
