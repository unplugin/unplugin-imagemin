import sharp from 'sharp';

async function initSharp(input, output) {
  sharp(input).webp({ quality: 100 }).toFile(output);
}
export function loadImage(url: string) {
  return sharp(decodeURIComponent(parseURL(url).pathname));
}
function parseURL(rawURL: string) {
  return new URL(rawURL.replace(/#/g, '%23'), 'file://');
}
export default initSharp;
