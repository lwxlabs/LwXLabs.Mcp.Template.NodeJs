# LwXLabs.Mcp.Template.NodeJs

A standalone TypeScript MCP server template using Node.js 24, npm and the official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk). Default stdio; optional local Streamable HTTP and MVC-style status page.

## Create your own MCP

```bash
npm run create -- MyCompany.Example.Mcp MyCompany.Example.Mcp
cd MyCompany.Example.Mcp
npm ci
npm test
```

The generator renames the package, CLI, server and installer and assigns a fresh installer AppId. It excludes dependencies and build outputs.

## Run

```bash
npm ci
npm run build
node dist/index.js
node dist/index.js --http
```

Stdio is launched by your MCP client. HTTP mode serves http://127.0.0.1:5189, health at `/health` and MCP at `/mcp`. Override the port with `--http --port 5190`.

Example tools: `example.echo`, `example.add`, `example.status`.

## npm installation

```bash
npm pack
npm install -g lwxlabs-mcp-template-nodejs-0.1.0.tgz
lwx-mcp-nodejs --health
```

No npm registry publication is required. Node.js 24 must be installed for this mode.

## Windows installer

Requires Node.js 24, npm, PowerShell and Inno Setup 6.

```powershell
./scripts/Build-Installer.ps1
./scripts/Test-Installer.ps1
```

Setup is created in `artifacts/installer/`. The Windows x64 installer includes the Node runtime and production dependencies; recipients do not need Node or npm installed separately. Default location: `%LOCALAPPDATA%\Programs\LwXLabs\LwXLabs.Mcp.Template.NodeJs`. Configure the MCP client with the installed `node.exe` as command and the absolute installed `dist/index.js` as its argument. See [example configuration](examples/mcp.example.json).

## Customize

- `src/tools/`: MCP tool definitions.
- `src/services/`: application logic.
- `src/models/`: data contracts.
- `src/controllers/`, `src/views/`: local MVC interface.
- `src/transports/`: HTTP transport.
- `tests/`: unit and real protocol tests.

Run `npm test`. HTTP mode is local development only. Do not expose it to the internet without authentication, authorization, TLS and a security review. No private libraries, credentials or updater services are required.

[MIT License](LICENSE).
