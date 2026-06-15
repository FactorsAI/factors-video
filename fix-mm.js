const fs = require('fs');
let server = fs.readFileSync('./server.js', 'utf8');

// Replace music-metadata import with a simple MP3 duration reader
server = server.replace(
  "const mm = require('music-metadata');",
  `// Simple MP3 duration reader without external dependency
const getMP3Duration = (filePath) => {
  return new Promise((resolve) => {
    try {
      const buffer = fs.readFileSync(filePath);
      // Read MP3 header to estimate duration
      let duration = 0;
      let offset = 0;
      let frameCount = 0;
      while (offset < buffer.length - 4) {
        if (buffer[offset] === 0xFF && (buffer[offset+1] & 0xE0) === 0xE0) {
          const bitrateIndex = (buffer[offset+2] >> 4) & 0xF;
          const sampleRateIndex = (buffer[offset+2] >> 2) & 0x3;
          const bitrates = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0];
          const sampleRates = [44100,48000,32000,0];
          const bitrate = bitrates[bitrateIndex] * 1000;
          const sampleRate = sampleRates[sampleRateIndex];
          if (bitrate > 0 && sampleRate > 0) {
            const frameSize = Math.floor(144 * bitrate / sampleRate) + ((buffer[offset+2] >> 1) & 1);
            frameCount++;
            offset += frameSize;
            duration += 1152 / sampleRate;
          } else { offset++; }
        } else { offset++; }
      }
      resolve(duration > 0 ? duration : null);
    } catch(e) { resolve(null); }
  });
};`
);

// Replace mm.parseFile usage
server = server.replace(
  `const metadata = await mm.parseFile(audioPath);
          const durationSeconds = metadata.format.duration || 0;`,
  `const durationSeconds = await getMP3Duration(audioPath) || 0;`
);

fs.writeFileSync('./server.js', server);
console.log('✅ Fixed music-metadata dependency');
