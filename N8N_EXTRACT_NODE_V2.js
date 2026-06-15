// ─── ALSO UPDATE YOUR TEXT EXTRACTION Code node ──────────────────────────────
// Add author detection to the existing extraction node

const html = $input.first().json.data;

let clean = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<nav[\s\S]*?<\/nav>/gi, '')
  .replace(/<footer[\s\S]*?<\/footer>/gi, '')
  .replace(/<header[\s\S]*?<\/header>/gi, '')
  .replace(/<!--[\s\S]*?-->/gi, '');

const articleMatch = clean.match(/<article[\s\S]*?<\/article>/i) ||
                     clean.match(/<main[\s\S]*?<\/main>/i) ||
                     clean.match(/class="[^"]*blog[^"]*"[\s\S]*?<\/div>/i) ||
                     clean.match(/class="[^"]*post[^"]*"[\s\S]*?<\/div>/i);

let articleHtml = articleMatch ? articleMatch[0] : clean;

let text = articleHtml
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\s{2,}/g, ' ')
  .trim();

// Extract author name
let author = 'Factors.ai';
const authorPatterns = [
  /written by\s+([A-Z][a-z]+ [A-Z][a-z]+)/i,
  /by\s+([A-Z][a-z]+ [A-Z][a-z]+)/i,
  /author[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
];
for (const pattern of authorPatterns) {
  const match = text.match(pattern);
  if (match) { author = match[1]; break; }
}

text = text.substring(0, 15000);

return [{
  json: {
    text,
    author,
    blogUrl: $('Notion Trigger').first().json['Blog URL'],
    pageId: $('Notion Trigger').first().json.id,
  }
}];
