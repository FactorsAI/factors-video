import React, { useEffect } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Sequence,
  Audio,
  Img,
} from 'remotion';
import { loadFonts } from './loadFonts';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Scene {
  text: string;
  narration: string;
  accent_words: string[];
  background: 'paper' | 'yellow' | 'teal_bg';
  illustration: string | null;
  illustration_position: 'left' | 'right' | 'center' | 'corner' | null;
  show_logo: boolean;
  section_title: string | null;
  audio_file: string | null;
  duration_frames: number;
}

export interface Author {
  name: string;
  photo: string;
}

export interface VideoProps {
  scenes: Scene[];
  video_title: string;
  author: Author;
}

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  paper: '#FFFEFB',
  yellow: '#FFF020',
  teal: '#AEFFEA',
  black: '#080808',
  red: '#FF2020',
  muted: '#555555',
};

const BG_MAP: Record<string, string> = {
  paper: BRAND.paper,
  yellow: BRAND.yellow,
  teal_bg: BRAND.teal,
  green: '#AEFFD4',
};

const BG_TEXTURE: Record<string, string | null> = {
  paper: null,
  yellow: staticFile('bg-yellow.png'),
  teal_bg: staticFile('bg-teal.png'),
  green: staticFile('bg-green.png'),
};

const ILLUSTRATION_MAP: Record<string, string> = {
  boat: staticFile('illustrations/boat.svg'),
  lighthouse: staticFile('illustrations/lighthouse.svg'),
  'lighthouse-2': staticFile('illustrations/lighthouse-2.svg'),
  support: staticFile('illustrations/support.svg'),
  'creative-2': staticFile('illustrations/creative-2.svg'),
  'creative-3': staticFile('illustrations/creative-3.svg'),
  'mark-red': staticFile('illustrations/mark-red.svg'),
  'creative-1': staticFile('illustrations/creative-1.svg'),
  'creative-4': staticFile('illustrations/creative-4.svg'),
  'lighthouse-3': staticFile('illustrations/lighthouse-3.svg'),
  'creative-1': staticFile('illustrations/creative-1.svg'),
  'creative-4': staticFile('illustrations/creative-4.svg'),
  'lighthouse-3': staticFile('illustrations/lighthouse-3.svg'),
};

const LOGO = staticFile('illustrations/logo-primary.svg');

// ─── Author circle ────────────────────────────────────────────────────────────

const AuthorCircle: React.FC<{ author: Author; startFrame: number }> = ({
  author,
  startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 60, mass: 0.6 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.7, 1]);

  const photoSrc = staticFile(`authors/${author.photo}`);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 56,
        left: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'bottom left',
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `4px solid ${BRAND.black}`,
          flexShrink: 0,
        }}
      >
        <Img
          src={photoSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
        />
      </div>
      <div>
        <div
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 22,
            fontWeight: 600,
            color: BRAND.black,
            lineHeight: 1.2,
          }}
        >
          {author.name}
        </div>
        <div
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 18,
            color: BRAND.muted,
            lineHeight: 1.2,
            marginTop: 2,
          }}
        >
          Factors.ai
        </div>
      </div>
    </div>
  );
};

// ─── Section title card ───────────────────────────────────────────────────────

const SectionTitle: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - 4,
    fps,
    config: { damping: 20, stiffness: 80, mass: 0.5 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 56,
        left: 64,
        right: 64,
        opacity: interpolate(progress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(progress, [0, 1], [-12, 0])}px)`,
      }}
    >
      <div
        style={{
          display: 'inline-block',
          fontFamily: '"Inter", sans-serif',
          fontSize: 22,
          fontWeight: 600,
          color: BRAND.red,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          borderBottom: `3px solid ${BRAND.red}`,
          paddingBottom: 4,
        }}
      >
        {title}
      </div>
    </div>
  );
};

// ─── Animated text ────────────────────────────────────────────────────────────

const AnimatedText: React.FC<{
  text: string;
  accentWords: string[];
  fontSize: number;
  color: string;
  startFrame: number;
}> = ({ text, accentWords, fontSize, color, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  const staggerFrames = 3;

  return (
    <div
      style={{
        fontFamily: '"STIXTwoText", Georgia, serif',
        fontSize,
        fontWeight: 400,
        lineHeight: 1.2,
        textAlign: 'center',
        color,
        letterSpacing: '-0.01em',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.22em',
        padding: '0 160px',
      }}
    >
      {words.map((word, i) => {
        const wordStart = startFrame + i * staggerFrames;
        const progress = spring({
          frame: frame - wordStart,
          fps,
          config: { damping: 20, stiffness: 80, mass: 0.5 },
        });
        const isAccent = accentWords.some(
          (a) => word.toLowerCase().replace(/[.,!?]/g, '') === a.toLowerCase()
        );
        return (
          <span
            key={i}
            style={{
              opacity: interpolate(progress, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(progress, [0, 1], [14, 0])}px)`,
              display: 'inline-block',
              color: isAccent ? BRAND.red : color,
              fontStyle: isAccent ? 'italic' : 'normal',
              position: 'relative',
            }}
          >
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
          </span>
        );
      })}
    </div>
  );
};

