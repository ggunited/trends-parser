import React, { useEffect, useState } from "react";
import { analyzeKeywordTrends, fetchNews } from "./services/geminiService";
import { AnalysisData } from "./types";

const CACHE_KEY = "trendDataCache";
const CACHE_EXPIRY_HOURS = 24;

const App: React.FC = () => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const cached = localStorage.getItem(CACHE_KEY);

        if (cached) {
          const parsed = JSON.parse(cached);
          const ageHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);

          if (ageHours < CACHE_EXPIRY_HOURS) {
            console.log("✅ Loaded data from cache");
            setData(parsed.data);
            setLoading(false);
            return;
          }
        }

        console.log("♻️ Cache expired or empty — fetching new data...");
        const [trends, articles] = await Promise.all([
          analyzeKeywordTrends("en"), // or selected language
          fetchNews("en"),
        ]);

        const combined = { ...trends.data, topArticles: articles };
        setData(combined);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: combined, timestamp: Date.now() })
        );

      } catch (err: any) {
        console.error(err);
        setError("Failed to load trend data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading trends...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Ukraine Trends Dashboard</h1>
      {data && (
        <div>
          {/* render your DataTable, PopularityWidget, etc. */}
        </div>
      )}
    </div>
  );
};

export default App;
