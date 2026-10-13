// Copies the OpenAPI specs from the sibling contracts repo into ./openapi so the site builds
// on its own (Vercel and CI clone only this repo). Run `npm run sync:openapi` after contracts change.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '..', 'contracts', 'openapi');
const target = join(root, 'openapi');
const specs = ['auth.yaml', 'mail.yaml', 'calendar.yaml', 'projects.yaml'];

if (!existsSync(source)) {
  console.log(`sync:openapi: ${source} not found, keeping the committed copies in ./openapi`);
  process.exit(0);
}
mkdirSync(target, { recursive: true });
for (const spec of specs) {
  copyFileSync(join(source, spec), join(target, spec));
  console.log(`sync:openapi: copied ${spec}`);
}