// ─── Illustration ─────────────────────────────────────────────────────────────

const IllustrationEl: React.FC<{
  src: string;
  position: string;
  startFrame: number;
}> = ({ src, position, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 25, stiffness: 60, mass: 0.8 },
  });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.85, 1]);

  const positionStyles: Record<string, React.CSSProperties> = {
    left: { position: 'absolute', left: 60, top: '50%', transform: `translateY(-50%) scale(${scale})`, width: 260, opacity },
    right: { position: 'absolute', right: 60, top: '50%', transform: `translateY(-50%) scale(${scale})`, width: 260, opacity },
    center: { position: 'absolute', top: 60, left: '50%', transform: `translateX(-50%) scale(${scale})`, width: 180, opacity },
    corner: { position: 'absolute', top: 56, right: 56, width: 100, transform: `scale(${scale})`, opacity, transformOrigin: 'top right' },
  };

  return <img src={src} style={positionStyles[position] || positionStyles.center} alt="" />;
};

// ─── Single scene ─────────────────────────────────────────────────────────────

const SceneComponent: React.FC<{ scene: Scene; author: Author }> = ({ scene, author }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const bgColor = BG_MAP[scene.background] || BRAND.paper;
  const bgTexture = BG_TEXTURE[scene.background];
  const illustrationSrc = scene.illustration && ILLUSTRATION_MAP[scene.illustration]
    ? ILLUSTRATION_MAP[scene.illustration] : null;

  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const textLength = scene.text.length;
  const fontSize =
    textLength < 30 ? 100 :
    textLength < 50 ? 82 :
    textLength < 70 ? 68 :
    textLength < 90 ? 56 : 48;

  const hasLeftIllo = illustrationSrc && scene.illustration_position === 'left';
  const hasRightIllo = illustrationSrc && scene.illustration_position === 'right';

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, opacity: fadeOut }}>
      {bgTexture && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${bgTexture})`,
          backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12,
        }} />
      )}

      {scene.audio_file && <Audio src={staticFile(`audio/${scene.audio_file}`)} />}

      {illustrationSrc && scene.illustration_position && (
        <IllustrationEl src={illustrationSrc} position={scene.illustration_position} startFrame={0} />
      )}

      {scene.section_title && <SectionTitle title={scene.section_title} />}

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingLeft: hasLeftIllo ? 340 : 0,
        paddingRight: hasRightIllo ? 340 : 0,
        paddingTop: scene.section_title ? 80 : 0,
        paddingBottom: 160,
      }}>
        <AnimatedText
          text={scene.text}
          accentWords={scene.accent_words}
          fontSize={fontSize}
          color={BRAND.black}
          startFrame={4}
        />
      </div>

      <AuthorCircle author={author} startFrame={6} />

      {scene.show_logo && (
        <img
          src={LOGO}
          style={{
            position: 'absolute', bottom: 56, right: 56, width: 140,
            opacity: interpolate(frame, [8, 20], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            }),
          }}
          alt="Factors.ai"
        />
      )}
    </AbsoluteFill>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────

const TRANSITION_FRAMES = 8;

export const FactorsVideo: React.FC<VideoProps> = ({ scenes, author }) => {
  useEffect(() => { loadFonts(); }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.paper }}>
      {scenes.map((scene, i) => {
        const start = scenes
          .slice(0, i)
          .reduce((acc, s) => acc + s.duration_frames - TRANSITION_FRAMES, 0);
        return (
          <Sequence key={i} from={start} durationInFrames={scene.duration_frames}>
            <SceneComponent scene={scene} author={author} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
