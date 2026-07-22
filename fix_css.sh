sed -i 's/\.markdown-html, body {/\.markdown-body {/g' src/index.css
sed -i '/overflow-x: hidden !important;/d' src/index.css
sed -i '/width: 100% !important;/d' src/index.css
sed -i '/margin: 0;/d' src/index.css
sed -i '/padding: 0;/d' src/index.css
