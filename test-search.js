const axios = require('axios');
axios.post('http://localhost:3000/api/search', { query: 'FUTA Computer Science cutoff mark 2026' })
  .then(res => console.log(JSON.stringify(res.data, null, 2)))
  .catch(err => console.error(err.response ? err.response.data : err.message));
