const fs = require('fs');
let server = fs.readFileSync('./server.js', 'utf8');

const oldCode = `    // Generate audio for each scene
    console.log(\`[AUDIO] Generating \${scenes.length} audio files...\`);`;

const newCode = `    // Check total character count before generating
    const totalChars = scenes.reduce((acc, s) => acc + s.narration.length, 0);
    console.log(\`[AUDIO] Total characters: \${totalChars}\`);
    if (totalChars > 9000) {
      console.warn('[AUDIO] WARNING: Character count high, some scenes may fail');
    }

    // Generate audio for each scene
    console.log(\`[AUDIO] Generating \${scenes.length} audio files...\`);`;

if (server.includes(oldCode)) {
  server = server.replace(oldCode, newCode);
  fs.writeFileSync('./server.js', server);
  console.log('✅ Character count check added');
} else {
  console.log('❌ Pattern not found');
}
