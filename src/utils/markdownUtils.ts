/**
 * Utility functions for cleaning, normalizing, and rendering GitHub-Flavored Markdown
 * across Digital Shipyard AI features (Shift Handover Reports, RCA Copilot, Audits).
 */

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

  return text.trim();
}
