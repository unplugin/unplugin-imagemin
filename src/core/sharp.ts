import sharp from 'sharp';

async function initSharp() {
  sharp('./wallhaven.jpg')
    .rotate()
    .resize(200)
    .jpeg({ mozjpeg: true })
    .toBuffer();
}
export function loadImage(url: string) {
  return sharp(decodeURIComponent(parseURL(url).pathname));
}
function parseURL(rawURL: string) {
  return new URL(rawURL.replace(/#/g, '%23'), 'file://');
}
export default initSharp;
