const http = require('http');
http.get('http://localhost:3000/news/jamb-opens-registration-for-nce-and-non-technological-agricultural-programmes', (res) => {
  console.log("Status:", res.statusCode);
});
