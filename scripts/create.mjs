import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, lstatSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const [name, output = name] = process.argv.slice(2);
if (!name || !/^[A-Za-z0-9][A-Za-z0-9.-]{0,99}$/.test(name) || name.endsWith('.') || name.includes('..') || !output || process.argv.length > 4) {
    console.error('Usage: npm run create -- MyCompany.Example.Mcp [output-directory]');
    process.exit(2);
}
const destination = resolve(output);
if (existsSync(destination)) throw new Error('Output already exists: ' + destination);
const id = randomUUID().toUpperCase();
const npmName = name.toLowerCase();
const oldName = 'LwXLabs.Mcp.Template.NodeJs';
const oldPackage = 'lwxlabs-mcp-template-nodejs';
const oldId = 'F94689DC-2A55-4C90-90E4-3BBF3AC2B87D';
const oldBin = 'lwx-mcp-nodejs';
const entries = ['.github', '.gitignore', '.npmrc', 'package.json', 'package-lock.json', 'tsconfig.json', 'README.md', 'SECURITY.md', 'LICENSE', oldName + '-setup.iss', 'src', 'tests', 'scripts', 'examples'];
mkdirSync(destination, { recursive: false });
function copy(entry) {
    const source = join(root, entry);
    const target = join(destination, entry.replaceAll(oldName, name));
    const stat = lstatSync(source);
    if (stat.isSymbolicLink()) throw new Error('Unexpected symlink in template: ' + entry);
    if (stat.isDirectory()) {
        mkdirSync(target, { recursive: true });
        for (const child of readdirSync(source)) copy(join(entry, child));
    } else {
        mkdirSync(dirname(target), { recursive: true });
        const text = readFileSync(source, 'utf8').replaceAll(oldName, name).replaceAll(oldPackage, npmName).replaceAll(oldId, id).replaceAll(oldBin, npmName);
        writeFileSync(target, text, 'utf8');
    }
}
for (const entry of entries) copy(entry);
console.log('Created ' + destination);
