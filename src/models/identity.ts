import { readFileSync } from 'node:fs';
const metadata = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string };
export const identity = { name: 'LwXLabs.Mcp.Template.NodeJs', version: metadata.version };
export type Status = typeof identity & { status: 'ok'; transport: string };
