const axios = require('axios');
axios.post('http://localhost:3000/api/search', { query: 'FUTA Computer Science cutoff mark 2026' })
  .then(res => {
     console.log("Total results:", res.data.results.length);
     res.data.results.forEach((r, i) => console.log(`${i+1}. Source: ${r.source}, isLocal: ${r.isLocal}`));
  })
  .catch(err => console.error(err.response ? err.response.data : err.message));
