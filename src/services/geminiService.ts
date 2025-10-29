import { GoogleGenAI } from "@google/genai";
import {
  AnalysisData,
  GroundingSource,
  TopArticle,
  KeywordVolume,
  RisingKeyword,
  PopularityComparison,
  Language,
} from "../types";

const RSS_URLS: Record<Language, string> = {
  en: "https://news.google.com/rss/search?q=Ukraine+OR+Russia+OR+Kyiv+OR+Zelensky+OR+Putin+OR+Donbas+OR+Ukrainian+OR+Trump+OR+FPV+OR+offensive+OR+assault+OR+Drone+OR+Russian+OR+strike+OR+missile+OR+Shahed+OR+artillery+OR+ATACMS+OR+Flamingo+OR+frontline+OR+POW+OR+Sanctions+OR+Korea+OR+NATO+OR+ammunition+OR+defense+OR+warfare+OR+military+OR+counteroffensive+OR+nuclear+OR+submarine&hl=en-US&gl=US&ceid=US:en",
  es: "https://news.google.com/rss/search?q=Ucrania+OR+Rusia+OR+Kiev+OR+Zelensky+OR+Putin+OR+Donbás+OR+ucraniano+OR+Trump+OR+FPV+OR+ofensiva+OR+asalto+OR+Drone+OR+ruso+OR+ataque+OR+misil+OR+Shahed+OR+artillería+OR+ATACMS+OR+Flamingo+OR+frente+OR+prisioneros+de+guerra+OR+sanciones+OR+Corea+OR+OTAN+OR+municiones+OR+defensa+OR+guerra+OR+militar+OR+contraofensiva+OR+nuclear+OR+submarino&hl=es-ES&gl=ES&ceid=ES:es",
};

const PROXY_URL = "https://corsproxy.io/?";

export const fetchNews = async (lang: Language): Promise<TopArticle[]> => {
  try {
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(RSS_URLS[lang])}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlString = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    const parsingError = xmlDoc.querySelector("parsererror");
    if (parsingError) {
      console.error("Error parsing XML:", parsingError);
      throw new Error("Failed to parse the RSS feed.");
    }

    const items = Array.from(xmlDoc.querySelectorAll("item")).slice(0, 20);

    return items.map((item) => ({
      title: item.querySelector("title")?.textContent ?? "No Title",
      url: item.querySelector("link")?.textContent ?? "#",
      source: item.querySelector("source")?.textContent ?? "Unknown Source",
    }));
  } catch (error) {
    console.error("Error fetching or parsing RSS feed:", error);
    throw new Error("Could not retrieve latest news from Google News. Please check the connection or proxy service.");
  }
};

const getTrendsPrompt = (lang: Language) => {
  const languageInstruction =
    lang === "es"
      ? "Analiza las tendencias más amplias para palabras clave y popularidad de temas relacionados con la 'Guerra en Ucrania' en español, utilizando tus capacidades generales de Búsqueda de Google."
      : "Analyze broader trends for keywords and topic popularity related to the 'War in Ukraine' in English, using your general Google Search capabilities.";

  return `
You are a world-class trend analysis expert.
${languageInstruction}

**Final Output Instructions**
- Respond with ONLY a single, valid JSON object.
- Do not include any text, explanations, or markdown formatting before or after the JSON.

The JSON object must have the following structure:
{
  "topKeywords": [
    {"keyword": "example keyword", "searchVolume": "1.5M"},
    ... 19 more items
  ],
  "risingKeywords": [
    {"keyword": "emerging topic", "growthPercentage": 450},
    ... 49 more items
  ],
  "popularityComparison": {
    "last24HoursIndex": 85,
    "previous24HoursIndex": 78,
    "trend": "increasing"
  }
}

**Detailed Field Requirements:**
- topKeywords: An array of exactly 20 keywords (at least 2 words each), sorted by search volume.
- risingKeywords: An array of exactly 50 keywords (at least 2 words each), sorted by growth percentage.
- popularityComparison: An object with relative interest scores (1-100) and a trend ('increasing', 'decreasing', or 'stable').
`;
};

type TrendsAnalysisData = Omit<AnalysisData, "topArticles">;

export const analyzeKeywordTrends = async (
  lang: Language
): Promise<{ data: TrendsAnalysisData; sources: GroundingSource[] }> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set.");
  }

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: getTrendsPrompt(lang),
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const rawText = response.text.trim();

    const startIndex = rawText.indexOf("{");
    const endIndex = rawText.lastIndexOf("}");

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      console.error("Invalid response format from Gemini, could not find JSON object:", rawText);
      throw new SyntaxError("Failed to find a valid JSON object in the AI's response.");
    }

    const jsonString = rawText.substring(startIndex, endIndex + 1);
    const parsedData: TrendsAnalysisData = JSON.parse(jsonString);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .map((chunk) =>
        chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : null
      )
      .filter((source): source is GroundingSource => source !== null && !!source.uri && !!source.title);

    return { data: parsedData, sources };
  } catch (error) {
    console.error("Error fetching or parsing trend data:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the AI's response. The data format was invalid or incomplete.");
    }
    throw new Error("An error occurred while fetching keyword trend data from the Gemini API.");
  }
};
