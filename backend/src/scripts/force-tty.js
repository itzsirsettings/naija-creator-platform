const { Readable } = require('stream');

// Force TTY properties
process.stdout.isTTY = true;
process.stderr.isTTY = true;

// Mock stdin to auto-feed 'y' on any prompts
const mockStdin = new Readable({
  read() {}
});

Object.defineProperty(process, 'stdin', {
  value: mockStdin,
  configurable: true,
  writable: true
});
process.stdin.isTTY = true;

// Periodically push 'y\n' so that whenever the prompt is ready, it receives it
const interval = setInterval(() => {
  try {
    mockStdin.push('y\n');
  } catch (err) {
    clearInterval(interval);
  }
}, 500);

// Prevent the process from hanging forever due to the interval
setTimeout(() => {
  clearInterval(interval);
  try {
    mockStdin.push(null);
  } catch (err) {}
}, 90000);
