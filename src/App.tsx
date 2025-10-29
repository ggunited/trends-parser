import React, { useState, useEffect, useCallback } from 'react';
import { fetchNews, analyzeKeywordTrends } from './services/geminiService';
import { AnalysisData, GroundingSource, TopArticle, RisingKeyword, KeywordVolume, Language } from './types';
import Header from './components/Header';
import PopularityWidget from './components/PopularityWidget';
import DataTable from './components/DataTable';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import { translations } from './i18n';

const App: React.FC = () => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const t = translations[language];

  const fetchData = useCallback(async (lang: Language) => {
    setLoading(true);
    setError(null);
    setData(null);
    setSources([]);

    try {
      const [newsData, trendsResult] = await Promise.all([
        fetchNews(lang),
        analyzeKeywordTrends(lang)
      ]);

      setData({
        ...trendsResult.data,
        topArticles: newsData,
      });
      setSources(trendsResult.sources);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      setData(null);
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(language);
  }, [language, fetchData]);

  const renderTopArticlesRow = (item: TopArticle) => (
    <>
      <td className="py-3 px-4 sm:px-6">
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors line-clamp-2 break-words"
        >
          {item.title}
        </a>
      </td>
      <td className="py-3 px-4 sm:px-6 text-right text-slate-400 text-xs truncate w-32 sm:w-48">
        {item.source}
      </td>
    </>
  );

  const renderRisingKeywordsRow = (item: RisingKeyword) => (
    <>
      <td className="py-3 px-4 sm:px-6">{item.keyword}</td>
      <td className="py-3 px-4 sm:px-6 text-right font-mono text-green-400">
        +{item.growthPercentage}%
      </td>
    </>
  );

  const renderTopKeywordsRow = (item: KeywordVolume) => (
    <>
      <td className="py-3 px-4 sm:px-6">{item.keyword}</td>
      <td className="py-3 px-4 sm:px-6 text-right font-mono text-green-400">{item.searchVolume}</td>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header 
          onRefresh={() => fetchData(language)} 
          isLoading={loading}
          language={language}
          setLanguage={setLanguage}
          t={t}
        />
        
        <main className="mt-6">
          {loading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} onRetry={() => fetchData(language)} t={t} />}
          {data && !loading && !error && (
            <div className="space-y-8">
              <PopularityWidget data={data.popularityComparison} t={t} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DataTable
                  title={t.top30RisingKeywords}
                  headers={[t.keyword, t.growth]}
                  data={data.risingKeywords.slice(0, 30)}
                  renderRow={renderRisingKeywordsRow}
                  keyExtractor={(item) => (item as RisingKeyword).keyword}
                />
                <DataTable
                  title={t.top20KeywordsByVolume}
                  headers={[t.keyword, t.searchVolume]}
                  data={data.topKeywords}
                  renderRow={renderTopKeywordsRow}
                  keyExtractor={(item) => (item as KeywordVolume).keyword}
                />
              </div>

              <div>
                <DataTable
                  title={t.latest20News}
                  headers={[t.article, t.source]}
                  data={data.topArticles}
                  renderRow={renderTopArticlesRow}
                  keyExtractor={(item) => (item as TopArticle).url}
                />
              </div>

              {sources.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mt-8">
                    <h3 className="text-sm font-semibold text-slate-400 mb-3">{t.dataSources}</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                        {sources.map(source => (
                            <li key={source.uri} className="truncate">
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 hover:underline">
                                    {source.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;