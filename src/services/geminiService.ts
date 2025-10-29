import { GoogleGenAI } from "@google/genai";
import {
  AnalysisData,
  GroundingSource,
  TopArticle,
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
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const xml = await response.text();
    const doc = new DOMParser().parseFromString(xml, "application/xml");

    const items = Array.from(doc.querySelectorAll("item")).slice(0, 20);
    return items.map((item) => ({
      title: item.querySelector("title")?.textContent ?? "No Title",
      url: item.querySelector("link")?.textContent ?? "#",
      source: item.querySelector("source")?.textContent ?? "Unknown Source",
    }));
  } catch (err) {
    console.error("Error fetching RSS feed:", err);
    throw new Error("Could not load latest news from Google News.");
  }
};

// ✅ FIXED: Removed all use of process.env
// ✅ Use import.meta.env to safely access Vite environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ Missing Gemini API key! Check your .env.local file.");
  throw new Error("VITE_GEMINI_API_KEY not found.");
}

// ✅ Create the Gemini client properly
const ai = new GoogleGenAI({ apiKey });

const getTrendsPrompt = (lang: Language) => {
  const languageInstruction =
    lang === "es"
      ? "Analiza las tendencias más amplias para palabras clave y popularidad de temas relacionados con la 'Guerra en Ucrania' en español, utilizando tus capacidades generales de búsqueda en Google y análisis contextual."
      : "Analyze broader trends for keywords and topic popularity related to the 'War in Ukraine' in English, using your general Google Search capabilities and contextual understanding.";

  const prompt =
    "You are a world-class trend analysis expert. " +
    "Your primary task is to return a JSON object with a specific, fixed number of items in its arrays.\n\n" +
    languageInstruction +
    "\n\n**Final Output Instructions**\n" +
    "- Respond with ONLY a single, valid JSON object.\n" +
    "- The validity of your response is dependent on meeting the exact item counts specified below.\n" +
    "- Do not include any text, explanations, or markdown formatting before or after the JSON.\n\n" +
    "The JSON object MUST have the following structure and EXACT item counts:\n" +
    "{\n" +
    '  "topKeywords": [\n' +
    "    // This array MUST contain exactly 20 keyword objects.\n" +
    "    // If you must include slightly less popular keywords to meet this quota, do so.\n" +
    '    {"keyword": "example keyword", "searchVolume": "1.5M"},\n' +
    "    ...\n" +
    "  ],\n" +
    '  "risingKeywords": [\n' +
    "    // This array MUST contain exactly 30 keyword objects.\n" +
    "    // Do not stop until you have 30 items.\n" +
    '    {"keyword": "emerging topic", "growthPercentage": 450},\n' +
    "    ...\n" +
    "  ],\n" +
    '  "popularityComparison": {\n' +
    '    "last24HoursIndex": 85,\n' +
    '    "previous24HoursIndex": 78,\n' +
    '    "trend": "increasing"\n' +
    "  }\n" +
    "}\n\n" +
    "**Constraint Checklist (MUST be followed):**\n" +
    "- topKeywords array length MUST be exactly 20.\n" +
    "- risingKeywords array length MUST be exactly 30.\n" +
    "- All keywords MUST contain at least 2 words.\n";

  return prompt;
};

export const analyzeKeywordTrends = async (lang: Language) => {
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set in your .env.local file.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: getTrendsPrompt(lang),
      config: { tools: [{ googleSearch: {} }] },
    });

    const raw = response.text.trim();
    const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => (c.web ? { uri: c.web.uri, title: c.web.title } : null))
      .filter((s: any): s is GroundingSource => !!s?.uri && !!s?.title);

    return { data: json, sources };
  } catch (err) {
    console.error("Error fetching Gemini data:", err);
    throw new Error("Error fetching or parsing trend data from Gemini API.");
  }
};
