const fs = require('fs');
let server = fs.readFileSync('./server.js', 'utf8');

const oldCode = `const scenesWithAudio = await Promise.all(
      scenes.map(async (scene, i) => {
        const audioFilename = \`scene_\${Date.now()}_\${i}.mp3\`;
        try {
          await generateAudio(scene.narration, voiceId, audioFilename);
          const durationFrames = estimateDurationFrames(scene.narration);
          return { ...scene, audio_file: audioFilename, duration_frames: durationFrames };
        } catch (err) {
          console.error(\`[AUDIO] Failed scene \${i}:\`, err.message);
          return { ...scene, audio_file: null, duration_frames: estimateDurationFrames(scene.narration) };
        }
      })
    );`;

const newCode = `const scenesWithAudio = [];
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const audioFilename = \`scene_\${Date.now()}_\${i}.mp3\`;
      try {
        await generateAudio(scene.narration, voiceId, audioFilename);
        await new Promise(r => setTimeout(r, 800));
        const durationFrames = estimateDurationFrames(scene.narration);
        scenesWithAudio.push({ ...scene, audio_file: audioFilename, duration_frames: durationFrames });
      } catch (err) {
        console.error(\`[AUDIO] Failed scene \${i}:\`, err.message);
        scenesWithAudio.push({ ...scene, audio_file: null, duration_frames: estimateDurationFrames(scene.narration) });
      }
    }`;

server = server.replace(oldCode, newCode);
fs.writeFileSync('./server.js', server);
console.log('Fixed');
