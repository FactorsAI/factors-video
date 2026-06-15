const fs = require('fs');
let server = fs.readFileSync('./src/Video.tsx', 'utf8');

const oldCode = `            style={{
              opacity: interpolate(progress, [0, 1], [0, 1]),
              transform: \`translateY(\${interpolate(progress, [0, 1], [14, 0])}px)\`,
              display: 'inline-block',
              color: isAccent ? BRAND.red : color,
              fontStyle: isAccent ? 'italic' : 'normal',
            }}`;

const newCode = `            style={{
              opacity: interpolate(progress, [0, 1], [0, 1]),
              transform: \`translateY(\${interpolate(progress, [0, 1], [14, 0])}px)\`,
              display: 'inline-block',
              color: isAccent ? BRAND.red : color,
              fontStyle: isAccent ? 'italic' : 'normal',
              position: 'relative',
            }}`;

if (server.includes(oldCode)) {
  // Add underline image after accent word span
  const oldSpan = `          >
            {word}
          </span>`;
  
  const newSpan = `          >
            {word}
            {isAccent && (
              <img
                src={staticFile('illustrations/underline-handdrawn.svg')}
                style={{
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: '100%',
                  height: 12,
                  opacity: interpolate(progress, [0, 1], [0, 0.7]),
                }}
              />
            )}
          </span>`;

  server = server.replace(oldCode, newCode).replace(oldSpan, newSpan);
  fs.writeFileSync('./src/Video.tsx', server);
  console.log('✅ Underline added to accent words');
} else {
  console.log('❌ Pattern not found');
}
