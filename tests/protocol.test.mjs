import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { request } from 'node:http';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const command = process.env.MCP_TEMPLATE_TEST_EXECUTABLE || process.execPath;
const entry = process.env.MCP_TEMPLATE_TEST_ENTRY || fileURLToPath(new URL('../dist/index.js', import.meta.url));
const clientInfo = { name: 'template-smoke', version: '1.0.0' };
async function verify(client) {
    const result = await client.listTools();
    assert.deepEqual(result.tools.map(t => t.name).sort(), ['example.add', 'example.echo', 'example.status']);
    const echo = await client.callTool({ name: 'example.echo', arguments: { text: 'hello-mcp' } });
    assert.equal(echo.isError ?? false, false);
    assert.equal(echo.content[0].text, 'hello-mcp');
    const sum = await client.callTool({ name: 'example.add', arguments: { a: 19, b: 23 } });
    assert.equal(sum.isError ?? false, false);
    assert.equal(sum.content[0].text, '42');
    const status = await client.callTool({ name: 'example.status', arguments: {} });
    assert.equal(JSON.parse(status.content[0].text).status, 'ok');
}

test('stdio discovers and invokes tools', { timeout: 45000 }, async () => {
    const client = new Client(clientInfo);
    try {
        await client.connect(new StdioClientTransport({ command, args: [entry], stderr: 'inherit' }));
        await verify(client);
    } finally { await client.close(); }
});
async function freePort() {
    const listener = createServer();
    await new Promise(resolve => listener.listen(0, '127.0.0.1', resolve));
    const port = listener.address().port;
    await new Promise(resolve => listener.close(resolve));
    return port;
}
function foreignRequest(url, headers) {
    return new Promise((resolve, reject) => {
        const req = request(url, { headers }, res => { res.resume(); resolve(res.statusCode); });
        req.on('error', reject);
        req.end();
    });
}
test('HTTP serves MVC and MCP and rejects foreign host/origin', { timeout: 45000 }, async () => {
    const port = await freePort();
    const url = 'http://127.0.0.1:' + port;
    const child = spawn(command, [entry, '--http', '--port', String(port)], { stdio: ['ignore', 'ignore', 'pipe'] });
    let diagnostics = '';
    child.stderr.on('data', chunk => { diagnostics += String(chunk); });
    const exited = new Promise(resolve => child.once('close', resolve));
    const client = new Client(clientInfo);
    try {
        let ready = false;
        for (let i = 0; i < 80; i++) {
            if (child.exitCode !== null) throw new Error(diagnostics);
            try { ready = (await fetch(url + '/health', { signal: AbortSignal.timeout(1000) })).ok; } catch {}
            if (ready) break;
            await sleep(150);
        }
        assert.ok(ready, diagnostics);
        assert.match(await (await fetch(url)).text(), /Local MCP server/);
        assert.equal(await foreignRequest(url + '/health', { Host: 'example.invalid:' + port }), 403);
        assert.equal(await foreignRequest(url + '/mcp', { Origin: 'https://example.invalid' }), 403);
        await client.connect(new StreamableHTTPClientTransport(new URL(url + '/mcp')));
        await verify(client);
    } finally {
        await client.close();
        child.kill();
        await exited;
    }
});
test('CLI health works', () => {
    const output = execFileSync(command, [entry, '--health'], { encoding: 'utf8', timeout: 10000 });
    assert.equal(JSON.parse(output).status, 'ok');
});
