// ─── PASTE THIS INTO YOUR n8n CODE NODE (after Claude node) ───────────────────
// This node: parses Claude JSON → calls render server → returns video URL

const rawText = $input.first().json.content[0].text;

// Parse Claude's scene spec JSON
let sceneSpec;
try {
  sceneSpec = JSON.parse(rawText);
} catch (e) {
  // Strip any accidental markdown fences
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  sceneSpec = JSON.parse(cleaned);
}

// Your render server URL (local) — ngrok will replace this
const RENDER_SERVER = 'http://localhost:3000/render';

// Call the render server
const renderResponse = await fetch(RENDER_SERVER, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    scenes: sceneSpec.scenes,
    video_title: sceneSpec.video_title,
  }),
});

const renderResult = await renderResponse.json();

if (!renderResult.success) {
  throw new Error('Render failed: ' + renderResult.error);
}

return [{
  json: {
    videoUrl: renderResult.url,
    videoTitle: sceneSpec.video_title,
    elapsed: renderResult.elapsed,
    pageId: $('Notion Trigger').first().json.id,
    sceneSpec,
  }
}];
