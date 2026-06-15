const fs = require('fs');
let server = fs.readFileSync('./server.js', 'utf8');

const oldCode = `        await generateAudio(scene.narration, voiceId, audioFilename);
        await new Promise(r => setTimeout(r, 500));
        const durationFrames = estimateDurationFrames(scene.narration);
        scenesWithAudio.push({ ...scene, audio_file: audioFilename, duration_frames: durationFrames });`;

const newCode = `        await generateAudio(scene.narration, voiceId, audioFilename);
        await new Promise(r => setTimeout(r, 500));
        let durationFrames;
        try {
          const audioPath = path.join(AUDIO_DIR, audioFilename);
          const metadata = await mm.parseFile(audioPath);
          const durationSeconds = metadata.format.duration || 0;
          durationFrames = Math.ceil((durationSeconds + 1.5) * 30);
          console.log(\`[AUDIO] Scene \${i} duration: \${durationSeconds.toFixed(1)}s → \${durationFrames} frames\`);
        } catch (err) {
          console.error('[AUDIO] Duration parse failed:', err.message);
          durationFrames = estimateDurationFrames(scene.narration);
        }
        scenesWithAudio.push({ ...scene, audio_file: audioFilename, duration_frames: durationFrames });`;

if (server.includes('await generateAudio(scene.narration, voiceId, audioFilename);\n        await new Promise(r => setTimeout(r, 500));\n        const durationFrames')) {
  server = server.replace(oldCode, newCode);
  fs.writeFileSync('./server.js', server);
  console.log('✅ Duration fix applied successfully');
} else {
  console.log('❌ Still not matching');
}
