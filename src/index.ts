#!/usr/bin/env node
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { identity } from './models/identity.js';
import { createServer } from './server.js';
import { runHttp } from './transports/http.js';

async function main(args: string[]) {
    if (args.length === 0) {
        const handle = serveStdio(createServer);
        process.once('SIGINT', () => { void handle.close(); });
        process.once('SIGTERM', () => { void handle.close(); });
        return;
    }
    if (args.length === 1 && args[0] === '--health') { console.log(JSON.stringify({ ...identity, status: 'ok' })); return; }
    if (args.length === 1 && args[0] === '--version') { console.log(identity.version); return; }
    if (args.length === 1 && args[0] === '--help') { console.log('Usage: lwx-mcp-nodejs [--http [--port 5189] | --health | --version | --help]'); return; }
    if (args[0] === '--http' && (args.length === 1 || (args.length === 3 && args[1] === '--port'))) {
        const port = args.length === 1 ? 5189 : Number(args[2]);
        if (Number.isInteger(port) && port > 0 && port <= 65535) { await runHttp(port); return; }
    }
    console.error('Invalid arguments. Use --help.'); process.exitCode = 2;
}
main(process.argv.slice(2)).catch(error => { console.error(error); process.exitCode = 1; });
