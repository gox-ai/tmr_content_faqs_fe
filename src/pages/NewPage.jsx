import React, { useState, useCallback } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { getCachedData, setCachedData, getCacheAge } from "../utils/cacheUtils";
function FAQCard({ faq, index, copiedIndex, onCopy, rephrasedData, onCopyRephrased }) {
  return (
    <div className="border-l-4 pl-4 mb-6">
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

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [serpQuestions, setSerpQuestions] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [error, setError] = useState("");
  const [strapiKeywords, setStrapiKeywords] = useState([]);
  const [autoShowFaqs, setAutoShowFaqs] = useState(false);
  const [strapiStatus, setStrapiStatus] = useState("");
  const [contentFaqs, setContentFaqs] = useState([]);
  const [copiedPAAIndex, setCopiedPAAIndex] = useState(null);
  const [copiedContentIndex, setCopiedContentIndex] = useState(null);
  const [rephrasedFaqs, setRephrasedFaqs] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL

  const fetchStrapiKeywords = async () => {
    try {
      // Check cache first
      const cacheKey = 'strapi_keywords';
      const cachedKeywords = getCachedData(cacheKey);
      const cacheAge = getCacheAge(cacheKey);

      if (cachedKeywords) {
        console.log(`✅ Using cached keywords (age: ${cacheAge?.toFixed(1)}h)`);
        setStrapiKeywords(cachedKeywords);
        setStrapiStatus(`✅ Keywords loaded from cache (${cacheAge?.toFixed(1)} hours old)`);
        return;
      }

      setStrapiStatus("⏳ Fetching keywords from Strapi...");
      const response = await fetch(`${API_BASE}/strapi/faq`);
      const data = await response.json();

      if (response.ok) {
        console.log("✅ Keywords fetched successfully:", data);
        const keywords = data.result || data;
        setStrapiKeywords(keywords);
        setStrapiStatus("✅ Keywords.json updated successfully!");
        // Cache the keywords
        setCachedData(cacheKey, keywords);
      } else {
        console.error("⚠️ Backend error:", data);
        setStrapiStatus("⚠️ Backend failed to generate keywords.");
      }
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setStrapiStatus("❌ Failed to fetch keywords from Strapi.");
    }
  };

  const fetchSerpQuestions = async () => {
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }
    setLoading(true);
    setError("");
    setSerpQuestions([]);
    setFaqs([]);
    setAutoShowFaqs(false);
    try {
      const response = await fetch(`${API_BASE}/api/fetch-serp-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setSerpQuestions(data.questions);
        await generateFaqs(data.questions);
        await generateContentFaqs();
      } else {
        setError("No questions found for this keyword. or Network Problem !");
      }
    } catch (err) {
      setError(`Failed to fetch questions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateFaqs = async (questions = serpQuestions) => {
    if (!content.trim()) {
      setError("Please provide content to generate FAQs.");
      return;
    }

    setLoading(true);
    setError("");
    setFaqs([]);
    setAutoShowFaqs(false);

    try {
      const response = await fetch(`${API_BASE}/api/generate-faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, content, serpQuestions: questions }),
      });

      const data = await response.json();

      if (data.faqs?.length > 0) {
        setFaqs(data.faqs);
        setAutoShowFaqs(true);
      } else {
        setError("AI could not generate FAQs.");
      }
    } catch (err) {
      setError(`Failed to generate FAQs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateContentFaqs = async () => {
    if (!content.trim()) {
      setError("Please provide content to generate content-based FAQs.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/generate-content-faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, content }),
      });

      const data = await response.json();

      if (data.faqs && data.faqs.length > 0) {
        setContentFaqs(data.faqs);

        const rephraseResponse = await fetch(`${API_BASE}/api/rephrase-faqs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ faqs: data.faqs, content }),
        });

        const rephrased = await rephraseResponse.json();
        setRephrasedFaqs(rephrased);

        if (strapiKeywords && Object.keys(strapiKeywords).length > 0) {
          const interlinkResponse = await fetch(`${API_BASE}/api/interlink-faqs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              faqs: rephrased.map((r) => r.rephrased.version_1),
              keywords: strapiKeywords,
            }),
          });

          const interlinkedData = await interlinkResponse.json();

          if (interlinkedData.interlinked) {
            console.log("🔗 Interlinked FAQs:", interlinkedData.interlinked);
            setContentFaqs(interlinkedData.interlinked);
          } else {
            console.warn("Interlinking returned no data");
          }
        } else {
          console.warn("No Strapi keywords available for interlinking.");
        }
      } else {
        console.warn("No content-based FAQs generated.");
      }
    } catch (err) {
      console.error("Content-based FAQ error:", err);
    }
  };

  const reset = () => {
    setKeyword("");
    setContent("");
    setSerpQuestions([]);
    setFaqs([]);
    setError("");
    setAutoShowFaqs(false);
    setContentFaqs([]);
  };

  const handleCopyPAA = useCallback((index) => {
    setCopiedPAAIndex(index);
  }, []);

  const handleCopyContent = useCallback((index) => {
    setCopiedContentIndex(index);
  }, []);

  return (
    <div className="min-h-screen bg-[#eef2ff] p-8">
      {loading && (
        <LoadingSpinner
          text={strapiStatus || "Generating FAQs..."}
          fullScreen={true}
          variant="orbit"
          color="#FF6700"
          showProgress={true}
        />
      )}
      <div className="w-[95%] mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-[rgb(230,90,0)] text-3xl md:text-4xl font-extrabold text-center mb-4 tracking-tight">
            Content-Based FAQ Generator
          </h1>
          <p className="text-[#475569]">
            Fetch Google questions Generate content-based FAQs
          </p>
        </div>

        {faqs.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-md">
            <label className="block font-semibold mb-2">Keyword</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setError(""); // Clear error on input change
              }}
              placeholder="e.g., marketing reporting software"
              className="w-full p-3 mb-6 rounded-lg border border-gray-300"
            />

            <label className="block font-semibold mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError(""); // Clear error on input change
              }}
              placeholder="Paste your content here..."
              rows={8}
              className="w-full p-3 rounded-lg border border-gray-300 font-mono"
            />

            <div className="text-right mt-6 flex justify-end gap-4">
              <button
                onClick={fetchStrapiKeywords}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Fetch Keywords from Strapi
              </button>

              <button
                onClick={fetchSerpQuestions}
                disabled={loading || error !== ""}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Start Generating FAQs"}
              </button>
            </div>

            {strapiStatus && (
              <div className={`mt-4 font-semibold ${strapiStatus.startsWith("✅") ? "text-green-600" :
                strapiStatus.startsWith("⚠️") ? "text-amber-600" :
                  strapiStatus.startsWith("❌") ? "text-red-600" :
                    "text-gray-600"
                }`}>
                {strapiStatus}
              </div>
            )}

            {error && (
              <div className="mt-4 text-red-600 font-medium">
                {error}
              </div>
            )}
          </div>
        )}

        {!autoShowFaqs && serpQuestions.length > 0 && faqs.length === 0 && (
          <div className="bg-white rounded-2xl p-8 mt-8 shadow-md">
            <h2 className="text-2xl font-bold text-black mb-4">
              These are the fetched Google questions, wait for a minute working else try again.
            </h2>
            <ul className="list-none p-0">
              {serpQuestions.map((q, i) => (
                <li
                  key={i}
                  className="bg-white my-2 p-3 rounded-lg border-l-4 border-red-300 text-black"
                >
                  <b>{i + 1}.</b> {q}
                </li>
              ))}
            </ul>
            <div className="mt-6 text-right">
              <button
                onClick={reset}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {contentFaqs.length > 0 && faqs.length > 0 && (
          <div className="w-[95%] mx-auto my-10 flex flex-col md:flex-row justify-between items-stretch gap-1">
            <div className="w-full md:w-[48%] flex flex-col bg-white shadow-xl rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">
                  Content-Based FAQs ({contentFaqs.length})
                </h2>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      contentFaqs
                        .map((f) => `Q: ${f.question}\\nA: ${f.answer}`)
                        .join("\\n\\n")
                    );
                    setCopiedContentIndex("all");
                    setTimeout(() => setCopiedContentIndex(null), 2000);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition ${copiedContentIndex === "all"
                    ? "bg-[rgb(255,103,0)]"
                    : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)]"
                    }`}
                >
                  {copiedContentIndex === "all" ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {(contentFaqs || [])
                  .filter((faq) => faq && faq.question && faq.answer)
                  .map((faq, i) => (
                    <FAQCard
                      key={i}
                      faq={faq}
                      index={i}
                      copiedIndex={copiedContentIndex}
                      onCopy={handleCopyContent}
                      onCopyRephrased={setCopiedContentIndex}
                      rephrasedData={rephrasedFaqs[i]}
                    />
                  ))}
              </div>
            </div>

            <div className="w-full md:w-[48%] flex flex-col bg-white shadow-xl rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  PAA + Google FAQs ({faqs.length})
                </h2>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      faqs.map((f) => `Q: ${f.question}\\nA: ${f.answer}`).join("\\n\\n")
                    );
                    setCopiedPAAIndex("all");
                    setTimeout(() => setCopiedPAAIndex(null), 2000);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition ${copiedPAAIndex === "all"
                    ? "bg-[rgb(255,103,0)]"
                    : "bg-[rgb(255,103,0)] hover:bg-[rgba(230, 154, 154, 1)]"
                    }`}
                >
                  {copiedPAAIndex === "all" ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {faqs.map((faq, i) => (
                  <FAQCard
                    key={i}
                    faq={faq}
                    index={i}
                    copiedIndex={copiedPAAIndex}
                    onCopy={handleCopyPAA}
                    onCopyRephrased={setCopiedPAAIndex}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
