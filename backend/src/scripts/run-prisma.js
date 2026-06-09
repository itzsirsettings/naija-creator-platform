const path = require('path');
const { Readable } = require('stream');

// Force TTY to fool interactive prompts
process.stdout.isTTY = true;
process.stderr.isTTY = true;

// Mock stdin to auto-send 'y' for any prompts (e.g. data loss warnings)
const mockStdin = new Readable({
  read() {
    this.push('y\n');
    this.push(null); // EOF
  }
});

// Override process.stdin properties
Object.defineProperty(process, 'stdin', {
  value: mockStdin,
  configurable: true,
  writable: true
});
process.stdin.isTTY = true;

// Execute the Prisma CLI entry point
require('../../node_modules/prisma/build/index.js');
