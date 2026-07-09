import {spawn} from 'child_process';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const syncScript = path.join(__dirname, 'sync-source-docs.mjs');

const child = spawn(
  process.execPath,
  [syncScript, '--docs-subdir', 'frontend-system-design', '--format', 'frontend-system-design=.'],
  {
    stdio: 'inherit',
  },
);

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
