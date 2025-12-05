import React, { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
const API_BASE = "http://localhost:5001";

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
  const [interlinks, setInterlinks] = useState([]);
  const [keywordsData, setKeywordsData] = useState(null);
  useEffect(() => {
    fetch('/keywords.json')
      .then(res => res.json())
      .then(data => {
        console.log("Loaded keywords.json for interlinking");
        setKeywordsData(data);
      })
      .catch(err => console.error("Failed to load keywords.json", err));
  }, []);
  const [strapiCollections] = useState([
    { label: 'SEO Pages', value: 'seo-pages' },
    { label: 'Features Pages', value: 'feature-pages' },
    { label: 'Integrations Page', value: 'integration-pages' },
    { label: 'Templates Pages', value: 'template-pages' },
    { label: 'Google Sheets Templates', value: 'google-sheets-template-pages' },
    { label: 'Looker Studio Templates', value: 'looker-studio-template-pages' },
    { label: 'Solution Pages', value: 'solution-pages' },
    { label: 'Cluster Pages', value: 'cluster-pages' },
    { label: 'Connector Pages', value: 'connector-pages' },
    { label: 'Blogs', value: 'topical-authority-pages' },
    { label: 'Competitor Comparison', value: 'competitor-comparison-pages' },
    { label: 'Alternative Pages', value: 'alternative-pages-v2s' },
    { label: 'Case Studies', value: 'case-studies' },
    { label: 'Reporting Tool Pages', value: 'reporting-tool-pages-v2' },
    { label: 'Addon Pages', value: 'addon-pages' },
    { label: 'Integration to Google Sheets', value: 'integration-to-google-sheets-pages' },
    { label: 'Integration to Looker Studio', value: 'integration-to-looker-studio-pages' },
    { label: 'Documents', value: 'documents-pages' },
    { label: 'Other Pages', value: 'other-pages' },
  ]);

  const [selectedStrapiCollection, setSelectedStrapiCollection] = useState("");
  const [strapiPages, setStrapiPages] = useState([]);
  const [selectedStrapiPage, setSelectedStrapiPage] = useState("");
  useEffect(() => {
    if (selectedStrapiCollection) {
      fetchStrapiPages();
    }
  }, [selectedStrapiCollection]);

  const fetchStrapiPages = async () => {
    try {
      setStrapiStatus("⏳ Loading pages from Strapi...");
      const response = await fetch(`${API_BASE}/api/fetch-strapi-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: selectedStrapiCollection }),
      });
      const data = await response.json();

      if (response.ok && data.pages) {
        console.log("📦 Received pages from backend:", data.pages);
        setStrapiPages(data.pages);
        setStrapiStatus(`✅ Loaded ${data.pages.length} pages`);
      } else {
        setStrapiStatus("❌ Failed to load pages");
        setStrapiPages([]);
      }
    } catch (err) {
      console.error("Fetch Strapi pages error:", err);
      setStrapiStatus("❌ Error loading pages");
      setStrapiPages([]);
    }
  };

  const fetchPageDetails = async (pageId) => {
    try {
      setStrapiStatus("⏳ Fetching page details...");
      const response = await fetch(`${API_BASE}/api/fetch-strapi-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: selectedStrapiCollection,
          pageId: pageId
        }),
      });
      const data = await response.json();

      if (response.ok && data.content) {
        setContent(data.content);
        console.log(`Loaded content: ${data.content.length} chars`);
        const urlToMatch = data.url || data.slug;
        const collectionToCategoryMap = {
          'seo-pages': 'SEO Pages',
          'feature-pages': 'Features Pages',
          'integration-pages': 'Integrations Page',
          'template-pages': 'Templates Pages',
          'google-sheets-template-pages': 'Google Sheets Templates',
          'looker-studio-template-pages': 'Looker Studio Templates',
          'solution-pages': 'Solution Pages',
          'cluster-pages': 'Cluster Pages',
          'connector-pages': 'Connector Pages',
          'topical-authority-pages': 'Blogs',
          'competitor-comparison-pages': 'Competitor Comparison',
          'alternative-pages-v2s': 'Alternative Pages',
          'case-studies': 'Case Studies',
          'reporting-tool-pages-v2': 'Reporting Tool Pages',
          'addon-pages': 'Addon Pages',
          'integration-to-google-sheets-pages': 'Integration to Google Sheets',
          'integration-to-looker-studio-pages': 'Integration to Looker Studio',
          'documents-pages': 'Documents',
          'other-pages': 'Other Pages',
        };

        const categoryName = collectionToCategoryMap[selectedStrapiCollection] || '';

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

            if (keywordData.keywords && keywordData.keywords.length > 0) {
              setMainKeyword(keywordData.keyword || keywordData.keywords[0]);
              setAllKeywords(keywordData.keywords);
              setStrapiStatus(`Loaded content & matched ${keywordData.keywords.length} keyword(s) from "${keywordData.category}"`);
              console.log(`Auto-matched keywords:`, keywordData.keywords);
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
        setStrapiStatus("Failed to load page details");
      }
    } catch (err) {
      console.error("Fetch details error:", err);
      setStrapiStatus("Error loading details");
    }
  };

  const fetchInterlinking = async () => {
    try {
      const response = await fetch(`${API_BASE}/interlink`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: mainKeyword }),
      });
      const data = await response.json();
      setInterlinks(data.links || []);
    } catch (err) {
      console.error("Interlink error:", err);
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
      let localContent = "";
      setStrapiStatus("Fetching page content from Strapi...");
      const contentResponse = await fetch(`${API_BASE}/api/fetch-strapi-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: selectedStrapiCollection,
          pageId: selectedStrapiPage
        }),
      });
      const contentData = await contentResponse.json();
      if (!contentData.content || contentData.content.trim().length < 100)
        throw new Error("Strapi content seems empty or unavailable.");
      localContent = contentData.content;
      console.log(`Fetched ${localContent.length} characters from Strapi`);

      setContent(localContent);
      let allSerpQuestions = [];
      const keywordsToUse = allKeywords.length > 0 ? allKeywords : [mainKeyword];
      const totalKeywords = keywordsToUse.length;

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
      setSerpQuestions(allSerpQuestions);
      console.log(`Total unique questions: ${allSerpQuestions.length}`);
      setStrapiStatus(`Found ${allSerpQuestions.length} unique questions from ${totalKeywords} keyword(s). Generating FAQs...`);
      setStrapiStatus("Generating content-based FAQs...");
      const contentFaqResponse = await fetch(`${API_BASE}/api/generate-content-faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: mainKeyword || keywordsToUse[0],
          content: localContent,
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
            content: localContent,
            serpQuestions: allSerpQuestions,
            keywordsData
          }),
        });
        const paaData = await paaResponse.json();
        setFaqs(paaData.faqs || []);
        console.log(`Generated ${(paaData.faqs || []).length} PAA+Google FAQs`);
      }
      setStrapiStatus("Fetching related links...");
      await fetchInterlinking();

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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-[rgb(230,90,0)] text-3xl md:text-4xl font-extrabold text-center mb-4 tracking-tight">
            Strapi FAQ Generator
          </h1>
          <p style={{ color: "#475569" }} className="text-center text-lg">
            Fetch content from Strapi → Generate FAQs
          </p>
        </div>

        {/* Strapi Selection Fields */}
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
              }}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[rgb(230,90,0)] transition-all duration-300 hover:border-[rgb(230,90,0)]"
            >
              <option value="">-- Select Collection --</option>
              {strapiCollections.map((col) => (
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
                if (e.target.value) {
                  fetchPageDetails(e.target.value);
                }
              }}
              disabled={!selectedStrapiCollection || strapiPages.length === 0}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[rgb(230,90,0)] disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300 hover:border-[rgb(230,90,0)]"
            >
              <option value="">-- Select Page --</option>
              {strapiPages.map((page, i) => (
                <option key={i} value={page.id}>
                  {(page.title || page.meta_data_title || page.slug || `Page ${page.id}`) + (page.slug ? ` (${page.slug})` : '')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={handleStart}
            disabled={loading}
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

        {(contentFaqs.length > 0 || faqs.length > 0) && (
          <div className="w-[95%] mx-auto my-10 flex flex-col md:flex-row justify-between items-stretch gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="w-full md:w-[48%] flex flex-col bg-white shadow-xl rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-black">
                  Content-Based FAQs ({contentFaqs.length})
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {contentFaqs.map((faq, i) => (
                  <div key={i} className="border-l-4 border-blue-500 pl-4 mb-8 transition-all duration-300 hover:bg-slate-50 rounded-r-lg p-2">
                    <h3 className="font-bold text-lg text-black mb-2">
                      Q{i + 1}: {faq.question}
                    </h3>
                    <p
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />

                    <details className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200 group">
                      <summary className="cursor-pointer font-semibold text-[rgb(255,103,0)] hover:text-[rgb(230,90,0)] transition-colors duration-200 flex items-center gap-2">
                        <span>View Rephrased Versions</span>
                        <span className="group-open:rotate-180 transition-transform duration-300">v</span>
                      </summary>

                      <div className="mt-4 pl-2 space-y-4 text-gray-800 border-t pt-3 animate-fade-in">
                        {rephrasedFaqs[i]?.rephrased?.version_1 ? (
                          <>
                            <div className="bg-white p-3 rounded shadow-sm">
                              <p className="font-semibold text-sm text-gray-500 mb-1">Version 1</p>
                              <p className="font-medium mb-1">
                                {rephrasedFaqs[i].rephrased.version_1?.question || ""}
                              </p>
                              <p
                                className="text-gray-600 text-sm"
                                dangerouslySetInnerHTML={{
                                  __html: rephrasedFaqs[i].rephrased.version_1?.answer || "",
                                }}
                              />
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                              <p className="font-semibold text-sm text-gray-500 mb-1">Version 2</p>
                              <p className="font-medium mb-1">
                                {rephrasedFaqs[i].rephrased.version_2?.question || ""}
                              </p>
                              <p
                                className="text-gray-600 text-sm"
                                dangerouslySetInnerHTML={{
                                  __html: rephrasedFaqs[i].rephrased.version_2?.answer || "",
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 italic">Loading rephrased versions...</p>
                        )}
                      </div>
                    </details>

                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          `Q: ${faq.question}\nA: ${faq.answer}`
                        );
                        setCopiedContentIndex(i);
                        setTimeout(() => setCopiedContentIndex(null), 2000);
                      }}
                      className={`mt-4 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform active:scale-95 ${copiedContentIndex === i
                        ? "bg-green-600 shadow-inner"
                        : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)] hover:shadow-md"
                        }`}
                    >
                      {copiedContentIndex === i ? (
                        <span className="flex items-center gap-2">✓ Copied!</span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                          Copy
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full md:w-[48%] flex flex-col bg-white shadow-xl rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  PAA + Google FAQs ({faqs.length})
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-l-4 border-green-500 pl-4 mb-8 transition-all duration-300 hover:bg-slate-50 rounded-r-lg p-2">
                    <h3 className="font-bold text-lg text-black mb-2">
                      Q{i + 1}: {faq.question}
                    </h3>
                    <p
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />

                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          `Q: ${faq.question}\nA: ${faq.answer}`
                        );
                        setCopiedPAAIndex(i);
                        setTimeout(() => setCopiedPAAIndex(null), 2000);
                      }}
                      className={`mt-4 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 transform active:scale-95 ${copiedPAAIndex === i
                        ? "bg-green-600 shadow-inner"
                        : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)] hover:shadow-md"
                        }`}
                    >
                      {copiedPAAIndex === i ? (
                        <span className="flex items-center gap-2">✓ Copied!</span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                          Copy
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {interlinks.length > 0 && (
          <div className="mt-8 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Related Links
            </h2>
            <ul className="list-disc ml-6 text-blue-600">
              {interlinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
