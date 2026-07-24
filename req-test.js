const http = require('http');
http.get({
  hostname: 'localhost',
  port: 3000,
  path: '/news/test',
  headers: { 'Accept': 'text/html' }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(res.statusCode, data.slice(0, 500)));
});
