import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { ExampleService } from '../services/example-service.js';

export function registerExampleTools(server: McpServer, service: ExampleService): void {
    const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
    const int32 = z.number().int().min(-2147483648).max(2147483647);
    server.registerTool('example.echo', {
        description: 'Returns the supplied text unchanged (maximum 4096 characters).',
        inputSchema: z.object({ text: z.string().max(4096).describe('Text to echo.') }), annotations
    }, async ({ text }) => ({ content: [{ type: 'text', text: service.echo(text) }] }));
    server.registerTool('example.add', {
        description: 'Adds two signed 32-bit integers without integer overflow.',
        inputSchema: z.object({ a: int32.describe('First integer.'), b: int32.describe('Second integer.') }), annotations
    }, async ({ a, b }) => ({ content: [{ type: 'text', text: String(service.add(a, b)) }] }));
    server.registerTool('example.status', {
        description: 'Returns server identity and health status.', inputSchema: z.object({}), annotations
    }, async () => ({ content: [{ type: 'text', text: JSON.stringify(service.status('MCP')) }] }));
}
