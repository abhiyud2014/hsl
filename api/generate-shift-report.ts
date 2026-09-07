import { generateWithGeminiFallback, cleanMarkdownOutput, generateShiftReportFallback } from '../src/utils/aiGateway';

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

  const { fleetSummary, cranes, weldingBays, cncCutters, shiftName, supervisor } = req.body || {};

  // Diagnostic logging for Vercel deployment
  const hasApiKey = !!(typeof process !== 'undefined' && process.env?.GEMINI_API_KEY);
  console.log(`[Gemini Shift Report] Request received. API key configured: ${hasApiKey}`);

  try {
    const systemInstruction = `You are the Chief Quality & Safety Superintendent at a premier naval shipyard.
Generate a formal, audit-ready Shift Handover & Safety Compliance Report using GitHub-Flavored Markdown.
Use formatted markdown tables for tabular data (e.g., KPIs, Cranes, Welding Bays, CNC Cutters) and clear bullet points for action items.
CRITICAL FORMATTING RULE: Output direct Markdown only. Do NOT wrap your entire response in triple backticks or \`\`\`markdown code fences.`;

    const prompt = `Generate a formal Naval Shipyard IIoT Shift Handover & Safety Compliance Report for:
Shift: ${shiftName || 'Day Shift 07:00 - 15:30'}
Superintendent: ${supervisor || 'Chief Yard Engineer'}
Date: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}

Fleet Telemetry Data:
- Overall Fleet OEE: ${fleetSummary?.overallFleetOee || fleetSummary?.totalYardOee || 82.4}%
- Real-Time Fleet Power Draw: ${fleetSummary?.fleetEnergyKw || 318.5} kW
- Active Safety Incidents: ${JSON.stringify(fleetSummary?.activeSafetyIncidents || [])}
- Heavy Cranes Status: ${JSON.stringify(cranes?.map((c: any) => ({ name: c.name, code: c.code, load: c.currentLoadTons + 'T', swl: c.safeWorkingLimitTons + 'T', swlPct: c.loadPercentage + '%', strain: c.structuralStrainMicrostrain + 'µε', prox: c.proximityDistanceMeters + 'm', status: c.proximityStatus })))}
- Welding Bays: ${JSON.stringify(weldingBays?.map((w: any) => ({ name: w.name, op: w.operator, wps: w.wpsCompliancePercentage + '%', arcOn: w.arcOnTimePercentage + '%', defectScore: w.defectProbabilityScore + '%', aqi: w.bayAqiPm25 })))}
- CNC Cutters: ${JSON.stringify(cncCutters?.map((n: any) => ({ name: n.name, state: n.machineState, leak: n.isLeakingGas, oee: n.oeeScore + '%', nozzleWear: n.nozzleWearPercentage + '%' })))}

Create a clean, executive, audit-ready Markdown report highlighting:
1. Executive Shift KPI Overview (formatted as a clean table)
2. Critical Safety & Environmental Incidents (with root causes)
3. Heavy Cranes & Lifting Safety (Module 01 - in a clear table)
4. Manual Welding Bays & WPS Compliance (Module 02 - in a clear table)
5. Legacy CNC Cutters & OEE Tracking (Module 03 - in a clear table)
6. Handover Action Items for Incoming Shift Superintendent`;

    const { text, source } = await generateWithGeminiFallback(prompt, systemInstruction, 0.1);

    const finalReport = cleanMarkdownOutput(text) || generateShiftReportFallback(shiftName, supervisor, fleetSummary, cranes, weldingBays, cncCutters);

    return res.status(200).json({
      success: true,
      source,
      reportMarkdown: finalReport,
    });
  } catch (error: any) {
    console.warn('[Gemini Shift Report API] Domain-expert synthesis fallback activated:', error?.message || error);
    return res.status(200).json({
      success: true,
      source: 'local-expert-rules-fallback',
      reportMarkdown: generateShiftReportFallback(shiftName, supervisor, fleetSummary, cranes, weldingBays, cncCutters),
    });
  }
}
