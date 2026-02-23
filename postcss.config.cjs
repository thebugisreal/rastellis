const breakpoints = {
  tablet: 768,
  desktop: 1440,
};


function fluid(min, max, minBp = 'tablet', maxBp = 'desktop') {
  const minBpVal = breakpoints[minBp];
  const maxBpVal = breakpoints[maxBp];
  const minVal = parseFloat(min);
  const maxVal = parseFloat(max);

  if (!minBpVal || !maxBpVal) {
    throw new Error(`Breakpoint ${minBp} or ${maxBp} not found.`);
  }

  const slope = ((maxVal - minVal) * 100) / (maxBpVal - minBpVal);
  const base = minVal - (slope * minBpVal) / 100;

  return `clamp(${minVal}px, ${base.toFixed(4)}px + ${slope.toFixed(4)}vw, ${maxVal}px)`;
}

module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-mixins'),
    require('postcss-flexbugs-fixes'),
    require('postcss-nested'),
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('postcss-preset-env')({ stage: 1, features: { 'nesting-rules': false } }),
    require('postcss-functions')({
      functions: {
        fluid,
      },
    }),
  ],
};