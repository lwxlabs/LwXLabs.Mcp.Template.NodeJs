import { identity, type Status } from '../models/identity.js';
export class ExampleService {
    echo(text: string): string {
        if (typeof text !== 'string' || text.length > 4096) throw new RangeError('Text must be at most 4096 characters.');
        return text;
    }
    add(a: number, b: number): number {
        for (const n of [a, b]) {
            if (!Number.isInteger(n) || n < -2147483648 || n > 2147483647) throw new RangeError('Expected signed 32-bit integers.');
        }
        return a + b;
    }
    status(transport: string): Status { return { ...identity, status: 'ok', transport }; }
}
