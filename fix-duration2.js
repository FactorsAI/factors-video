const fs = require('fs');
let server = fs.readFileSync('./server.js', 'utf8');

const oldCode = `        await new Promise(r => setTimeout(r, 800));
        const durationFrames = estimateDurationFrames(scene.narration);
        scenesWithAudio.push({ ...scene, audio_file: audioFilename, duration_frames: durationFrames });`;

const newCode = `        await new Promise(r => setTimeout(r, 800));
        let durationFrames;
        try {
          const audioPath = path.join(AUDIO_DIR, audioFilename);
          const metadata = await mm.parseFile(audioPath);
          const durationSeconds = metadata.format.duration || 0;
          durationFrames = Math.ceil((durationSeconds + 1.5) * 30);
          console.log(\`[AUDIO] Scene \${i} duration: \${durationSeconds.toFixed(1)}s → \${durationFrames} frames\`);
        } catch (err) {
          console.error('[AUDIO] Duration parse failed, using estimate:', err.message);
          durationFrames = estimateDurationFrames(scene.narration);
        }
        scenesWithAudio.push({ ...scene, audio_file: audioFilename, duration_frames: durationFrames });`;

if (server.includes('estimateDurationFrames(scene.narration);\n        scenesWithAudio.push')) {
  server = server.replace(oldCode, newCode);
  fs.writeFileSync('./server.js', server);
  console.log('✅ Duration fix applied successfully');
} else {
  console.log('❌ Pattern not found — printing relevant section:');
  const idx = server.indexOf('scenesWithAudio.push');
  console.log(server.substring(idx - 200, idx + 200));
}
