import { registerRoot, Composition } from 'remotion';
import React from 'react';
import { FactorsVideo, VideoProps } from './Video';

const SCENE_DURATION_FRAMES = 90;
const TRANSITION_FRAMES = 10;

const Root: React.FC = () => {
  const defaultProps: VideoProps = {
    video_title: 'Preview',
    scenes: [
      {
        text: 'Your LinkedIn Ads budget is leaking.',
        accent_words: ['leaking'],
        background: 'paper',
        illustration: 'lighthouse',
        illustration_position: 'left',
        show_logo: false,
      },
      {
        text: "LinkedIn Ads aren't broken. Your strategy is.",
        accent_words: ['broken'],
        background: 'paper',
        illustration: null,
        illustration_position: null,
        show_logo: false,
      },
      {
        text: 'Stop selling. Start building demand first.',
        accent_words: ['selling'],
        background: 'yellow',
        illustration: null,
        illustration_position: null,
        show_logo: false,
      },
      {
        text: 'Cookie-based retargeting misses the buying committee.',
        accent_words: ['misses'],
        background: 'paper',
        illustration: 'support',
        illustration_position: 'right',
        show_logo: false,
      },
      {
        text: 'Intent data reveals who is actively shopping.',
        accent_words: ['actively'],
        background: 'paper',
        illustration: null,
        illustration_position: null,
        show_logo: false,
      },
      {
        text: 'Spend smarter, not more. Fix the leaks.',
        accent_words: ['smarter'],
        background: 'yellow',
        illustration: null,
        illustration_position: null,
        show_logo: true,
      },
    ],
  };

  const totalScenes = defaultProps.scenes.length;
  const totalFrames =
    totalScenes * SCENE_DURATION_FRAMES -
    (totalScenes - 1) * TRANSITION_FRAMES;

  return (
    <Composition
      id="FactorsVideo"
      component={FactorsVideo}
      durationInFrames={totalFrames}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => {
        const n = props.scenes.length;
        return {
          durationInFrames:
            n * SCENE_DURATION_FRAMES - (n - 1) * TRANSITION_FRAMES,
        };
      }}
    />
  );
};

registerRoot(Root);
