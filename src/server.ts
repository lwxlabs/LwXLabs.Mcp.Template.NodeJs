import { McpServer } from '@modelcontextprotocol/server';
import { identity } from './models/identity.js';
import { ExampleService } from './services/example-service.js';
import { registerExampleTools } from './tools/example-tools.js';
export function createServer() {
    const server = new McpServer(identity);
    registerExampleTools(server, new ExampleService());
    return server;
}
