const http = require('http');
http.get({
  hostname: 'localhost',
  port: 3000,
  path: '/news/jamb-opens-registration-for-nce-and-non-technological-agricultural-programmes',
  headers: { 'Accept': 'text/html' }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(res.statusCode, data.includes('<link rel="canonical"')));
});
