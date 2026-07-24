const fs = require('fs');
let code = fs.readFileSync('api/server.ts', 'utf-8');
code = code.replace("app.get('/api/diag/firestore'", "app.get('/api/diag/news', async (req, res) => {\n  const q = query(collection(dbInstance, 'news'), limit(5));\n  const snap = await getDocs(q);\n  const data = [];\n  snap.forEach(d => data.push(d.data().slug));\n  res.json(data);\n});\napp.get('/api/diag/firestore'");
fs.writeFileSync('api/server.ts', code);
