import type { IncomingMessage, ServerResponse } from 'node:http';
import { ExampleService } from '../services/example-service.js';
import { statusView } from '../views/status-view.js';
export function handleHome(req: IncomingMessage, res: ServerResponse): boolean {
    if (req.method !== 'GET') return false;
    const status = new ExampleService().status('Streamable HTTP');
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(status)); return true;
    }
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(statusView(status)); return true;
    }
    return false;
}
