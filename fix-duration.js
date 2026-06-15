const fs = require('fs');
let server = fs.readFileSync('./server.js', 'utf8');

// Add import at top
server = server.replace(
  "const https = require('https');",
  "const https = require('https');\nconst mm = require('music-metadata');"
);

// Replace estimateDurationFrames call with actual duration measurement
const oldCode = `        await new Promise(r => setTimeout(r, 800));
        const durationFrames = estimateDurationFrames(scene.narration);
        scenesWithAudio.push({ ...scene, audio_file: audioFilename, duration_frames: durationFrames });`;

const newCode = `        await new Promise(r => setTimeout(r, 800));
        // Measure actual audio duration
        let durationFrames;
        try {
          const audioPath = path.join(AUDIO_DIR, audioFilename);
          const metadata = await mm.parseFile(audioPath);
          const durationSeconds = metadata.format.duration || 0;
          // Add 1.5 second padding after audio ends
          durationFrames = Math.ceil((durationSeconds + 1.5) * 30);
          console.log(\`[AUDIO] Scene \${i} duration: \${durationSeconds.toFixed(1)}s → \${durationFrames} frames\`);
        } catch (err) {
          durationFrames = estimateDurationFrames(scene.narration);
        }
        scenesWithAudio.push({ ...scene, audio_file: audioFilename, duration_frames: durationFrames });`;

server = server.replace(oldCode, newCode);
fs.writeFileSync('./server.js', server);
console.log('Duration fix applied');
