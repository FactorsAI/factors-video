import { registerRoot, Composition } from 'remotion';
import React from 'react';
import { FactorsVideo, VideoProps } from './Video';

const Root: React.FC = () => {
  const defaultProps: VideoProps = {
    video_title: 'Preview',
    author: { name: 'Protim Bhaumik', photo: 'protim.png' },
    scenes: [
      {
        text: 'Your LinkedIn Ads budget is bleeding dry.',
        narration: 'Your LinkedIn Ads budget is bleeding dry. And the worst part? Most marketers have no idea why.',
        accent_words: ['bleeding'],
        background: 'yellow',
        illustration: null,
        illustration_position: null,
        show_logo: true,
        section_title: null,
        audio_file: null,
        duration_frames: 150,
      },
    ],
  };

  return (
    <Composition
      id="FactorsVideo"
      component={FactorsVideo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => {
        const TRANSITION_FRAMES = 8;
        const total = props.scenes.reduce(
          (acc, s) => acc + s.duration_frames - TRANSITION_FRAMES, 0
        ) + TRANSITION_FRAMES;
        return { durationInFrames: total };
      }}
    />
  );
};

registerRoot(Root);
