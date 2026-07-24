const fs = require('fs');
let code = fs.readFileSync('api/server.ts', 'utf-8');
code = code.replace(/async function injectSEO\(html: string, reqPath: string\): Promise<string> {/, "async function injectSEO(html: string, reqPath: string): Promise<string> {\n  console.log('injectSEO called with reqPath:', reqPath, 'dbInstance exists:', !!dbInstance);");
fs.writeFileSync('api/server.ts', code);
