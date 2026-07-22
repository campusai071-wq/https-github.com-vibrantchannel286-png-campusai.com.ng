import axios from 'axios';
import { getApiUrl } from './utils';

export const searchWeb = async (query: string, usePostUtmeKey = false): Promise<string> => {
  console.log("Starting Search with query:", query);

  try {
    const response = await axios.post(getApiUrl('/api/search'), { query, usePostUtmeKey });
    const results = response.data.results;
    if (!results || !Array.isArray(results)) return "No results found.";
    
    // Limit to top 4 search results to keep prompt size clean and concise
    const limitedResults = results.slice(0, 4);
    
    return limitedResults.map((r: any) => {
      const title = (r.title || "Portal Update").trim();
      const url = r.url || r.link || '';
      // Limit snippet content to 350 characters to prevent token bloat
      let snippet = (r.content || r.snippet || '').trim();
      if (snippet.length > 350) {
        snippet = snippet.substring(0, 350) + "...";
      }
      return `Title: ${title}\nURL: ${url}\nContent: ${snippet}`;
    }).join('\n\n');
  } catch (e) {
    console.error("Search failed:", e);
    return "Search unavailable due to API failure.";
  }
};

export interface SearchResultItem {
  title: string;
  url: string;
  content: string;
}

export const searchWebRaw = async (query: string, usePostUtmeKey = false): Promise<SearchResultItem[]> => {
  try {
    const response = await axios.post(getApiUrl('/api/search'), { query, usePostUtmeKey });
    const results = response.data.results;
    if (!results || !Array.isArray(results)) return [];

    // Limit to top 4 search results
    const limitedResults = results.slice(0, 4);

    return limitedResults.map((r: any) => {
      let content = (r.content || r.snippet || "").trim();
      if (content.length > 350) {
        content = content.substring(0, 350) + "...";
      }
      return {
        title: (r.title || "Portal Update").trim(),
        url: r.url || r.link || "",
        content: content
      };
    });
  } catch (e) {
    console.error("Search failed (raw):", e);
  }

  return [];
};
