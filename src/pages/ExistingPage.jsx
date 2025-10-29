import React, { useEffect, useState } from "react";
const API_BASE = "http://localhost:5001";

export default function ExistingPage() {
  const [keywordsData, setKeywordsData] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedUrl, setSelectedUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [mainKeyword, setMainKeyword] = useState("");

  const [content, setContent] = useState("");
  const [serpQuestions, setSerpQuestions] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [contentFaqs, setContentFaqs] = useState([]);
  const [rephrasedFaqs, setRephrasedFaqs] = useState([]);
  const [strapiKeywords, setStrapiKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedPAAIndex, setCopiedPAAIndex] = useState(null);
  const [copiedContentIndex, setCopiedContentIndex] = useState(null);
  const [strapiStatus, setStrapiStatus] = useState("");
  const [interlinks, setInterlinks] = useState([]);
  useEffect(() => {
    fetch("/keywords.json")
      .then((res) => res.json())
      .then((data) => {
        setKeywordsData(data);
        setCategories(Object.keys(data));
      })
      .catch(() => setError("Failed to load keywords.json"));
  }, []);
  useEffect(() => {
    if (selectedCategory && keywordsData[selectedCategory]) {
      setUrls(keywordsData[selectedCategory]);
      setSelectedUrl("");
      setSelectedKeywords([]);
      setFaqs([]);
      setContentFaqs([]);
    }
  }, [selectedCategory, keywordsData]);
  useEffect(() => {
    if (selectedUrl && urls.length > 0) {
      const match = urls.find((item) => item.link === selectedUrl);
      if (match) {
        const kws = match.keyword
          .split(",")
          .map((kw) => kw.trim())
          .filter(Boolean);
        setSelectedKeywords(kws);
        if (kws.length > 0) setMainKeyword(kws[0]);
      }
    }
  }, [selectedUrl, urls]);
  const fetchStrapiKeywords = async () => {
    try {
      setStrapiStatus("⏳ Fetching keywords from Strapi...");
      const response = await fetch(`${API_BASE}/strapi/faq`);
      const data = await response.json();
      if (response.ok) {
        setStrapiKeywords(data.result || data);
        setStrapiStatus("Keywords fetched successfully!");
      } else {
        setStrapiStatus("Backend failed to generate keywords.");
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setStrapiStatus("Failed to fetch keywords from Strapi.");
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
        body: JSON.stringify({ faqs, content }),
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
    if (!selectedUrl || !mainKeyword) {
      setError("Please select a URL and keyword first.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const contentResponse = await fetch(`${API_BASE}/api/fetch-page-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: selectedUrl }),
      });
      const contentData = await contentResponse.json();
      if (!contentData.content || contentData.content.trim().length < 100)
        throw new Error("Fetched content seems empty.");

      const localContent = contentData.content;
      setContent(localContent);
      const serpResponse = await fetch(`${API_BASE}/api/fetch-serp-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: mainKeyword }),
      });
      const serpData = await serpResponse.json();
      setSerpQuestions(serpData.questions || []);
      const contentFaqResponse = await fetch(`${API_BASE}/api/generate-content-faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: mainKeyword, content: localContent }),
      });
      const contentFaqData = await contentFaqResponse.json();
      setContentFaqs(contentFaqData.faqs || []);
      await rephraseFaqs(contentFaqData.faqs || []);
      const paaResponse = await fetch(`${API_BASE}/api/generate-faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: mainKeyword,
          content: localContent,
          serpQuestions: serpData.questions,
        }),
      });
      const paaData = await paaResponse.json();
      setFaqs(paaData.faqs || []);
      await fetchInterlinking();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eef2ff", padding: "2rem" }}>
      <div className="w-[95%] mx-auto">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 className="text-[rgb(230,90,0)] text-3xl md:text-4xl font-extrabold text-center mb-4 tracking-tight">
            Existing Page FAQ Generator
          </h1>
          <p style={{ color: "#475569" }}>
            Fetch Google questions → Generate content-based FAQs
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Select Page Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[rgb(230,90,0)]"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-700">
              Select URL
            </label>
            <select
              value={selectedUrl}
              onChange={(e) => setSelectedUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[rgb(230,90,0)]"
            >
              <option value="">-- Select URL --</option>
              {urls.map((item, i) => (
                <option key={i} value={item.link}>
                  {item.link}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={fetchStrapiKeywords}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Fetch Keywords from Strapi
          </button>

          <button
            onClick={handleStart}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Processing..." : "Start Generating FAQs"}
          </button>
        </div>

        {strapiStatus && (
          <p
            className={`font-semibold mb-4 ${
              strapiStatus.startsWith("✅")
                ? "text-green-600"
                : "text-gray-600"
            }`}
          >
            {strapiStatus}
          </p>
        )}

        {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}
        {contentFaqs.length > 0 && faqs.length > 0 && (
          <div className="w-[95%] mx-auto my-10 flex flex-col md:flex-row justify-between items-stretch gap-1">
            <div className="w-full md:w-[48%] flex flex-col bg-white shadow-xl rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-black">
                  Content-Based FAQs ({contentFaqs.length})
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {contentFaqs.map((faq, i) => (
                  <div key={i} className="border-l-4 pl-4 mb-6">
                    <h3 className="font-bold text-black">
                      Q{i + 1}: {faq.question}
                    </h3>
                    <p
                      className="text-black mt-2"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />

                    <details className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <summary className="cursor-pointer font-semibold text-[rgb(255,103,0)]">
                        View Rephrased Versions
                      </summary>

                      <div className="mt-3 pl-2 space-y-4 text-gray-800">
                        {rephrasedFaqs[i]?.rephrased?.version_1 ? (
                          <>
                            <p className="font-semibold">
                              {rephrasedFaqs[i].rephrased.version_1?.question ||
                                ""}
                            </p>
                            <p
                              dangerouslySetInnerHTML={{
                                __html:
                                  rephrasedFaqs[i].rephrased.version_1?.answer ||
                                  "",
                              }}
                            />
                            <p className="font-semibold mt-3">
                              {rephrasedFaqs[i].rephrased.version_2?.question ||
                                ""}
                            </p>
                            <p
                              dangerouslySetInnerHTML={{
                                __html:
                                  rephrasedFaqs[i].rephrased.version_2?.answer ||
                                  "",
                              }}
                            />
                          </>
                        ) : (
                          <p className="text-gray-500 italic">
                            Rephrased versions not available.
                          </p>
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
                      className={`mt-3 px-4 py-2 rounded-lg font-semibold text-white transition ${
                        copiedContentIndex === i
                          ? "bg-[rgb(255,103,0)]"
                          : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)]"
                      }`}
                    >
                      {copiedContentIndex === i ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-[48%] flex flex-col bg-white shadow-xl rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  PAA + Google FAQs ({faqs.length})
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-l-4 pl-4 mb-6">
                    <h3 className="font-bold text-black">
                      Q{i + 1}: {faq.question}
                    </h3>
                    <p className="text-slate-800 mt-2">{faq.answer}</p>

                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          `Q: ${faq.question}\nA: ${faq.answer}`
                        );
                        setCopiedPAAIndex(i);
                        setTimeout(() => setCopiedPAAIndex(null), 2000);
                      }}
                      className={`mt-3 px-4 py-2 rounded-lg font-semibold text-white transition ${
                        copiedPAAIndex === i
                          ? "bg-[rgb(255,103,0)]"
                          : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)]"
                      }`}
                    >
                      {copiedPAAIndex === i ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {interlinks.length > 0 && (
          <div className="mt-8">
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
