import fs from 'fs';
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const translateAudio = async (audioFilePath) => {
    try {
        const fileStream = fs.createReadStream(audioFilePath);
        console.log(`Translating audio file at path: ${fileStream.path}`);
        const response = await groq.audio.transcriptions.create({
            file: fileStream,
            model: "whisper-large-v3",
            prompt: "The audio is a patient describing symptoms.Also keep all relevant patient information like age , sex , city etc.  It may be in Marathi or Hindi. Please transcribe.",
            response_format: "json",
            language: "en", // We want english output
            temperature: 0.0
        });

        // The 'whisper-large-v3' model doesn't directly support the 'translate' task yet in all SDKs
        // However setting language="en" acts as a translation from source to English.
        console.log('Groq API Response:', response);
        return response.text;
    } catch (error) {
        console.error('Groq Translation Error:', error);
        throw new Error('Failed to translate audio with Groq');
    }
}
