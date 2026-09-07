import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env['GEMINI_API_KEY'],
});

const generationConfig = {
    temperature: 1,
    max_output_tokens: 65536,
    topP: 0.95,
    thinkingLevel: 'high',
};

async function main() {
    const interaction = await ai.interactions.create({
        model: 'models/gemini-3-flash-preview',
        input: 'hi',
        generation_config: generationConfig,
    });

    if (interaction.output_text) {
        console.log(interaction.output_text);
    }
}

main();


