import Color from 'color';

export const generatePalette = (scheme, baseColor, count) => {
  const color = Color(baseColor);
  let colors = [];

  switch (scheme) {
    case 'monochromatic':
      colors = generateMonochromatic(color, count);
      break;
    case 'analogous':
      colors = generateAnalogous(color, count);
      break;
    case 'complementary':
      colors = generateComplementary(color, count);
      break;
    case 'split_complementary':
      colors = generateSplitComplementary(color, count);
      break;
    case 'triadic':
      colors = generateTriadic(color, count);
      break;
    case 'square':
      colors = generateSquare(color, count);
      break;
    case 'rectangle':
      colors = generateTetradic(color, count);
      break;
    default:
      colors = Array(count).fill(baseColor);
  }

  return colors;
};

const generateMonochromatic = (color, count) => {
  let palette = [];
  for (let i = 0; i < count; i++) {
    palette.push(color.lightness((i / count) * 100).hex());
  }
  return palette;
};

const generateAnalogous = (color, count) => {
  let palette = [];
  const angle = 30;
  for (let i = 0; i < count; i++) {
    palette.push(color.rotate(i * angle).hex());
  }
  return palette;
};

const generateComplementary = (color) => {
  return [color.hex(), color.rotate(180).hex()];
};

const generateSplitComplementary = (color) => {
  return [color.hex(), color.rotate(150).hex(), color.rotate(-150).hex()];
};

const generateTriadic = (color) => {
  return [color.hex(), color.rotate(120).hex(), color.rotate(240).hex()];
};

const generateSquare = (color) => {
  return [color.hex(), color.rotate(90).hex(), color.rotate(180).hex(), color.rotate(270).hex()];
};

const generateTetradic = (color) => {
  return [color.hex(), color.rotate(60).hex(), color.rotate(180).hex(), color.rotate(240).hex()];
};
