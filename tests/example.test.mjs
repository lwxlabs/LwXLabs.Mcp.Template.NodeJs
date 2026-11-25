import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ExampleService } from '../dist/services/example-service.js';
const service = new ExampleService();
test('echo preserves input', () => assert.equal(service.echo('Hello MCP!'), 'Hello MCP!'));
test('echo rejects oversized input', () => assert.throws(() => service.echo('x'.repeat(4097)), RangeError));
test('addition handles signed 32-bit boundaries', () => {
    assert.equal(service.add(2147483647, 2147483647), 4294967294);
    assert.throws(() => service.add(2147483648, 0), RangeError);
});
