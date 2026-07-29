const fs = require('fs');
let content = fs.readFileSync('src/components/AdmissionsExplorer.tsx', 'utf8');

content = content.replace(/c\.courseName\?\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)/g, "(c.courseName || '').toLowerCase().includes((searchQuery || '').toLowerCase())");
content = content.replace(/c\.faculty\?\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)/g, "(c.faculty || '').toLowerCase().includes((searchQuery || '').toLowerCase())");
content = content.replace(/i\.name\?\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)/g, "(i.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())");
content = content.replace(/i\.state\?\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)/g, "(i.state || '').toLowerCase().includes((searchQuery || '').toLowerCase())");
content = content.replace(/a\.title\?\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)/g, "(a.title || '').toLowerCase().includes((searchQuery || '').toLowerCase())");
content = content.replace(/a\.category\?\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)/g, "(a.category || '').toLowerCase().includes((searchQuery || '').toLowerCase())");
content = content.replace(/k\?\.toLowerCase\(\)\.includes\(searchQuery\.toLowerCase\(\)\)/g, "(k || '').toLowerCase().includes((searchQuery || '').toLowerCase())");

fs.writeFileSync('src/components/AdmissionsExplorer.tsx', content, 'utf8');
