const fs = require('fs');
let code = fs.readFileSync('api/server.ts', 'utf-8');
code = code.replace("if (docData) { console.log('[SEO] Successfully fetched doc for slug:', slug);",
"if (docData) { fs.appendFileSync('seo_debug.log', 'FOUND docData for ' + slug + '\\n');");
code = code.replace("const querySnap = await getDocs(q); console.log('[SEO] Query result for', slug, 'empty:', querySnap.empty);",
"const querySnap = await getDocs(q); fs.appendFileSync('seo_debug.log', 'Query result empty: ' + querySnap.empty + '\\n');");
fs.writeFileSync('api/server.ts', code);
