const fs = require('fs');
let server = fs.readFileSync('./server.js', 'utf8');

const oldCode = `    // Check total character count before generating
    const totalChars = scenes.reduce((acc, s) => acc + s.narration.length, 0);
    console.log(\`[AUDIO] Total characters: \${totalChars}\`);
    if (totalChars > 9000) {
      console.warn('[AUDIO] WARNING: Character count high, some scenes may fail');
    }`;

const newCode = `    // Check total character count before generating
    const totalChars = scenes.reduce((acc, s) => acc + s.narration.length, 0);
    console.log(\`[AUDIO] Total characters needed: \${totalChars}\`);

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
      console.log(\`[AUDIO] ElevenLabs quota remaining: \${remaining} chars\`);
      if (remaining < totalChars) {
        console.error(\`[AUDIO] QUOTA TOO LOW: need \${totalChars}, have \${remaining}\`);
        return res.status(400).json({ 
          error: \`ElevenLabs quota too low. Need \${totalChars} chars, only \${remaining} remaining.\`
        });
      }
    } catch (err) {
      console.warn('[AUDIO] Could not check quota:', err.message);
    }`;

if (server.includes(oldCode)) {
  server = server.replace(oldCode, newCode);
  fs.writeFileSync('./server.js', server);
  console.log('✅ Quota check added');
} else {
  console.log('❌ Pattern not found');
}
