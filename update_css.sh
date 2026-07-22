sed -i 's/.markdown-body {/.markdown-body {\n  overflow-wrap: break-word;\n  word-wrap: break-word;\n  word-break: break-word;/g' src/index.css
cat << 'CSS' >> src/index.css

.markdown-body pre {
  @apply bg-gray-50 dark:bg-gray-900 rounded-xl p-4 overflow-x-auto my-6 border border-gray-200 dark:border-gray-800 text-sm max-w-full;
}
.markdown-body code {
  @apply font-mono text-sm px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-800 dark:text-gray-200 break-words;
}
.markdown-body pre code {
  @apply p-0 bg-transparent text-inherit rounded-none break-normal;
}
CSS
