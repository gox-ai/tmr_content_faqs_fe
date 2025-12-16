import React, { useEffect, useState, useCallback } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { getCachedData, setCachedData } from "../utils/cacheUtils";

const API_BASE = process.env.REACT_APP_API_URL
const STRAPI_COLLECTIONS = [
  { label: "Solution Pages", value: "solution-pages" },
  { label: "Alternative Pages v2", value: "alternative-pages-v2s" },
  { label: "SEO Landing Pages", value: "seo-pages" },
  { label: "Cluster Pages", value: "cluster-pages" },
  { label: "Topical Authority Categories", value: "topical-authority-categories" },
  { label: "Topical Authority Pages (Blogs)", value: "topical-authority-pages" },
  { label: "Google Sheets Template Pages", value: "google-sheets-template-pages" },
  { label: "Google Sheets Templates", value: "google-sheets-templates" },
  { label: "Integration Pages", value: "integration-pages" },
  { label: "Integration Google Sheets", value: "integration-to-google-sheets-pages" },
  { label: "Integration Looker Studio", value: "integration-to-looker-studio-pages" },
  { label: "Template Pages", value: "template-pages" },
  { label: "Addons", value: "addons" },
  { label: "Competitor Comparison Pages", value: "competitor-comparison-pages" },
  { label: "Connector Pages", value: "connector-pages" },
  { label: "Documents Pages", value: "documents-pages" },
  { label: "Feature Pages", value: "feature-pages" },
  { label: "Reporting Tool Pages v1", value: "reporting-tool-pages" },
  { label: "Reporting Tool Pages v2", value: "reporting-tool-pages-v2" },
  { label: "Other Pages", value: "other-pages" },
  { label: "Looker Studio Templates", value: "looker-studio-templates" },
  { label: "Looker Studio Template Pages", value: "looker-studio-template-pages" }
];
const COLLECTION_TO_CATEGORY_MAP = {
  "seo-pages": "SEO Landing Pages",
  "solution-pages": "Solution Pages",
  "alternative-pages": "Alternative Pages",
  "alternative-pages-v2s": "Alternative Pages v2",
  "cluster-pages": "Cluster Pages",
  "faq": "FAQ",
  "topical-authority-pages": "Topical Authority Pages",
  "topical-authority-categories": "Topical Authority Categories",
  "template-pages": "Templates pages",
  "google-sheets-template-pages": "Google Sheets Template Pages",
  "google-sheets-templates": "Google Sheets Templates",
  "looker-studio-template-pages": "Looker Studio Template Pages",
  "looker-studio-templates": "Looker Studio Templates",
  "integration-pages": "Integration Pages",
  "integration-to-google-sheets-pages": "Integration Google Sheets",
  "integration-to-looker-studio-pages": "Integration Looker Studio",
  "connector-pages": "Connector Pages",
  "addons": "Addons",
  "feature-pages": "Feature Pages",
  "reporting-tool-pages": "Reporting Tool Pages v1",
  "reporting-tool-pages-v2": "Reporting Tool Pages v2",
  "competitor-comparison-pages": "Competitor Comparison Pages",
  "documents-pages": "Documents Pages",
  "other-pages": "Other Pages",
};
function FAQCard({ faq, index, copiedIndex, onCopy, rephrasedData, onCopyRephrased }) {
  return (
    <div className={`border-l-4 pl-4 mb-6`}>
      <h3 className="font-bold text-black">
        Q{index + 1}: {faq.question}
      </h3>
      <p className="text-black mt-2" dangerouslySetInnerHTML={{ __html: faq.answer }} />

      {rephrasedData && (
        <details className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <summary className="cursor-pointer font-semibold text-[rgb(255,103,0)]">
            View Rephrased Versions
          </summary>

          <div className="mt-3 pl-2 space-y-4 text-gray-800">
            {rephrasedData?.rephrased?.version_1 ? (
              <>
                <div className="flex justify-between items-start bg-white p-3 rounded-md shadow-sm border border-gray-200">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Q1: {rephrasedData.rephrased.version_1?.question || ""}
                    </p>
                    <p className="text-sm leading-relaxed mt-1" dangerouslySetInnerHTML={{ __html: rephrasedData.rephrased.version_1?.answer || "" }} />
                  </div>
                  <button
                    onClick={async () => {
                      const text = `Q: ${rephrasedData.rephrased.version_1?.question || ""}\\nA: ${rephrasedData.rephrased.version_1?.answer || ""}`;
                      await navigator.clipboard.writeText(text);
                      onCopyRephrased(`v1-${index}`);
                      setTimeout(() => onCopyRephrased(null), 2000);
                    }}
                    className={`ml-4 px-3 py-1 rounded-md text-sm font-semibold text-white transition ${copiedIndex === `v1-${index}`
                      ? "bg-[rgb(255,103,0)]"
                      : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)]"
                      }`}
                  >
                    {copiedIndex === `v1-${index}` ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="flex justify-between items-start bg-white p-3 rounded-md shadow-sm border border-gray-200">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Q2: {rephrasedData.rephrased.version_2?.question || ""}
                    </p>
                    <p className="text-sm leading-relaxed mt-1" dangerouslySetInnerHTML={{ __html: rephrasedData.rephrased.version_2?.answer || "" }} />
                  </div>
                  <button
                    onClick={async () => {
                      const text = `Q: ${rephrasedData.rephrased.version_2?.question || ""}\\nA: ${rephrasedData.rephrased.version_2?.answer || ""}`;
                      await navigator.clipboard.writeText(text);
                      onCopyRephrased(`v2-${index}`);
                      setTimeout(() => onCopyRephrased(null), 2000);
                    }}
                    className={`ml-4 px-3 py-1 rounded-md text-sm font-semibold text-white transition ${copiedIndex === `v2-${index}`
                      ? "bg-[rgb(255,103,0)]"
                      : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)]"
                      }`}
                  >
                    {copiedIndex === `v2-${index}` ? "Copied!" : "Copy"}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 italic">
                Rephrased versions are not yet available.
              </p>
            )}
          </div>
        </details>
      )}

      <button
        onClick={async () => {
          await navigator.clipboard.writeText(`Q: ${faq.question}\\nA: ${faq.answer}`);
          onCopy(index);
          setTimeout(() => onCopy(null), 2000);
        }}
        className={`mt-3 px-4 py-2 rounded-lg font-semibold text-white transition ${copiedIndex === index
          ? "bg-[rgb(255,103,0)]"
          : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)]"
          }`}
      >
        {copiedIndex === index ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

// Helper function to strip HTML tags from text
const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function ExistingPage() {
  const [mainKeyword, setMainKeyword] = useState("");
  const [allKeywords, setAllKeywords] = useState([]);
  const [content, setContent] = useState("");
  const [serpQuestions, setSerpQuestions] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [contentFaqs, setContentFaqs] = useState([]);
  const [rephrasedFaqs, setRephrasedFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedPAAIndex, setCopiedPAAIndex] = useState(null);
  const [copiedContentIndex, setCopiedContentIndex] = useState(null);
  const [strapiStatus, setStrapiStatus] = useState("");
  const [keywordsData, setKeywordsData] = useState(null);
  const [selectedStrapiCollection, setSelectedStrapiCollection] = useState("");
  const [strapiPages, setStrapiPages] = useState([]);
  const [selectedStrapiPage, setSelectedStrapiPage] = useState("");

  useEffect(() => {
    const loadKeywords = async () => {
      // Try to load from cache first
      const cachedKeywords = getCachedData('keywords_json');
      if (cachedKeywords && Object.keys(cachedKeywords).length > 0) {
        console.log("✅ Loaded keywords.json from cache");
        setKeywordsData(cachedKeywords);
        return;
      }

      // Try to fetch from file
      try {
        const res = await fetch('/keywords.json');
        if (!res.ok) {
          throw new Error('keywords.json not found');
        }

        const data = await res.json();

        // Check if keywords.json is empty or has no data
        const isEmpty = !data || Object.keys(data).length === 0 ||
          Object.values(data).every(arr => Array.isArray(arr) && arr.length === 0);

        if (isEmpty) {
          console.log("keywords.json is empty, fetching from Strapi immediately...");
          await fetchKeywordsFromStrapi();
        } else {
          console.log("Loaded keywords.json from file");
          setKeywordsData(data);
          setCachedData('keywords_json', data);
        }
      } catch (err) {
        console.error("Failed to load keywords.json:", err);
        console.log("⚠️ File not found, fetching keywords from Strapi immediately...");
        await fetchKeywordsFromStrapi();
      }
    };

    loadKeywords();
  }, []);

  const fetchKeywordsFromStrapi = async () => {
    try {
      setStrapiStatus("⏳ Fetching keywords from Strapi...");
      const response = await fetch(`${API_BASE}/strapi/faq`);
      const data = await response.json();

      if (response.ok && data.result) {
        console.log("✅ Keywords fetched from Strapi and saved to keywords.json");
        setKeywordsData(data.result);
        setCachedData('keywords_json', data.result);
        setStrapiStatus("✅ Keywords loaded from Strapi");
      } else {
        console.error("⚠️ Failed to fetch keywords from Strapi");
        setStrapiStatus("");
      }
    } catch (err) {
      console.error("❌ Error fetching keywords from Strapi:", err);
      setStrapiStatus("");
    }
  };

  useEffect(() => {
    if (selectedStrapiCollection) {
      fetchStrapiPages();
    } else {
      // Clear pages when collection is deselected
      setStrapiPages([]);
    }
  }, [selectedStrapiCollection]);

  const fetchStrapiPages = async () => {
    try {
      // Check cache first
      const cacheKey = `strapi_pages_${selectedStrapiCollection}`;
      const cachedPages = getCachedData(cacheKey);

      if (cachedPages) {
        console.log(`✅ Using cached pages for ${selectedStrapiCollection}`);
        setStrapiPages(cachedPages);
        setStrapiStatus(`Loaded ${cachedPages.length} pages (from cache)`);
        return;
      }

      setStrapiStatus("Loading pages from Strapi... pls wait");

      // If it's feature-pages, fetch normally
      if (selectedStrapiCollection === 'feature-pages') {
        const response = await fetch(`${API_BASE}/api/fetch-strapi-content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collection: 'feature-pages' }),
        });
        const data = await response.json();

        if (response.ok && data.pages) {
          console.log("Received pages from backend:", data.pages);
          // Add collection info to each page
          const pagesWithCollection = data.pages.map(page => ({
            ...page,
            _sourceCollection: 'feature-pages'
          }));
          setStrapiPages(pagesWithCollection);
          setStrapiStatus(`Loaded ${pagesWithCollection.length} pages`);
          // Cache the result
          setCachedData(cacheKey, pagesWithCollection);
        } else {
          setStrapiStatus("Failed to load pages");
          setStrapiPages([]);
        }
        return;
      }
      const collectionMappings = {
        blog: ['topical-authority-pages'],
        integrations: ['integration-pages', 'integration-to-google-sheets-pages', 'integration-to-looker-studio-pages'],
        templates: ['template-pages', 'google-sheets-template-pages', 'looker-studio-template-pages'],
        other: [
          'seo-pages',
          'solution-pages',
          'cluster-pages',
          'connector-pages',
          'competitor-comparison-pages',
          'alternative-pages-v2s',
          'case-studies',
          'reporting-tool-pages-v2',
          'addon-pages',
          'documents-pages',
          'other-pages',
        ]
      };
      let targetCollections = [];
      if (selectedStrapiCollection === 'url-pattern-blog') {
        targetCollections = collectionMappings.blog;
      } else if (selectedStrapiCollection === 'url-pattern-integrations') {
        targetCollections = collectionMappings.integrations;
      } else if (selectedStrapiCollection === 'url-pattern-templates') {
        targetCollections = collectionMappings.templates;
      } else if (selectedStrapiCollection === 'url-pattern-other') {
        targetCollections = collectionMappings.other;
      } else {
        targetCollections = [selectedStrapiCollection];
      }

      let allPages = [];

      for (const collection of targetCollections) {
        try {
          const response = await fetch(`${API_BASE}/api/fetch-strapi-content`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ collection }),
          });
          const data = await response.json();
          if (response.ok && data.pages) {
            const pagesWithCollection = data.pages.map(page => ({
              ...page,
              _sourceCollection: collection
            }));
            allPages = [...allPages, ...pagesWithCollection];
          }
        } catch (err) {
          console.error(`Error fetching ${collection}:`, err);
        }
      }

      console.log("Received pages from backend:", allPages);
      setStrapiPages(allPages);
      setStrapiStatus(`Loaded ${allPages.length} pages`);
      setCachedData(cacheKey, allPages);

    } catch (err) {
      console.error("Fetch Strapi pages error:", err);
      setStrapiStatus("Error loading pages");
      setStrapiPages([]);
    }
  };

  const fetchPageDetails = async (pageId) => {
    try {
      // Check cache first
      const cacheKey = `page_details_${pageId}`;
      const cachedPageDetails = getCachedData(cacheKey);

      if (cachedPageDetails) {
        console.log(`Using cached page details for page ${pageId}`);
        setContent(cachedPageDetails.content);
        setMainKeyword(cachedPageDetails.mainKeyword || "");
        setAllKeywords(cachedPageDetails.allKeywords || []);
        setStrapiStatus(cachedPageDetails.status + " (from cache)");
        return;
      }

      setStrapiStatus("Fetching page details...");
      const selectedPage = strapiPages.find(p => p.id === parseInt(pageId));
      const actualCollection = selectedPage?._sourceCollection || selectedStrapiCollection;

      const response = await fetch(`${API_BASE}/api/fetch-strapi-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: actualCollection,
          pageId: pageId
        }),
      });
      const data = await response.json();

      if (response.ok && data.content) {
        setContent(data.content);
        console.log(`Loaded content: ${data.content.length} chars`);

        const urlToMatch = data.url || data.slug;
        const categoryName = COLLECTION_TO_CATEGORY_MAP[actualCollection] || '';

        if (urlToMatch) {
          try {
            setStrapiStatus("Matching keywords from keywords.json...");
            const keywordResponse = await fetch(`${API_BASE}/api/match-keyword`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: urlToMatch,
                slug: data.slug,
                category: categoryName
              }),
            });
            const keywordData = await keywordResponse.json();

            if (keywordResponse.ok && keywordData.keywords && keywordData.keywords.length > 0) {
              const mainKw = keywordData.keyword || keywordData.keywords[0];
              const allKws = keywordData.keywords;
              const status = `Loaded content & matched ${keywordData.keywords.length} keyword(s) from "${keywordData.category}"`;

              setMainKeyword(mainKw);
              setAllKeywords(allKws);
              setStrapiStatus(status);
              console.log(`Auto-matched keywords:`, allKws);

              // Cache the page details
              setCachedData(cacheKey, {
                content: data.content,
                mainKeyword: mainKw,
                allKeywords: allKws,
                status: status
              });
            } else if (keywordResponse.status === 404 || keywordData.notFound) {
              // Page not found in keywords.json
              const errorMsg = keywordData.message || "No keywords found for this page in keywords.json. Please add this page to keywords.json or fetch keywords from Strapi.";
              setStrapiStatus(`⚠️ ${keywordData.message || 'Page not found in keywords.json'}`);
              setMainKeyword("");
              setAllKeywords([]);
              setError(errorMsg);
              console.warn(`❌ Page "${data.slug}" not found in keywords.json`);

              // Don't cache when there's an error
            } else {
              setStrapiStatus("Loaded content (no matching keyword found in keywords.json)");
              setMainKeyword("");
              setAllKeywords([]);
            }
          } catch (keywordErr) {
            console.error("Keyword matching error:", keywordErr);
            setStrapiStatus("Loaded content (keyword matching failed)");
          }
        } else {
          setStrapiStatus("Loaded content (no URL/slug available for keyword matching)");
        }
      } else {
        const errorMsg = data.error || data.message || "Failed to load page details";
        console.error("Backend error:", data);
        setStrapiStatus(`Error: ${errorMsg}`);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Fetch details error:", err);
      const errorMsg = err.message || "Error loading details";
      setStrapiStatus(`Error: ${errorMsg}`);
      setError(`Failed to load page details: ${errorMsg}`);
    }
  };

  const rephraseFaqs = async (faqs) => {
    try {
      const response = await fetch(`${API_BASE}/api/rephrase-faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs, content, keywordsData }),
      });
      const data = await response.json();

      console.log("Rephrased Response:", data);
      let normalized = [];
      if (Array.isArray(data)) {
        normalized = data;
      } else if (data.rephrased && Array.isArray(data.rephrased)) {
        normalized = data.rephrased;
      } else if (data.result && Array.isArray(data.result)) {
        normalized = data.result;
      } else {
        console.warn("Unexpected rephrase response:", data);
      }

      setRephrasedFaqs(normalized);
    } catch (err) {
      console.error("Rephrase error:", err);
    }
  };

  const handleCopyPAA = useCallback((index) => {
    setCopiedPAAIndex(index);
  }, []);

  const handleCopyContent = useCallback((index) => {
    setCopiedContentIndex(index);
  }, []);

  const handleStart = async () => {
    if (!selectedStrapiCollection || !selectedStrapiPage) {
      setError("Please select a Strapi collection and page first.");
      return;
    }
    if (!mainKeyword && allKeywords.length === 0) {
      setError("No keywords found. Please select a page with keywords in keywords.json.");
      return;
    }

    setError("");
    setLoading(true);
    setFaqs([]);
    setContentFaqs([]);
    setSerpQuestions([]);

    try {
      if (!content || content.trim().length < 100) {
        throw new Error("Content not available. Please select a page first.");
      }

      const keywordsToUse = allKeywords.length > 0 ? allKeywords : [mainKeyword];
      const totalKeywords = keywordsToUse.length;
      let allSerpQuestions = [];
      console.log(`Fetching PPA+Google questions for ${totalKeywords} keyword(s)...`);
      for (let i = 0; i < keywordsToUse.length; i++) {
        const kw = keywordsToUse[i];
        if (!kw || kw.trim().length === 0) continue;
        setStrapiStatus(`[${i + 1}/${totalKeywords}] Fetching questions for: "${kw}"...`);

        try {
          const serpResponse = await fetch(`${API_BASE}/api/fetch-serp-questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyword: kw.trim() }),
          });
          const serpData = await serpResponse.json();

          if (serpData.questions && serpData.questions.length > 0) {
            const questionWords = ['how', 'what', 'when', 'where', 'why', 'who', 'which', 'can', 'does', 'is', 'are', 'will', 'should', 'could', 'would'];
            const filteredQuestions = serpData.questions.filter(q => {
              const lowerQ = q.toLowerCase().trim();
              return (
                lowerQ.endsWith('?') ||
                questionWords.some(word => lowerQ.startsWith(word + ' '))
              );
            });

            allSerpQuestions = [...allSerpQuestions, ...filteredQuestions];
            console.log(`   ✓ Found ${filteredQuestions.length} questions for "${kw}"`);
          }
        } catch (e) {
          console.error(`   ✗ Failed to fetch SERP for "${kw}"`, e);
        }
        if (i < keywordsToUse.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      allSerpQuestions = [...new Set(allSerpQuestions)]
        .filter(q => q && q.trim().length > 10)
        .slice(0, 50);

      // Fallback: Generate questions using AI if no SERP questions found
      if (allSerpQuestions.length === 0) {
        console.log('No SERP questions found, using AI fallback to generate questions...');
        setStrapiStatus('No Google questions found. Generating questions using AI...');

        try {
          const fallbackResponse = await fetch(`${API_BASE}/api/generate-fallback-questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              keyword: mainKeyword || keywordsToUse[0],
              content: content.substring(0, 3000) // Limit content length
            }),
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.questions && fallbackData.questions.length > 0) {
              allSerpQuestions = fallbackData.questions;
              console.log(`✓ Generated ${allSerpQuestions.length} AI fallback questions`);
              setStrapiStatus(`Generated ${allSerpQuestions.length} AI-generated questions. Creating FAQs...`);
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback question generation failed:', fallbackErr);
        }
      }

      setSerpQuestions(allSerpQuestions);
      console.log(`Total unique questions: ${allSerpQuestions.length}`);
      setStrapiStatus(`Found ${allSerpQuestions.length} unique questions from ${totalKeywords} keyword(s). Generating FAQs...`);
      setStrapiStatus("Generating content-based FAQs...");
      const contentFaqResponse = await fetch(`${API_BASE}/api/generate-content-faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: mainKeyword || keywordsToUse[0],
          content: content,
          keywordsData
        }),
      });
      const contentFaqData = await contentFaqResponse.json();
      setContentFaqs(contentFaqData.faqs || []);
      console.log(`Generated ${(contentFaqData.faqs || []).length} content-based FAQs`);

      if (contentFaqData.faqs && contentFaqData.faqs.length > 0) {
        setStrapiStatus("Rephrasing content FAQs...");
        await rephraseFaqs(contentFaqData.faqs);
      }
      if (allSerpQuestions.length > 0) {
        setStrapiStatus("Generating PAA + Google FAQs from questions...");
        const paaResponse = await fetch(`${API_BASE}/api/generate-faqs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword: mainKeyword || keywordsToUse[0],
            content: content,
            serpQuestions: allSerpQuestions,
            keywordsData
          }),
        });
        const paaData = await paaResponse.json();
        setFaqs(paaData.faqs || []);
        console.log(`Generated ${(paaData.faqs || []).length} PAA+Google FAQs`);
      }
      setStrapiStatus(`FAQ Generation Complete! (${(contentFaqData.faqs || []).length} content FAQs, ${faqs.length} PAA FAQs)`);
    } catch (err) {
      console.error("FAQ Generation error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      {loading && (
        <LoadingSpinner
          text={strapiStatus || "Generating FAQs..."}
          fullScreen={true}
          variant="pulse"
          color="#FF6700"
          showProgress={true}
        />
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      <div className="w-[95%] mx-auto">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-[rgb(230,90,0)] text-3xl md:text-4xl font-extrabold text-center mb-4 tracking-tight">
            Strapi FAQ Generator
          </h1>
          <p className="text-[#475569] text-center text-lg">
            Fetch content from Strapi → Generate FAQs
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Select Strapi Collection
            </label>
            <select
              value={selectedStrapiCollection}
              onChange={(e) => {
                setSelectedStrapiCollection(e.target.value);
                setSelectedStrapiPage("");
                setStrapiPages([]);
                setError(""); // Clear error on selection change
                // Clear generated FAQs
                setContentFaqs([]);
                setFaqs([]);
                setRephrasedFaqs([]);
              }}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[rgb(230,90,0)] transition-all duration-300 hover:border-[rgb(230,90,0)]"
            >
              <option value="">-- Select Collection --</option>
              {STRAPI_COLLECTIONS.map((col) => (
                <option key={col.value} value={col.value}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Select Page
            </label>
            <select
              value={selectedStrapiPage}
              onChange={(e) => {
                setSelectedStrapiPage(e.target.value);
                setContent("");
                setMainKeyword("");
                setAllKeywords([]);
                setStrapiStatus("");
                setError(""); // Clear error on selection change
                // Clear generated FAQs
                setContentFaqs([]);
                setFaqs([]);
                setRephrasedFaqs([]);

                if (e.target.value) {
                  fetchPageDetails(e.target.value);
                }
              }}
              disabled={!selectedStrapiCollection || strapiPages.length === 0}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[rgb(230,90,0)] disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300 hover:border-[rgb(230,90,0)]"
            >
              <option value="">-- Select Page --</option>
              {strapiPages.map((page, i) => {
                // Get the title and strip HTML tags
                const rawTitle = page.meta_data_title || page.title || page.slug || `Page ${page.id}`;
                const cleanTitle = stripHtml(rawTitle);
                const displayText = cleanTitle + (page.slug ? ` (${page.slug})` : '');

                return (
                  <option key={i} value={page.id}>
                    {displayText}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={handleStart}
            disabled={loading || error !== ""}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Start Generating FAQs"}
          </button>
        </div>

        {strapiStatus && (
          <p
            className={`font-semibold mb-4 animate-fade-in ${strapiStatus.startsWith("✅")
              ? "text-green-600"
              : "text-gray-600"
              }`}
          >
            {strapiStatus}
          </p>
        )}

        {error && <p className="text-red-600 font-semibold mb-4 animate-fade-in">{error}</p>}

        {allKeywords.length > 0 && (
          <div className="mb-6 p-4 rounded-lg shadow-sm animate-fade-in transition-all duration-500 hover:shadow-md">
            <h3 className="font-bold text-gray-700 mb-3">Matched Keywords:</h3>
            <div className="flex flex-wrap gap-3">
              {allKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-sm font-medium text-gray-800 pb-[2px] transition-all hover:border-blue-500 hover:text-blue-600 cursor-default"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Show FAQ sections only after FAQs are generated */}
        {!loading && (contentFaqs.length > 0 || faqs.length > 0) && (
          <div className="w-[95%] mx-auto my-10 flex flex-col md:flex-row justify-between items-stretch gap-1 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Content-Based FAQs */}
            <div className="w-full md:w-[48%] flex flex-col bg-white shadow-xl rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-black">
                  Content-Based FAQs ({contentFaqs.length})
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {contentFaqs.length > 0 ? (
                  contentFaqs.map((faq, i) => (
                    <FAQCard
                      key={i}
                      faq={faq}
                      index={i}
                      copiedIndex={copiedContentIndex}
                      onCopy={handleCopyContent}
                      onCopyRephrased={setCopiedContentIndex}
                      rephrasedData={rephrasedFaqs[i]}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg mb-2">No content-based FAQs generated</p>
                    <p className="text-sm">Try generating FAQs by clicking "Start Generating FAQs"</p>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full md:w-[48%] flex flex-col bg-white shadow-xl rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  PAA + Google FAQs ({faqs.length})
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {faqs.length > 0 ? (
                  faqs.map((faq, i) => (
                    <FAQCard
                      key={i}
                      faq={faq}
                      index={i}
                      copiedIndex={copiedPAAIndex}
                      onCopy={handleCopyPAA}
                      onCopyRephrased={setCopiedPAAIndex}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg mb-2">No PAA/Google FAQs found</p>
                    <p className="text-sm">No related questions were found for this keyword</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
