const axios = require('axios');
axios.post('http://localhost:3000/api/search', { query: '"Federal University of Technology, Akure" "Computer Science" departmental aggregate cut-off mark percentage score 2024 2025 2026' })
  .then(res => {
     res.data.results.slice(0, 4).forEach((r, i) => console.log(`${i+1}. ${r.title}\n${r.content}\n`));
  })
  .catch(err => console.error(err.response ? err.response.data : err.message));
