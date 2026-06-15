// ─── PASTE THIS INTO YOUR n8n Code node (after Claude node) ──────────────────
// Parses Claude scene spec and serializes for render server

const rawText = $input.first().json.content[0].text;
const pageId = $('Notion Trigger').first().json.id;

// Get author from blog text extraction node
// Claude will detect it automatically from the blog content
let sceneSpec;
try {
  sceneSpec = JSON.parse(rawText);
} catch (e) {
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  sceneSpec = JSON.parse(cleaned);
}

return [{
  json: {
    renderPayload: JSON.stringify({
      scenes: sceneSpec.scenes,
      video_title: sceneSpec.video_title,
      author: {
        name: sceneSpec.author || 'Factors.ai',
      },
    }),
    pageId: pageId,
    video_title: sceneSpec.video_title,
  }
}];
