# Security

Report vulnerabilities privately to the repository owner.

Stdio opens no listener. HTTP binds to loopback only, rejects foreign Host/Origin headers, and is not an authenticated remote service. Before adding privileged tools or remote access, require authentication and authorization and review input validation and data access. Never commit credentials or log protocol data to stdout.
