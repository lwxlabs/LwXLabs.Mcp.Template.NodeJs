import { createServer as createHttpServer } from 'node:http';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { createServer } from '../server.js';
import { handleHome } from '../controllers/home-controller.js';

export async function runHttp(port: number): Promise<void> {
    const handler = createMcpHandler(createServer);
    const nodeHandler = toNodeHandler(handler);
    const allowedHosts = new Set(['127.0.0.1:' + port, 'localhost:' + port]);
    const allowedOrigins = new Set(['http://127.0.0.1:' + port, 'http://localhost:' + port]);
    const server = createHttpServer((req, res) => {
        const host = req.headers.host?.toLowerCase();
        const origin = req.headers.origin;
        if (req.socket.remoteAddress !== '127.0.0.1' || !host || !allowedHosts.has(host) ||
            (origin !== undefined && !allowedOrigins.has(origin))) {
            res.writeHead(403).end('Forbidden'); return;
        }
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'no-store');
        if (handleHome(req, res)) return;
        if (req.url === '/mcp') {
            void Promise.resolve(nodeHandler(req, res)).catch(error => {
                console.error(error);
                if (!res.headersSent) res.writeHead(500).end('Internal server error');
                else res.destroy();
            });
            return;
        }
        res.writeHead(404).end('Not found');
    });
    server.requestTimeout = 30_000;
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', () => { server.off('error', reject); resolve(); });
    });
    console.error('Local MCP listening on http://127.0.0.1:' + port);
    let closing = false;
    const stop = async () => {
        if (closing) return;
        closing = true;
        server.close();
        try { await handler.close(); } finally { server.closeAllConnections(); }
    };
    process.once('SIGINT', () => { void stop(); });
    process.once('SIGTERM', () => { void stop(); });
}
