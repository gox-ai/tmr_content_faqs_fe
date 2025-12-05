import React, { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
const API_BASE = "http://localhost:5001";

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
  const [allCopied, setAllCopied] = useState(false);
  const [contentFaqs, setContentFaqs] = useState([]);
  const [copiedPAAIndex, setCopiedPAAIndex] = useState(null);
  const [copiedContentIndex, setCopiedContentIndex] = useState(null);
  const [rephrasedFaqs, setRephrasedFaqs] = useState([]);

  const fetchStrapiKeywords = async () => {
    try {
      setStrapiStatus("⏳ Fetching keywords from Strapi...");
      const response = await fetch("http://localhost:5001/strapi/faq");
      const data = await response.json();

      if (response.ok) {
        console.log("✅ Keywords fetched successfully:", data);
        setStrapiKeywords(data.result || data);
        setStrapiStatus("✅ Keywords.json updated successfully!");
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

        // 🔁 Step 1: Rephrase FAQs
        const rephraseResponse = await fetch(`${API_BASE}/api/rephrase-faqs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ faqs: data.faqs, content }),
        });

        const rephrased = await rephraseResponse.json();
        setRephrasedFaqs(rephrased);

        // 🔗 Step 2: Interlink rephrased FAQs with Strapi keywords
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
            console.warn("⚠️ Interlinking returned no data");
          }
        } else {
          console.warn("⚠️ No Strapi keywords available for interlinking.");
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

  return (
    <div style={{ minHeight: "100vh", background: "#eef2ff", padding: "2rem" }}>
      {/* Animated Loading Spinner Overlay */}
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
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 className="text-[rgb(230,90,0)] text-3xl md:text-4xl font-extrabold text-center mb-4 tracking-tight">
            Content-Based FAQ Generator
          </h1>

          <p style={{ color: "#475569" }}>
            Fetch Google questions → Generate content-based FAQs
          </p>
        </div>

        {faqs.length === 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "1rem",
              padding: "2rem",
              boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Keyword
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., marketing reporting software"
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "1.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #cbd5e1",
              }}
            />

            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content here..."
              rows={8}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #cbd5e1",
                fontFamily: "monospace",
              }}
            />

            <div
              style={{
                textAlign: "right",
                marginTop: "1.5rem",
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button
                onClick={fetchStrapiKeywords}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#22c55e",
                  color: "white",
                  fontWeight: "600",
                  border: "none",
                  borderRadius: "0.5rem",
                  marginLeft: "1rem",
                  cursor: "pointer",
                }}
              >
                Fetch Keywords from Strapi
              </button>


              <button
                onClick={fetchSerpQuestions}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#3b82f6",
                  color: "white",
                  fontWeight: "600",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                }}
              >
                {loading ? "Processing..." : "Start Generating FAQs"}
              </button>
            </div>
            {strapiStatus && (
              <div
                style={{
                  marginTop: "1rem",
                  fontWeight: 600,
                  color: strapiStatus.startsWith("✅")
                    ? "green"
                    : strapiStatus.startsWith(" ")
                      ? "#f59e0b"
                      : strapiStatus.startsWith(" ")
                        ? "red"
                        : "#475569",
                }}
              >
                {strapiStatus}
              </div>
            )}



            {error && (
              <div
                style={{
                  marginTop: "1rem",
                  color: "#b91c1c",
                  fontWeight: "500",
                }}
              >
                {error}
              </div>
            )}
          </div>
        )}

        {!autoShowFaqs && serpQuestions.length > 0 && faqs.length === 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "1rem",
              padding: "2rem",
              marginTop: "2rem",
              boxShadow: "0 3px 6px rgba(190, 141, 141, 0.39)",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#0f0d0dff",
                marginBottom: "1rem",
              }}
            >
              These are the fetched Google questions, wait for a minute working else try again.
            </h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {serpQuestions.map((q, i) => (
                <li
                  key={i}
                  style={{
                    background: "#ffffffff",
                    margin: "0.5rem 0",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    borderLeft: "4px solid #f39595ff",
                    color: "#080808ff",
                  }}
                >
                  <b>{i + 1}.</b> {q}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
              <button
                onClick={reset}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: "600",
                }}
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
                        .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
                        .join("\n\n")
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
                    <div key={i} className="border-l-4 pl-4 mb-6">
                      <h3 className="font-bold text-black">
                        Q{i + 1}: {faq.question}
                      </h3>

                      {/* ✅ Use dangerouslySetInnerHTML so interlinked <a> tags render as clickable */}
                      <p
                        className="text-black mt-2"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />

                      <details className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <summary className="cursor-pointer font-semibold text-[rgb(255,103,0)]">
                          View Rephrased Versions
                        </summary>

                        <div className="mt-3 pl-2 space-y-4 text-gray-800">
                          {rephrasedFaqs[i]?.rephrased ? (
                            <>
                              {/* Version 1 */}
                              <div className="flex justify-between items-start bg-white p-3 rounded-md shadow-sm border border-gray-200">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    Q1: {rephrasedFaqs[i].rephrased.version_1?.question || ""}
                                  </p>
                                  <p
                                    className="text-sm leading-relaxed mt-1"
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        rephrasedFaqs[i].rephrased.version_1?.answer || "",
                                    }}
                                  />
                                </div>
                                <button
                                  onClick={async () => {
                                    const text = `Q: ${rephrasedFaqs[i].rephrased.version_1?.question || ""
                                      }\nA: ${rephrasedFaqs[i].rephrased.version_1?.answer || ""
                                      }`;
                                    await navigator.clipboard.writeText(text);
                                    setCopiedContentIndex(`v1-${i}`);
                                    setTimeout(() => setCopiedContentIndex(null), 2000);
                                  }}
                                  className={`ml-4 px-3 py-1 rounded-md text-sm font-semibold text-white transition ${copiedContentIndex === `v1-${i}`
                                      ? "bg-[rgb(255,103,0)]"
                                      : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)]"
                                    }`}
                                >
                                  {copiedContentIndex === `v1-${i}` ? "Copied!" : "Copy"}
                                </button>
                              </div>

                              {/* Version 2 */}
                              <div className="flex justify-between items-start bg-white p-3 rounded-md shadow-sm border border-gray-200">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    Q2: {rephrasedFaqs[i].rephrased.version_2?.question || ""}
                                  </p>
                                  <p
                                    className="text-sm leading-relaxed mt-1"
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        rephrasedFaqs[i].rephrased.version_2?.answer || "",
                                    }}
                                  />
                                </div>
                                <button
                                  onClick={async () => {
                                    const text = `Q: ${rephrasedFaqs[i].rephrased.version_2?.question || ""
                                      }\nA: ${rephrasedFaqs[i].rephrased.version_2?.answer || ""
                                      }`;
                                    await navigator.clipboard.writeText(text);
                                    setCopiedContentIndex(`v2-${i}`);
                                    setTimeout(() => setCopiedContentIndex(null), 2000);
                                  }}
                                  className={`ml-4 px-3 py-1 rounded-md text-sm font-semibold text-white transition ${copiedContentIndex === `v2-${i}`
                                      ? "bg-[rgb(255,103,0)]"
                                      : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)]"
                                    }`}
                                >
                                  {copiedContentIndex === `v2-${i}` ? "Copied!" : "Copy"}
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

                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `Q: ${faq.question}\nA: ${faq.answer}`
                          );
                          setCopiedContentIndex(i);
                          setTimeout(() => setCopiedContentIndex(null), 2000);
                        }}
                        className={`mt-3 px-4 py-2 rounded-lg font-semibold text-white transition ${copiedContentIndex === i
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
            <div className="w-full md:w-[48%] flex flex-col bg-white shadow-xl rounded-2xl p-8 ">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  PAA + Google FAQs ({faqs.length})
                </h2>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
                    );
                    setCopiedPAAIndex("all");
                    setTimeout(() => setCopiedPAAIndex(null), 2000);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold text-white transition ${copiedContentIndex === "all"
                      ? "bg-[rgb(255,103,0)]"
                      : "bg-[rgb(255,103,0)] hover:bg-[rgba(230, 154, 154, 1)]"
                    }`}
                >
                  {copiedPAAIndex === "all" ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-l-4  pl-4 mb-6">
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
                      className={`px-4 py-2 rounded-lg font-semibold text-white transition ${copiedContentIndex === "all"
                          ? "bg-[rgb(255,103,0)]"
                          : "bg-[rgb(255,103,0)] hover:bg-[rgba(230, 154, 154, 1)]"
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

      </div>
    </div>
  );
}
