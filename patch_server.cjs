const fs = require('fs');
let code = fs.readFileSync('api/server.ts', 'utf-8');

// We want to add Gemini search fallback in /api/search
// Look for `if (searchSuccess && allResults.length > 0) {` inside /api/search
const target = `  if (searchSuccess && allResults.length > 0) {
    res.json({ results: allResults, type: 'combined' });`;

const replacement = `  // 3. Try Gemini for Search Grounding (if Tavily/Serper missing or failed)
  if (!searchSuccess) {
    console.log(\`[API Search] Tavily/Serper failed. Trying Gemini native search grounding for: "\${query}"\`);
    const rawPool = getGeminiKeys();
    for (let i = 0; i < rawPool.length; i++) {
      const apiKey = rawPool[i];
      try {
        const ai = new GoogleGenAI({ apiKey });
        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
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
  }

  if (searchSuccess && allResults.length > 0) {
    res.json({ results: allResults, type: 'combined' });`;

code = code.replace(target, replacement);

fs.writeFileSync('api/server.ts', code);
