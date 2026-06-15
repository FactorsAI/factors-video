import { continueRender, delayRender, staticFile } from 'remotion';

export const loadFonts = () => {
  const handle = delayRender('Loading fonts');

  const fontBold = new FontFace(
    'STIXTwoText',
    `url(${staticFile('STIXTwoText-Bold.ttf')})`,
    { weight: '700', style: 'normal' }
  );

  const fontRegular = new FontFace(
    'STIXTwoText',
    `url(${staticFile('STIXTwoText-Regular.ttf')})`,
    { weight: '400', style: 'normal' }
  );

  Promise.all([
    fontBold.load().then((f) => document.fonts.add(f)),
    fontRegular.load().then((f) => document.fonts.add(f)),
  ]).then(() => {
    continueRender(handle);
  }).catch((err) => {
    console.error('Font load error:', err);
    continueRender(handle);
  });
};
