const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const mm = require('music-metadata');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = path.join(__dirname, 'output');
const AUDIO_DIR = path.join(__dirname, 'public', 'audio');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

// ─── ElevenLabs config ────────────────────────────────────────────────────────
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'YOUR_ELEVENLABS_API_KEY';

// Author → voice mapping
const AUTHOR_VOICES = {
  'protim': 'pNInz6obpgDQGcFmaJgB',   // Adam — professional male
  'vrushti': 'ncqstkprzufCyqAlSeHr',  // Vrushti Oza — cloned voice
  'default': 'pNInz6obpgDQGcFmaJgB',  // Adam fallback
};

// Author → photo mapping
const AUTHOR_PHOTOS = {
  'protim bhaumik': 'protim.png',
  'vrushti oza': 'vrushti.png',
  'default': 'protim.png',
};

// ─── Generate audio via ElevenLabs ───────────────────────────────────────────
async function generateAudio(text, voiceId, filename) {
  return new Promise((resolve, reject) => {
    const audioPath = path.join(AUDIO_DIR, filename);

    // Skip if already exists
    if (fs.existsSync(audioPath)) {
      console.log(`[AUDIO] Using cached: ${filename}`);
      return resolve(filename);
    }

    console.log(`[AUDIO] Generating: ${filename}`);

    const body = JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errData = '';
        res.on('data', (d) => errData += d);
        res.on('end', () => reject(new Error(`ElevenLabs error ${res.statusCode}: ${errData}`)));
        return;
      }
      const file = fs.createWriteStream(audioPath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(filename); });
      file.on('error', reject);
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Estimate audio duration from text ───────────────────────────────────────
function estimateDurationFrames(text, fps = 30) {
  const words = text.split(' ').length;
  const wordsPerMinute = 150;
  const seconds = (words / wordsPerMinute) * 60;
  const paddedSeconds = seconds + 0.8;
  return Math.ceil(paddedSeconds * fps);
}

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'factors-video-v2' });
});

