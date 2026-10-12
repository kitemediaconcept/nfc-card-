import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetFile = path.resolve(__dirname, '../node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/load-manifest.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf-8');
  let modified = false;

  if (!content.includes('preview-props')) {
    content = content.replace(
      '**/{*-manifest,required-server-files,prefetch-hints}.json',
      '**/{*-manifest,required-server-files,prefetch-hints,preview-props}.json'
    );
    content = content.replace(
      'p.endsWith("prefetch-hints"))',
      'p.endsWith("prefetch-hints") ||\n        p.endsWith("preview-props"))'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(targetFile, content, 'utf-8');
    console.log('[patch-opennext] Successfully patched @opennextjs/cloudflare load-manifest plugin for preview-props.');
  } else {
    console.log('[patch-opennext] @opennextjs/cloudflare already contains preview-props patch.');
  }
} else {
  console.log('[patch-opennext] Notice: target file not found, skipping patch.');
}
