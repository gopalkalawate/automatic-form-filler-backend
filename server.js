import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { translateAudio } from './services/groq.js';
import { mapFields } from './services/gemini.js';

// Load config from adjacent directory
const configPath = path.resolve(process.cwd(), '../config/en.json');
const rawConfig = fs.readFileSync(configPath, 'utf-8');
const config = JSON.parse(rawConfig);

dotenv.config();

const app = express();
const port = config.backend.port || 5050;

app.use(cors());
app.use(express.json());

// Set up multer for handling audio file uploads
const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.post('/api/parse', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    if (!req.body.fieldsMap) {
      return res.status(400).json({ error: 'No fields map provided' });
    }

    const fieldsMap = JSON.parse(req.body.fieldsMap);
    const audioFilePath = req.file.path;
    const newFilePath = audioFilePath + '.webm';
    fs.renameSync(audioFilePath, newFilePath);
    
    console.log('File name on server:', req.file.originalname);
    console.log("file type:", req.file.mimetype);
    console.log('File size (bytes):', req.file.size);
    console.log(`Received audio file: ${newFilePath}`);
    console.log(`Fields Map size: ${Object.keys(fieldsMap).length} fields`);
    console.log('These are the fields we are trying to map to:', fieldsMap);

    // 1. Translate Audio to English Text using Groq
    // const translatedText = await translateAudio(newFilePath);
    const translatedText = "My name is Gopal Kalawate. I am 25 years old. Male. I have been experiencing headaches and nausea for the past three days. I live in Mumbai. mail is kalawategopal@gmail.com , phone number : 1234567890";
    console.log(`Translated Text: ${translatedText}`);

    // Clean up temporary audio file after translation
    fs.unlinkSync(newFilePath);

    // 2. Map Translated Text to Form Fields using Gemini
    const mappedValues = await mapFields(translatedText, fieldsMap);
    console.log('Mapped Values:', mappedValues);

    res.json({
      success: true,
      text: translatedText,
      mappedValues: mappedValues
    });

  } catch (error) {
    console.error('Error in /api/parse:', error);
    
    // Attempt to clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    const potentialNewPath = req.file ? req.file.path + '.webm' : null;
    if (potentialNewPath && fs.existsSync(potentialNewPath)) {
      fs.unlinkSync(potentialNewPath);
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`PatientVoiceFiller backend listening on port ${port}`);
});