// ─── Render endpoint ──────────────────────────────────────────────────────────
app.post('/render', async (req, res) => {
  const startTime = Date.now();
  console.log('\n[RENDER] New request received');

  try {
    const { scenes, video_title, author } = req.body;

    if (!scenes || !Array.isArray(scenes)) {
      return res.status(400).json({ error: 'scenes array is required' });
    }

    console.log(`[RENDER] "${video_title}" — ${scenes.length} scenes — author: ${author?.name}`);

    // Resolve author
    const authorKey = (author?.name || 'default').toLowerCase();
    const voiceId = AUTHOR_VOICES[authorKey.split(' ')[0]] || AUTHOR_VOICES.default;
    const photoFile = AUTHOR_PHOTOS[authorKey] || AUTHOR_PHOTOS.default;

    const resolvedAuthor = {
      name: author?.name || 'Factors.ai',
      photo: photoFile,
    };

    // Check total character count before generating
    const totalChars = scenes.reduce((acc, s) => acc + s.narration.length, 0);
    console.log(`[AUDIO] Total characters needed: ${totalChars}`);

    // Check ElevenLabs quota before starting
    try {
      const quotaCheck = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.elevenlabs.io',
          path: '/v1/user/subscription',
          method: 'GET',
          headers: { 'xi-api-key': ELEVENLABS_API_KEY },
        };
        const req = require('https').request(options, (res) => {
          let data = '';
          res.on('data', d => data += d);
          res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.end();
      });
      const remaining = quotaCheck.character_limit - quotaCheck.character_count;
      console.log(`[AUDIO] ElevenLabs quota remaining: ${remaining} chars`);
      if (remaining < totalChars) {
        console.error(`[AUDIO] QUOTA TOO LOW: need ${totalChars}, have ${remaining}`);
        return res.status(400).json({ 
          error: `ElevenLabs quota too low. Need ${totalChars} chars, only ${remaining} remaining.`
        });
      }
    } catch (err) {
      console.warn('[AUDIO] Could not check quota:', err.message);
    }

    // Check total character count before generating
    console.log(`[AUDIO] Total characters needed: ${totalChars}`);

    // Check ElevenLabs quota before starting
    try {
      const quotaCheck = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.elevenlabs.io',
          path: '/v1/user/subscription',
          method: 'GET',
          headers: { 'xi-api-key': ELEVENLABS_API_KEY },
        };
        const req = require('https').request(options, (res) => {
          let data = '';
          res.on('data', d => data += d);
          res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.end();
      });
      const remaining = quotaCheck.character_limit - quotaCheck.character_count;
      console.log(`[AUDIO] ElevenLabs quota remaining: ${remaining} chars`);
      if (remaining < totalChars) {
        console.error(`[AUDIO] QUOTA TOO LOW: need ${totalChars}, have ${remaining}`);
        return res.status(400).json({ 
          error: `ElevenLabs quota too low. Need ${totalChars} chars, only ${remaining} remaining.`
        });
      }
    } catch (err) {
      console.warn('[AUDIO] Could not check quota:', err.message);
    }

    // Generate audio for each scene
    console.log(`[AUDIO] Generating ${scenes.length} audio files...`);
    // Sequential audio generation to avoid rate limits
const scenesWithAudio = [];
for (let i = 0; i < scenes.length; i++) {
  const scene = scenes[i];
  const audioFilename = `scene_${Date.now()}_${i}.mp3`;
  try {
    await generateAudio(scene.narration, voiceId, audioFilename);
    await new Promise(r => setTimeout(r, 500));
    let durationFrames;
    try {
      const audioPath = path.join(AUDIO_DIR, audioFilename);
      const metadata = await mm.parseFile(audioPath);
      const durationSeconds = metadata.format.duration || 0;
      durationFrames = Math.ceil((durationSeconds + 1.5) * 30);
      console.log(`[AUDIO] Scene ${i} duration: ${durationSeconds.toFixed(1)}s → ${durationFrames} frames`);
    } catch (err) {
      console.error('[AUDIO] Duration parse failed:', err.message);
      durationFrames = estimateDurationFrames(scene.narration);
    }
    scenesWithAudio.push({ ...scene, audio_file: audioFilename, duration_frames: durationFrames });
  } catch (err) {
    console.error(`[AUDIO] Failed scene ${i}:`, err.message);
    scenesWithAudio.push({ ...scene, audio_file: null, duration_frames: estimateDurationFrames(scene.narration) });
  }
}
if (false) Promise.all(
      scenes.map(async (scene, i) => {
        const audioFilename = `scene_${Date.now()}_${i}.mp3`;
        try {
          await generateAudio(scene.narration, voiceId, audioFilename);
          const durationFrames = estimateDurationFrames(scene.narration);
          return { ...scene, audio_file: audioFilename, duration_frames: durationFrames };
        } catch (err) {
          console.error(`[AUDIO] Failed scene ${i}:`, err.message);
          return { ...scene, audio_file: null, duration_frames: estimateDurationFrames(scene.narration) };
        }
      })
    );

    // Bundle and render
    const { bundle } = await import('@remotion/bundler');
    const { renderMedia, selectComposition } = await import('@remotion/renderer');

    console.log('[RENDER] Bundling...');
    const bundleLocation = await bundle({
      entryPoint: path.resolve(__dirname, 'src/index.tsx'),
      webpackOverride: (config) => config,
    });

    const TRANSITION_FRAMES = 8;
    const totalFrames = scenesWithAudio.reduce(
      (acc, s) => acc + s.duration_frames - TRANSITION_FRAMES, 0
    ) + TRANSITION_FRAMES;

    const inputProps = {
      scenes: scenesWithAudio,
      video_title,
      author: resolvedAuthor,
    };

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'FactorsVideo',
      inputProps,
    });

    const fileName = `video_${Date.now()}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    console.log('[RENDER] Rendering video...');
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
      chromiumOptions: { disableWebSecurity: true },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[RENDER] Done in ${elapsed}s → ${fileName}`);

    res.json({
      success: true,
      url: `http://localhost:${PORT}/videos/${fileName}`,
      fileName,
      elapsed: `${elapsed}s`,
    });

  } catch (err) {
    console.error('[RENDER] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.use('/videos', express.static(OUTPUT_DIR));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`\n✅ Factors Video Renderer v2 running on http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/render`);
  console.log(`   GET  http://localhost:${PORT}/\n`);
});
