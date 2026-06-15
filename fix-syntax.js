const fs = require('fs');
let server = fs.readFileSync('./server.js', 'utf8');

// Remove the duplicate totalChars block
const duplicate = `    // Check total character count before generating
    const totalChars = scenes.reduce((acc, s) => acc + s.narration.length, 0);
    console.log(\`[AUDIO] Total characters: \${totalChars}\`);
    if (totalChars > 9000) {
      console.warn('[AUDIO] WARNING: Character count high, some scenes may fail');
    }

    // Check total character count before generating
    const totalChars = scenes.reduce((acc, s) => acc + s.narration.length, 0);`;

const fixed = `    // Check total character count before generating
    const totalChars = scenes.reduce((acc, s) => acc + s.narration.length, 0);`;

if (server.includes(duplicate)) {
  server = server.replace(duplicate, fixed);
  fs.writeFileSync('./server.js', server);
  console.log('✅ Duplicate removed');
} else {
  // Try a simpler approach - just replace all const totalChars with let and deduplicate
  const lines = server.split('\n');
  let totalCharsFound = false;
  const cleaned = lines.filter(line => {
    if (line.includes('const totalChars = scenes.reduce')) {
      if (totalCharsFound) return false;
      totalCharsFound = true;
    }
    return true;
  }).join('\n');
  fs.writeFileSync('./server.js', cleaned);
  console.log('✅ Cleaned via line filter');
}
