import fs from 'fs';
import { translateAudio } from '../services/groq.js';

export const transcribeAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        const audioFilePath = req.file.path;
        const newFilePath = audioFilePath + '.webm';
        
        // Rename file to include .webm extension so Groq can infer MIME type correctly
        fs.renameSync(audioFilePath, newFilePath);
        
        console.log(`[TranscribeController] Processing file: ${newFilePath}`);
        
        // Translate Audio to English Text using Groq
        const translatedText = await translateAudio(newFilePath);
        console.log(`[TranscribeController] text: ${translatedText}`);

        // Clean up temporary audio file after translation
        fs.unlinkSync(newFilePath);

        res.json({
            success: true,
            text: translatedText
        });
    } catch (error) {
        console.error('Error in transcribeAudio:', error);
        
        // Clean up file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        const potentialNewPath = req.file ? req.file.path + '.webm' : null;
        if (potentialNewPath && fs.existsSync(potentialNewPath)) {
            fs.unlinkSync(potentialNewPath);
        }
        
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
