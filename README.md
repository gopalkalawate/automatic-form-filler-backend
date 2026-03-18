# PatientVoiceFiller Backend

This Node.js Express server acts as the proxy for the PatientVoiceFiller Chrome Extension. It receives multipart form data containing an audio blob and a JSON map of form fields from the extension, processes them using Groq and Gemini, and returns a mapped JSON payload.

## Setup Instructions

### 1. Install Dependencies
Run the following command in the `backend` directory to install the required packages (`express`, `multer`, `cors`, `dotenv`, `groq-sdk`, and `@google/genai`):

```bash
npm install
```

### 2. Configure API Keys
You need API keys for the Groq Cloud API (Whisper Transcription) and Google Gemini API (Field Mapping). 

Create a new file named `.env` in the root of the `backend` directory:
```bash
touch .env
```

Open the `.env` file and add your API keys in the following format:
```env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Server
The standard port and backend configurations are read from `config/en.json` located one directory up (`../config/en.json`).

To start the server, just run:
```bash
node server.js
```

You should see:
> `PatientVoiceFiller backend listening on port 5050`
