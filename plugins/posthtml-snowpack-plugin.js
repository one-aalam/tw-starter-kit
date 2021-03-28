const fs = require('fs')
const path = require('path')
const posthtml = require('posthtml')

const INCLUDE_REGEX = /<include[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/g;
const SOURCE_DIR = 'src'
const PARTIALS_DIR = 'partials';

const locals = require('../data/data.json');

// config reference: https://github.com/snowpackjs/snowpack/blob/main/plugins/plugin-sass/plugin.js
const render = async (filePath, pluginOptions, isDev) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, { encoding: 'utf-8' }, (err, html) => {
        if (err) {
          reject(err);
        } else {
          const htmlIncludes = [];
          if (isDev) {
            const htmlIncludeMatches = html.matchAll(new RegExp(INCLUDE_REGEX));
            let currHtmlIncludeResult = htmlIncludeMatches.next();
            while (!currHtmlIncludeResult.done) {
              htmlIncludes.push(currHtmlIncludeResult.value[1]); 
              currHtmlIncludeResult = htmlIncludeMatches.next();
            }
          }
          const result = posthtml()
            // .use(require('posthtml-img-autosize')({root: 'src/assets/img'}))
            .use(require('posthtml-include')({ root: SOURCE_DIR }))
            .use(require('posthtml-extend')({
              encoding: 'utf8', // Parent template encoding (default: 'utf8')
              root: path.join(SOURCE_DIR, PARTIALS_DIR) // Path to parent template directory (default: './')
            }))
            .use(require('posthtml-expressions')({
              locals: {
                ...locals
                // put other local properties
              }
            }))
            .use(require('posthtml-lorem')({}))
            .process(html, { sync: true })
            .html
          resolve([result, htmlIncludes])
        }
      });
    });
};


module.exports = function (snowpackConfig, pluginOptions) {
    const includedByMap = new Map(); // Map of all the partials

    /**
     * Add file that needs to trigger an update based on its constituents file
     * 
     * @param {string} filePath Takes the partial's relative path to use as a key
     * @param {*} htmlInclude Takes the file that includes the partial
     */
    function addIncludesToMap(filePath, htmlInclude) {
      const includedBy = includedByMap.get(htmlInclude);
      if (includedBy) {
        includedBy.add(filePath);
      } else {
        includedByMap.set(htmlInclude, new Set([filePath]));
      }
    }
  
    return {
      name: 'posthtml-snowpack-plugin',
      resolve: {
        input: ['.html'],
        output: ['.html'],
      },
      async load({ filePath, isDev }) {
        try {
            const [ result, htmlIncludes ] = await render(filePath, pluginOptions, isDev)
            if (isDev) {
              htmlIncludes.forEach((htmlInclude) => addIncludesToMap(filePath, htmlInclude));
            }
            return {
                '.html': result
            }
        } catch(err) {
            console.error(err);
        }
      },
      _markIncluderAsChanged(filePath) {
        if (includedByMap.has(filePath)) {
          const includedBy = includedByMap.get(filePath);
          // includedByMap.delete(filePath);
          for (const includerFilePath of includedBy) {
            this.markChanged(includerFilePath);
          }
        }
      },
      onChange({filePath}) {
        const isHTMLPartial = path.basename(filePath).startsWith('_') && path.extname(filePath) === '.html'
        if (isHTMLPartial) {
          this._markIncluderAsChanged(`${PARTIALS_DIR}${filePath.split(PARTIALS_DIR)[1]}`)
        }
      }
    };
};