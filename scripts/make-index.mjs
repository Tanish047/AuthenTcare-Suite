import { promises as fs } from 'fs';
import path from 'path';
const root = path.join(process.cwd(), 'src');

async function list(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const lines = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      lines.push(`- **${path.relative(root, full)}/**`);
      lines.push(...(await list(full)).map(l => `  ${l}`));
    } else {
      lines.push(`- ${path.relative(root, full)}`);
    }
  }
  return lines;
}

const body = ['# Source Index', '', ...(await list(root))].join('\n');
await fs.writeFile('INDEX.md', body);
console.log('INDEX.md written');
