const fs = require('fs');
let code = fs.readFileSync('src/services/utils.ts', 'utf-8');

// I will just use standard search/replace to move it.
code = code.replace(/const fallbackNotification = \(\) => \{\n      try \{\n        const n = new Notification\(title, options\);\n        n.onclick = \(e\) => \{\n          e.preventDefault\(\);\n          window.focus\(\);\n          if \(slug\) \{\n            window.location.href = `\/news\/\$\{slug\}`;\n          \}\n        \};\n      \} catch \(e\) \{\n        console.error\("Failed to trigger browser Notification API:", e\);\n      \}\n    \};\n/g, '');

const func = `    const fallbackNotification = () => {
      try {
        const n = new Notification(title, options);
        n.onclick = (e) => {
          e.preventDefault();
          window.focus();
          if (slug) {
            window.location.href = \`/news/\${slug}\`;
          }
        };
      } catch (e) {
        console.error("Failed to trigger browser Notification API:", e);
      }
    };
`;

code = code.replace(/    if \('serviceWorker' in navigator && 'PushManager' in window\) \{/g, func + '\n    if (\'serviceWorker\' in navigator && \'PushManager\' in window) {');

fs.writeFileSync('src/services/utils.ts', code);
