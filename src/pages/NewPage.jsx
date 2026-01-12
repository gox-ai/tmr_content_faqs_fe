import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import FAQSection from "./FAQCard";
import { normalizeFaqs } from "./ai-purifier";
import { fetchJsonOrThrow } from "../utils/api";
const cleanKeywords = (keywords) => {
  if (!Array.isArray(keywords)) return [];
  return keywords
    .map((k) => (typeof k === "string" ? k : k?.list_of_keywords || ""))
    .filter((k) => k && k.trim().length > 0);
};
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

  const API_BASE = process.env.REACT_APP_API_URL;

  const fetchSerpQuestions = async () => {
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchJsonOrThrow(
        `${API_BASE}/api/fetch-serp-questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword }),
        }
      );

      if (!data.questions?.length) {
        throw new Error("No questions found for this keyword.");
      }

      setSerpQuestions(data.questions);
      await generateFaqs(data.questions);
      await generateContentFaqs();
    } catch (err) {
      setError(err.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const generateFaqs = async (questions) => {
    try {
      if (!content.trim()) {
        throw new Error("Please provide content to generate FAQs.");
      }

      setFaqs([]);
      setAutoShowFaqs(false);

      const data = await fetchJsonOrThrow(`${API_BASE}/api/generate-faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, content, serpQuestions: questions }),
      });

      if (!data.faqs?.length) {
        throw new Error("AI could not generate FAQs.");
      }

      setFaqs(normalizeFaqs(data.faqs));
      setAutoShowFaqs(true);
    } catch (err) {
      console.error("Error generating FAQs:", err);
      throw err; // Re-throw to be caught by parent try-catch
    }
  };

  const generateContentFaqs = async () => {
    try {
      if (!content.trim()) {
        throw new Error(
          "Please provide content to generate content-based FAQs."
        );
      }

      const keywordsToUse = cleanKeywords(strapiKeywords);
      const mainKeyword = keyword || keywordsToUse[0];

      const data = await fetchJsonOrThrow(`${API_BASE}/api/generate-faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: mainKeyword,
          content,
          serpQuestions: [],
          keywordsData: strapiKeywords,
        }),
      });

      if (!data.faqs?.length) return;

      setContentFaqs(normalizeFaqs(data.faqs));

      try {
        const rephrased = await fetchJsonOrThrow(
          `${API_BASE}/api/rephrase-faqs`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ faqs: data.faqs, content }),
          }
        );

        setRephrasedFaqs(rephrased);
      } catch (rephraseErr) {
        console.error("Error rephrasing FAQs:", rephraseErr);
        // Don't throw - rephrasing is optional, continue without it
      }
    } catch (err) {
      console.error("Error generating content FAQs:", err);
      throw err; // Re-throw to be caught by parent try-catch
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
              {/* <button
                onClick={fetchStrapiKeywords}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Fetch Keywords from Strapi
              </button> */}

              <button
                onClick={fetchSerpQuestions}
                disabled={loading || error !== ""}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Start Generating FAQs"}
              </button>
            </div>

            {strapiStatus && (
              <div
                className={`mt-4 font-semibold ${
                  strapiStatus.startsWith("✅")
                    ? "text-green-600"
                    : strapiStatus.startsWith("⚠️")
                    ? "text-amber-600"
                    : strapiStatus.startsWith("❌")
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {strapiStatus}
              </div>
            )}

            {error && (
              <div className="mt-4 text-red-600 font-medium">{error}</div>
            )}
          </div>
        )}

        {!autoShowFaqs && serpQuestions.length > 0 && faqs.length === 0 && (
          <div className="bg-white rounded-2xl p-8 mt-8 shadow-md">
            <h2 className="text-2xl font-bold text-black mb-4">
              These are the fetched Google questions, wait for a minute working
              else try again.
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
        {!loading && (contentFaqs.length > 0 || faqs.length > 0) && (
          <div className="w-[95%] mx-auto my-10 flex flex-col md:flex-row gap-4">
            <FAQSection
              title="Content-Based FAQs"
              faqs={contentFaqs}
              rephrasedFaqs={rephrasedFaqs}
              copiedIndex={copiedContentIndex}
              onCopy={setCopiedContentIndex}
              onCopyRephrased={setCopiedContentIndex}
              emptyText="No content-based FAQs generated"
            />

            <FAQSection
              title="PAA + Google FAQs"
              faqs={faqs}
              copiedIndex={copiedPAAIndex}
              onCopy={setCopiedPAAIndex}
              onCopyRephrased={setCopiedPAAIndex}
              emptyText="No PAA / Google FAQs found"
            />
          </div>
        )}
      </div>
    </div>
  );
}
