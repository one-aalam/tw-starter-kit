const fs = require('fs');
const path = require('path');
const casual = require('casual');
const range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx);

const targetDir = path.join(__dirname, '../', 'data', 'data.json');
const generatorSrcDir = path.join(__dirname, 'generators');

const data = {};
fs.readdirSync(generatorSrcDir).forEach( file => {
    data[`${path.basename(file, path.extname(file))}s`] = range(1, 10).map(() => require(path.join(__dirname, 'generators', file ))(casual));
});

fs.writeFileSync(targetDir, JSON.stringify(data), 'utf-8');
