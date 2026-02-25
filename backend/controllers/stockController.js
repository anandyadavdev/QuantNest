exports.searchStock = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ results: [] });
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${q}&lang=en-US&region=IN&quotesCount=6&newsCount=0`, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await response.json();
    const quotes = (data.quotes || []).filter(i => i.quoteType === "EQUITY").slice(0, 6).map(i => ({
      symbol: i.symbol.replace(".NS", "").replace(".BO", ""), name: i.longname || i.shortname || i.symbol, fullSymbol: i.symbol,
    }));
    res.json({ results: quotes });
  } catch (err) { res.status(500).json({ results: [] }); }
};

exports.getStockPrice = async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return res.status(404).json({ message: "Stock not found" });
    const price = meta.regularMarketPrice || 0;
    const prev = meta.chartPreviousClose || price;
    res.json({
      symbol, name: meta.longName || meta.shortName || symbol, price, prevClose: prev,
      change: prev > 0 ? ((price - prev) / prev * 100).toFixed(2) : "0.00",
    });
  } catch (err) { res.status(500).json({ message: "Failed to fetch price" }); }
};