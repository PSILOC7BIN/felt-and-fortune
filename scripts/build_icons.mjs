// Renders the Felt & Fortune logo into the PNG icons the iPhone/Android apps and the home-screen web app need.
// iOS masks the corners itself, so app icons are full-bleed squares with no transparency.
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const full = (pad = 0) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A84FF"/><stop offset="1" stop-color="#5E5CE6"/></linearGradient></defs><rect width="48" height="48" fill="url(#g)"/><g transform="translate(24 24) scale(${1 - pad}) translate(-24 -24)"><path d="M24 8.5C19.5 15 11.5 18.5 11.5 26c0 6.5 8 9 12.5 3.6C28.5 35 36.5 32.5 36.5 26 36.5 18.5 28.5 15 24 8.5Z" fill="#fff"/><path d="M24 27.5c0 7-2.6 9.8-6 11.5h12c-3.4-1.7-6-4.5-6-11.5Z" fill="#fff"/></g></svg>`);

const out = [
  ['ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', 1024, 0.08],
  ['public/icons/apple-touch-icon.png', 180, 0.08],
  ['public/icons/icon-192.png', 192, 0.08],
  ['public/icons/icon-512.png', 512, 0.08],
  ['public/icons/maskable-512.png', 512, 0.28],
];
for (const [file, size, pad] of out) {
  await sharp(full(pad), { density: 1200 }).resize(size, size).flatten({ background: '#0A84FF' }).png().toFile(file);
  console.log('wrote', file, size);
}
