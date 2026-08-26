const fs = require('fs');
let code = fs.readFileSync('api/server.ts', 'utf-8');

const target1 = `  // 2. Try Search API`;
const target2 = `  if (searchSuccess && allResults.length > 0) {
    res.json({ results: allResults, type: 'combined' });`;

const startIndex = code.indexOf(target1);
const endIndex = code.indexOf(target2);

const replacement = `  // 2. Try Gemini for Search Grounding (Primary)
  const isPostUtme = query.toLowerCase().includes("post-utme") || query.toLowerCase().includes("screening");
  let searchSuccess = false;

  console.log(\`[API Search] Trying Gemini native search grounding for: "\${query}"\`);
  const rawPool = getGeminiKeys();
  for (let i = 0; i < rawPool.length; i++) {
    const apiKey = rawPool[i];
    try {
      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: \`Please search the web for the following query and provide a highly detailed summary of the latest information, dates, facts, and updates. Query: "\${query}"\`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      let text = result.text || "";
      if (!text && result.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = result.candidates[0].content.parts[0].text;
      }
      
      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      if (chunks.length > 0 || text) {
        console.log(\`[API Search] Gemini Search succeeded with key \${i + 1}\`);
        const searchResults = chunks.filter((c: any) => c.web?.uri).map((c: any) => ({
          title: c.web?.title || "Web Result",
          url: c.web?.uri,
          content: text.substring(0, 400),
          source: 'Google Search'
        }));
        
        if (searchResults.length > 0) {
          allResults = [...searchResults, ...allResults];
        } else if (text) {
           allResults.push({
             title: "Gemini Search Summary",
             url: "",
             content: text,
             source: "Google Search Summary"
           });
        }
        searchSuccess = true;
        break;
      }
    } catch (e: any) {
      console.log(\`[API Search] Gemini key \${i + 1} failed: \`, e.message || e);
    }
  }

  // 3. Fallback to Tavily/Serper if Gemini fails
  if (!searchSuccess) {
    if (isPostUtme) {
      // Try Serper for Post-UTME
      for (let i = 0; i < serperKeys.length; i++) {
          const key = serperKeys[i];
          try {
              const response = await axios.post('https://google.serper.dev/search', { q: query }, {
                  headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
                  timeout: 8000
              });
              if (response.data && response.data.organic && response.data.organic.length > 0) {
                  console.log(\`[API Search] Serper search succeeded with key \${i + 1}\`);
                  const searchResults = response.data.organic.map((r: any) => ({
                      title: r.title,
                      url: r.link,
                      content: r.snippet,
                      source: 'Serper'
                  }));
                  allResults = [...searchResults, ...allResults];
                  searchSuccess = true;
                  break;
              }
          } catch (e: any) {
              console.log(\`[API Search] Serper key \${i + 1} failed:\`, e.message || e);
          }
      }
  
      // Fallback to Tavily for Post-UTME if Serper fails
      if (!searchSuccess) {
        console.log(\`[API Search] Serper failed or returned no results for Post-UTME. Trying Tavily as fallback...\`);
        for (let i = 0; i < tavilyKeys.length; i++) {
            const key = tavilyKeys[i];
            try {
              const client = new TavilyClient({ apiKey: key });
              const response = await client.search({ query, search_depth: "advanced", max_results: 8 });
              if (response && response.results && response.results.length > 0) {
                console.log(\`[API Search] Tavily search fallback succeeded with key \${i + 1}\`);
                const searchResults = response.results.map((r: any) => ({
                  title: r.title,
                  url: r.url,
                  content: r.content,
                  source: 'Tavily'
                }));
                allResults = [...searchResults, ...allResults];
                searchSuccess = true;
                break;
              }
            } catch (e: any) {
              console.log(\`[API Search] Tavily key \${i + 1} failed:\`, e.message || e);
            }
        }
      }
    } else {
      // Try Tavily for others (News/Calculations)
      for (let i = 0; i < tavilyKeys.length; i++) {
          const key = tavilyKeys[i];
          try {
            const client = new TavilyClient({ apiKey: key });
            const response = await client.search({ query, search_depth: "advanced", max_results: 8 });
            if (response && response.results && response.results.length > 0) {
              console.log(\`[API Search] Tavily search succeeded with key \${i + 1}\`);
              const searchResults = response.results.map((r: any) => ({
                title: r.title,
                url: r.url,
                content: r.content,
                source: 'Tavily'
              }));
              allResults = [...searchResults, ...allResults];
              searchSuccess = true;
              break;
            }
          } catch (e: any) {
            console.log(\`[API Search] Tavily key \${i + 1} failed:\`, e.message || e);
          }
      }
  
      // Fallback to Serper for others if Tavily fails
      if (!searchSuccess) {
        console.log(\`[API Search] Tavily failed or returned no results. Trying Serper as fallback...\`);
        for (let i = 0; i < serperKeys.length; i++) {
          const key = serperKeys[i];
          try {
            const response = await axios.post('https://google.serper.dev/search', { q: query }, {
              headers: {
                'X-API-KEY': key,
                'Content-Type': 'application/json'
              },
              timeout: 8000
            });
            if (response.data && response.data.organic && response.data.organic.length > 0) {
              console.log(\`[API Search] Serper search succeeded with key \${i + 1}\`);
              const searchResults = response.data.organic.map((r: any) => ({
                title: r.title,
                url: r.link,
                content: r.snippet,
                source: 'Serper'
              }));
              allResults = [...searchResults, ...allResults];
              searchSuccess = true;
              break;
            }
          } catch (e: any) {
            console.log(\`[API Search] Serper key \${i + 1} failed:\`, e.message || e);
          }
        }
      }
    }
  }

`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

fs.writeFileSync('api/server.ts', code);
