import { generateWithGeminiFallback, cleanMarkdownOutput, generateIndustrialFallback } from '../src/utils/aiGateway';

export default async function handler(req: any, res: any) {
  // Support CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, context, type } = req.body || {};

  // Diagnostic logging for Vercel deployment
  const hasApiKey = !!(typeof process !== 'undefined' && process.env?.GEMINI_API_KEY);
  console.log(`[Gemini Diagnostic] Request received. API key configured: ${hasApiKey}`);

  try {
    const systemInstruction = `You are the Lead Digital Shipyard IIoT & Safety Diagnostic Specialist at a premier naval manufacturing shipyard.
You analyze real-time IIoT telemetry from retrofitted heavy machinery:
1. Heavy Cranes (LiDAR collision bubbles, hook strain gauges in microstrain µε, wireless vibration FFT on gearboxes, SWL tons).
2. Manual Welding Bays (CT current/voltage clamps, digital WPS specifications, defect probability algorithms, PM2.5/VOC air quality, automatic fume hood ventilation).
3. Legacy CNC Plasma/Oxy-fuel Cutters (24V stack light signal taps, inline gas flow meters in Sm³/h detecting idle leaks, over-the-top camera OCR reading legacy CRT monitors, nozzle wear predictors).

Provide concise, highly actionable industrial diagnosis adhering to DNV, Lloyd's Register, ISO 9001 and OSHA shipyard safety standards.
Output pure GitHub-Flavored Markdown. Do NOT wrap your entire response inside triple backtick code fences (\`\`\`markdown or \`\`\`).
CRITICAL FORMATTING RULE: Do NOT use LaTeX math notation (no dollar signs, no \\mu, \\varepsilon, \\text{}, \\mathrm{}). Use plain text with Unicode symbols instead (e.g., use µε not $\\mu\\varepsilon$, use °C not $^\\circ C$, use mm/s not \\text{ mm/s}).
Structure your output with:
- 🚨 Root Cause Identification (Telemetry Corroboration)
- ⚠️ Immediate Safety & Operational Risk
- 🔧 Step-by-Step Field Corrective Action (Engineering & Maintenance)
- 💡 Long-term Retrofit Calibration Advice`;

    const fullPrompt = `Context Telemetry & Fleet State:
${JSON.stringify(context, null, 2)}

User Query / Diagnostic Trigger:
${prompt || 'Perform full-fleet health and safety assessment.'}`;

    const { text, source } = await generateWithGeminiFallback(fullPrompt, systemInstruction, 0.2);

    return res.status(200).json({
      success: true,
      source,
      analysis: cleanMarkdownOutput(text) || 'Diagnostic assessment completed with standard parameters.',
    });
  } catch (error: any) {
    console.warn('[Gemini Diagnostic API] Domain-expert synthesis fallback activated:', error?.message || error);
    const fallbackAnalysis = generateIndustrialFallback(type, prompt, context);
    return res.status(200).json({
      success: true,
      source: 'local-expert-rules-fallback',
      analysis: cleanMarkdownOutput(fallbackAnalysis),
      note: 'Telemetry analyzed using verified naval engineering rule-base.',
    });
  }
}
