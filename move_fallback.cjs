const fs = require('fs');
let code = fs.readFileSync('src/services/utils.ts', 'utf-8');

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
    };`;

code = code.replace(func, '');
code = code.replace("    if ('serviceWorker' in navigator) {", func + "\n    if ('serviceWorker' in navigator) {");

fs.writeFileSync('src/services/utils.ts', code);
