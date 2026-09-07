/**
 * Utility functions for cleaning, normalizing, and rendering GitHub-Flavored Markdown
 * across Digital Shipyard AI features (Shift Handover Reports, RCA Copilot, Audits).
 */

function convertLatexMath(text: string): string {
  let result = text;

  // Replace LaTeX symbols with Unicode equivalents BEFORE stripping $ delimiters
  result = result.replace(/\\mu\\varepsilon/g, 'µε');
  result = result.replace(/\\mu/g, 'µ');
  result = result.replace(/\\varepsilon/g, 'ε');
  result = result.replace(/\\epsilon/g, 'ε');
  result = result.replace(/\\sigma/g, 'σ');
  result = result.replace(/\\omega/g, 'ω');
  result = result.replace(/\\Delta/g, 'Δ');
  result = result.replace(/\\delta/g, 'δ');
  result = result.replace(/\\alpha/g, 'α');
  result = result.replace(/\\beta/g, 'β');
  result = result.replace(/\\gamma/g, 'γ');
  result = result.replace(/\\lambda/g, 'λ');
  result = result.replace(/\\pi/g, 'π');
  result = result.replace(/\\degree/g, '°');
  result = result.replace(/\\deg/g, '°');
  result = result.replace(/\^\\circ/g, '°');
  result = result.replace(/\\textsuperscript\{\\circ\}/g, '°');

  // Convert \text{...} to just the content
  result = result.replace(/\\text\{([^}]*)\}/g, '$1');

  // Convert \mathrm{...} to just the content
  result = result.replace(/\\mathrm\{([^}]*)\}/g, '$1');

  // Convert \textbf{...} to just the content
  result = result.replace(/\\textbf\{([^}]*)\}/g, '$1');

  // Convert \textrm{...} to just the content
  result = result.replace(/\\textrm\{([^}]*)\}/g, '$1');

  // Remove backslash-space commands (\, \; \! \quad \qquad etc.)
  result = result.replace(/\\[,;!]/g, ' ');
  result = result.replace(/\\ /g, ' ');
  result = result.replace(/\\quad/g, '  ');
  result = result.replace(/\\qquad/g, '    ');

  // Convert \sim to ~
  result = result.replace(/\\sim/g, '~');

  // Convert \\ to newline (LaTeX line break)
  result = result.replace(/\\\\/g, '\n');

  // Convert \leq, \geq, \neq, \approx
  result = result.replace(/\\leq\b/g, '≤');
  result = result.replace(/\\geq\b/g, '≥');
  result = result.replace(/\\neq\b/g, '≠');
  result = result.replace(/\\approx/g, '≈');
  result = result.replace(/\\times/g, '×');
  result = result.replace(/\\cdot/g, '·');
  result = result.replace(/\\pm/g, '±');
  result = result.replace(/\\infty/g, '∞');
  result = result.replace(/\\rightarrow/g, '→');
  result = result.replace(/\\leftarrow/g, '←');
  result = result.replace(/\\Rightarrow/g, '⇒');
  result = result.replace(/\\Leftarrow/g, '⇐');
  result = result.replace(/\\%/g, '%');

  // Strip remaining backslashes before common units/chars
  result = result.replace(/\\([%°µεσωΔδαβγλπ])/g, '$1');

  // Strip $...$ and $$...$$ delimiters
  result = result.replace(/\$\$/g, '');
  result = result.replace(/\$/g, '');

  // Clean up multiple spaces left behind
  result = result.replace(/  +/g, ' ');

  return result;
}

export function cleanMarkdownContent(rawText: string | null | undefined): string {
  if (!rawText) return '';
  
  let text = String(rawText).trim();

  // If text was JSON stringified with quotes and escaped characters, unpack if appropriate
  if ((text.startsWith('"{') && text.endsWith('}"')) || (text.startsWith('"') && text.endsWith('"') && text.includes('\\n'))) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'string') {
        text = parsed;
      }
    } catch {
      // Keep as-is
    }
  }

  // Normalize Windows line endings
  text = text.replace(/\r\n/g, '\n');

  // Strip wrapping code fences (e.g. ```markdown ... ``` or ```md ... ``` or ``` ... ```)
  // Check if the entire string or almost entire string is wrapped in code fences
  const fullFenceMatch = text.match(/^```(?:markdown|md|text)?\s*\n([\s\S]*?)\n```\s*$/i);
  if (fullFenceMatch && fullFenceMatch[1]) {
    text = fullFenceMatch[1].trim();
  } else {
    // Strip if starts with ```markdown or ```md or ``` at the beginning
    text = text.replace(/^```(?:markdown|md|text)?\s*\n?/i, '');
    // Strip trailing ``` at the end
    text = text.replace(/\n?```\s*$/i, '');
  }

  // Handle case where multiple triple backticks were output around the main text
  if (text.startsWith('```') && text.endsWith('```')) {
    text = text.slice(3, -3).trim();
  }

  // Convert LaTeX math notation to readable text
  text = convertLatexMath(text);

  return text.trim();
}
