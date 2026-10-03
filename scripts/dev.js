// Starts `next dev` from the project folder no matter where it is launched from
// (lib/content.js reads ./data relative to the working directory).
const path = require('path');
process.chdir(path.join(__dirname, '..'));
process.argv = [process.argv[0], 'next', 'dev', '-p', process.argv[2] || '3200'];
require('next/dist/bin/next');
