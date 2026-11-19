import fs from 'node:fs';
import path from 'node:path';

const files = [
  path.join(process.cwd(), 'node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs'),
  path.join(process.cwd(), 'node_modules/@floating-ui/dom/dist/floating-ui.dom.esm.js')
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const target = 'export { arrow, autoPlacement, autoUpdate, computePosition, detectOverflow, flip, hide, inline, limitShift, offset, platform, shift, size };';
    const replacement = 'export { arrow, autoPlacement, autoUpdate, computePosition, detectOverflow, flip, getOverflowAncestors, hide, inline, limitShift, offset, platform, shift, size };';
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`[patch-floating-ui] Patched ${path.basename(file)}`);
    }
  }
}
