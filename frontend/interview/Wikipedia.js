const WIKI_API = "https://en.wikipedia.org/w/api.php";

async function fetchWikipedia(query, limit = 20) {
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: String(limit),
    format: "json",
  });

  const response = await fetch(`${WIKI_API}?${params}`, {
    headers: {
      "User-Agent": "CrestaInterviewDemo/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Wikipedia API failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return data.query?.search ?? [];
}

function aggregateArticles(articles, minWordCount = 1000) {
  const filtered = articles.filter(
    article => article.wordcount >= minWordCount
  );

  const totalWordCount = filtered.reduce(
    (sum, article) => sum + article.wordcount,
    0
  );

  return {
    count: filtered.length,
    totalWordCount,
    averageWordCount:
      filtered.length === 0
        ? 0
        : totalWordCount / filtered.length,

    articles: filtered.map(article => ({
      id: article.pageid,
      title: article.title,
      wordCount: article.wordcount,
    })),
  };
}

async function getWikipediaStats(query, minWordCount = 1000) {
  const articles = await fetchWikipedia(query, 50);

  return aggregateArticles(articles, minWordCount);
}

async function main() {
  try {
    const result = await getWikipediaStats(
      "artificial intelligence",
      1000
    );

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  }
}

main();