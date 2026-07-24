// pdfImport.js — turn an uploaded schedule PDF into SERVE session rows.
//
// pdf.js extracts positioned text; we rebuild the table from it: text items
// grouped into rows by their y position, ordered by x, with wide x-gaps
// treated as column breaks. The resulting lines feed the same tolerant row
// parser used everywhere else (scheduleImport.js), so any PDF whose pages
// contain a Day / Time / Coach / Court / Title / Type / Players table —
// exported from Excel, Sheets, Word, or a scanner app with text — imports.
//
// The worker ships inlined (?raw → Blob) so the single-file exports stay
// self-contained.

import * as pdfjsLib from 'pdfjs-dist';
import workerRaw from 'pdfjs-dist/build/pdf.worker.min.mjs?raw';
import { parseSchedule } from './scheduleImport';

let workerUrl = null;
function ensureWorker() {
  if (!workerUrl) {
    workerUrl = URL.createObjectURL(new Blob([workerRaw], { type: 'text/javascript' }));
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  }
}

// group a page's text items into visual lines, join columns with commas
function pageToLines(textContent) {
  const rows = [];
  for (const it of textContent.items) {
    if (!it.str || !it.str.trim()) continue;
    const y = it.transform[5];
    const x = it.transform[4];
    let row = rows.find((r) => Math.abs(r.y - y) <= 3);
    if (!row) { row = { y, cells: [] }; rows.push(row); }
    row.cells.push({ x, w: it.width || 0, s: it.str });
  }
  rows.sort((a, b) => b.y - a.y); // top of page first
  return rows.map((r) => {
    r.cells.sort((a, b) => a.x - b.x);
    let line = '';
    let end = null;
    for (const c of r.cells) {
      if (end == null) line = c.s;
      else {
        const gap = c.x - end;
        line += gap > 10 ? ', ' : gap > 1 ? ' ' : '';
        line += c.s;
      }
      end = c.x + c.w;
    }
    return line;
  });
}

// file (File/Blob) → { rows, skipped } of session rows
export async function parsePdfSchedule(file) {
  ensureWorker();
  const data = await file.arrayBuffer();
  const task = pdfjsLib.getDocument({ data, isEvalSupported: false });
  const lines = [];
  try {
    const doc = await task.promise;
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      lines.push(...pageToLines(await page.getTextContent()));
    }
  } finally {
    task.destroy?.();
  }
  return parseSchedule(lines.join('\n'));
}
