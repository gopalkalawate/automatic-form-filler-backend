import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { transcribeAudio } from './controllers/transcribeController.js';
import { parseTextToFields } from './controllers/parseController.js';

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

// Map the routes to the controllers
app.post('/api/transcribe', upload.single('audio'), transcribeAudio);
app.post('/api/parse', parseTextToFields);

app.listen(port, () => {
  console.log(`PatientVoiceFiller backend listening on port ${port}`);
});
