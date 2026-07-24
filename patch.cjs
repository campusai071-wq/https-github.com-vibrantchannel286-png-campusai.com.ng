const fs = require('fs');
let code = fs.readFileSync('api/server.ts', 'utf-8');
code = code.replace("app.use('*', async (req, res, next) => {", "app.use('*', async (req, res, next) => {\n        console.log('Intercepted:', req.originalUrl, req.headers.accept);");
fs.writeFileSync('api/server.ts', code);
