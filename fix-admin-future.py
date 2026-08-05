with open('src/components/AdminPanel.tsx', 'r') as f:
    content = f.read()

bad_str = """  const handleFixFutureDates = async () => {
    const todayStr      = getNigerianDateStr();
    const todayMidnight = getNigerianMidnight();
    const futureNews    = publishedNews.filter(n => {
      const t = new Date(n.date).getTime();
      return !isNaN(t) && t > todayMidnight;
    });

    if (!futureNews.length) { alert("No future dates detected."); return; }

    if (!window.confirm(`Reset ${futureNews.length} future-dated articles to ${todayStr}?`)) return;
    setIsContentLoading(true);
    try {
      for (const item of futureNews) await updateNewsItem(item.id, { date: todayStr });
      await loadInitialData();
      alert(`Successfully reset ${futureNews.length} dates.`);
    } finally { setIsContentLoading(false); }
  };"""

replacement = """  const handleFixFutureDates = async () => {
    const todayStr      = getNigerianDateStr();
    const todayMidnight = getNigerianMidnight();
    const futureNews    = publishedNews.filter(n => {
      if (!n.date) return false;
      const t = new Date(n.date).getTime();
      // Detect if date is visually a future string compared to today
      const isFutureString = n.date > todayStr && n.date.includes("2026-");
      return (!isNaN(t) && t > todayMidnight + 86400000) || isFutureString;
    });

    if (!futureNews.length) { alert("No future dates detected."); return; }

    if (!window.confirm(`Reset ${futureNews.length} future-dated articles to ${todayStr}?`)) return;
    setIsContentLoading(true);
    try {
      for (const item of futureNews) await updateNewsItem(item.id, { date: todayStr });
      
      const updatedNews = await getCloudNews(true, true, undefined, undefined, typeof adminNewsLimit === 'number' ? adminNewsLimit : 100);
      setPublishedNews(updatedNews);
      window.dispatchEvent(new Event('campusai_news_updated'));
      window.dispatchEvent(new Event('campusai_news_sync'));
      
      alert(`Successfully reset ${futureNews.length} dates.`);
    } catch (e) {
      alert("Failed to fix future dates.");
    } finally { setIsContentLoading(false); }
  };"""

content = content.replace(bad_str, replacement)

with open('src/components/AdminPanel.tsx', 'w') as f:
    f.write(content)
