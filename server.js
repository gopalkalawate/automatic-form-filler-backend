import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';

import { transcribeAudio } from './controllers/transcribeController.js';
import { parseTextToFields } from './controllers/parseController.js';

// Load config from adjacent directory gracefully
let config = { backend: { port: 5050 } };
try {
  const configPath = path.resolve(process.cwd(), '../config/en.json');
  if (fs.existsSync(configPath)) {
    const rawConfig = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(rawConfig);
  }
} catch (e) {
  console.log('Running without local config file (Vercel fallback)');
}

dotenv.config();

const app = express();
const port = process.env.PORT || config.backend.port || 5050;

app.use(cors());
app.use(express.json());

// Set up multer for handling temporary audio file uploads
// Vercel Serverless Functions have Read-Only filesystems except for /tmp
const upload = multer({ dest: os.tmpdir() });

// Map the routes to the controllers
app.post('/api/transcribe', upload.single('audio'), transcribeAudio);
app.post('/api/parse', parseTextToFields);

// This handles the "Cannot GET /" error
app.get('/', (req, res) => {
  res.send('Form Filler Backend is Running! 🚀');
});

// Only listen locally, Vercel maps routes natively via Serverless
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`PatientVoiceFiller backend listening on port ${port}`);
  });
}

// Export for Vercel serverless integration
export default app;
