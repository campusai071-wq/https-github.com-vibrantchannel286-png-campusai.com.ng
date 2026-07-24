const fs = require('fs');

let code = fs.readFileSync('api/server.ts', 'utf-8');

code = code.replace(/if \(docData\) {/, "if (docData) { console.log('[SEO] Successfully fetched doc for slug:', slug);");
code = code.replace(/const querySnap = await getDocs\(q\);/g, "const querySnap = await getDocs(q); console.log('[SEO] Query result for', slug, 'empty:', querySnap.empty);");

fs.writeFileSync('api/server.ts', code);
