import type { Status } from '../models/identity.js';
function escapeHtml(text: string) {
    return text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
export function statusView(model: Status): string {
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' +
        escapeHtml(model.name) + '</title><style>:root{color-scheme:light dark;font:16px system-ui,sans-serif}body{max-width:680px;margin:64px auto;padding:0 20px}main{border:1px solid #8886;border-radius:12px;padding:24px}h1{font-size:1.5rem;overflow-wrap:anywhere}dl{display:grid;grid-template-columns:120px 1fr;gap:12px}dd{margin:0}dt{opacity:.7}</style></head><body><main><h1>' +
        escapeHtml(model.name) + '</h1><p>Local MCP server</p><dl><dt>Status</dt><dd>Running</dd><dt>Version</dt><dd>' +
        escapeHtml(model.version) + '</dd><dt>Transport</dt><dd>' + escapeHtml(model.transport) +
        '</dd><dt>MCP endpoint</dt><dd><code>/mcp</code></dd></dl><p><a href="/health">Health JSON</a></p></main></body></html>';
}
