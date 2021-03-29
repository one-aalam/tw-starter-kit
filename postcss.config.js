const fs = require('fs')
const purgecss = require('@fullhuman/postcss-purgecss')({
  // Specify the paths to all of the template files in your project
  content: [
    './src/**/*.html',
    './src/**/*.svg',
    './src/**/*.js'
    // etc.
  ],
  fontFace: true,
  rejected: true,
  safelist: ['btn', 'card'],
  // Include any special characters you're using in this regular expression
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
})


module.exports = {
    plugins: [
      require('postcss-import')({
        path: ["src/styles"]
      }),
      require('tailwindcss'),
      require('postcss-nested'), // or require('postcss-nesting')
      require('postcss-font-magician')({}),
      require('postcss-reporter')({ clearMessages: true }),
      require('autoprefixer'),
      ...process.env.NODE_ENV === 'production'
      ? [purgecss]
      : [],
    ],
};