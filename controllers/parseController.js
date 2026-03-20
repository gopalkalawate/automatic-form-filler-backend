import { mapFields } from '../services/gemini.js';

export const parseTextToFields = async (req, res) => {
    try {
        if (!req.body.text) {
            return res.status(400).json({ error: 'No text provided' });
        }
        if (!req.body.fieldsMap) {
            return res.status(400).json({ error: 'No fields map provided' });
        }

        const text = req.body.text;
        const fieldsMap = typeof req.body.fieldsMap === 'string' 
            ? JSON.parse(req.body.fieldsMap) 
            : req.body.fieldsMap;

        console.log(`[ParseController] Mapping text to ${Object.keys(fieldsMap).length} fields`);

        // Map Translated Text to Form Fields using Gemini
        const mappedValues = await mapFields(text, fieldsMap);
        console.log('[ParseController] Mapped Values:', mappedValues);

        res.json({
            success: true,
            mappedValues: mappedValues
        });
    } catch (error) {
        console.error('Error in parseTextToFields:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
