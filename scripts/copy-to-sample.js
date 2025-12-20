const fs = require('fs');
const path = require('path');

const libraryName = require('../package.json').name;

const samples = fs.readdirSync('sample');

for (const sample of samples) {
  const targetDir = path.resolve('sample', sample, 'node_modules', libraryName);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync('dist', targetDir + '/dist', { recursive: true, force: true });
  fs.copyFileSync('package.json', path.join(targetDir, 'package.json'));

  console.log(`Copied '${libraryName}' to 'sample/${sample}/node_modules/${libraryName}'`);
}
