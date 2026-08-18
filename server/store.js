import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export class JsonLeadStore {
  constructor(filePath) { this.filePath = filePath; }

  async list() {
    try { return JSON.parse(await readFile(this.filePath, 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  }

  async save(leads) {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporary = `${this.filePath}.tmp`;
    await writeFile(temporary, JSON.stringify(leads, null, 2));
    await rename(temporary, this.filePath);
  }
}
