import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

export const mapFields = async (text, fieldsMap) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY environment variable is missing.");
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `
You are a medical data extraction assistant. I will provide you with a patient's transcribed complaint ("Text") and a map of available form fields ("FieldsMap").
Your task is to extract relevant information from the Text and map it to the corresponding keys in FieldsMap.
Also if there is some other information that matches the json , map it as well. Example mobile number and email

Text:
"${text}"

FieldsMap (JSON):
${JSON.stringify(fieldsMap, null, 2)}

Instructions:
1. Output ONLY valid JSON. No markdown formatting, no explanations , also dont add extra field by yourself just add the values for each.
2. The JSON keys MUST exactly match the "name" or "id" properties from the input FieldsMap.
3. If a field cannot be determined from the text, omit it or set it to null.
4. Convert symptoms into clean, concise medical terminology where appropriate.
5. id will have the max priority for the key of mapping

Example Output:
{
  "patient_symptoms": "Headache, nausea",
  "duration": "3 days"
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.1,
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString);

    } catch (error) {
        console.error('Gemini Mapping Error:', error);
        throw new Error('Failed to map fields with Gemini');
    }
}
