import { sanitizeHtml } from "./ai-purifier";

const safeHtml = (html) => ({ __html: sanitizeHtml(html || "") });

function FAQItem({
  faq,
  index,
  copiedIndex,
  onCopy,
  rephrasedData,
  onCopyRephrased,
}) {
  return (
    <div className="border-l-4 pl-4 mb-6">
      <h3 className="font-bold text-black">
        Q{index + 1}: {faq.question}
      </h3>

      <p
        className="text-black mt-2"
        dangerouslySetInnerHTML={safeHtml(faq.answer)}
      />

      {rephrasedData?.rephrased && (
        <details className="mt-3 bg-gray-50 rounded-lg p-3 border">
          <summary className="cursor-pointer font-semibold text-[rgb(255,103,0)]">
            View Rephrased Versions
          </summary>

          <div className="mt-3 space-y-4">
            {["version_1", "version_2"].map((v, i) => {
              const data = rephrasedData.rephrased[v];
              if (!data) return null;

              return (
                <div
                  key={v}
                  className="flex justify-between items-start bg-white p-3 rounded border"
                >
                  <div className="flex-1">
                    <p className="font-semibold">
                      Q{i + 1}: {data.question}
                    </p>
                    <p
                      className="text-sm mt-1"
                      dangerouslySetInnerHTML={safeHtml(data.answer)}
                    />
                  </div>

                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        `Q: ${data.question}\nA: ${data.answer}`
                      );
                      onCopyRephrased(`${v}-${index}`);
                      setTimeout(() => onCopyRephrased(null), 2000);
                    }}
                    className={`ml-4 px-3 py-1 rounded text-white ${
                      copiedIndex === `${v}-${index}`
                        ? "bg-[rgb(255,103,0)]"
                        : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)]"
                    }`}
                  >
                    {copiedIndex === `${v}-${index}` ? "Copied!" : "Copy"}
                  </button>
                </div>
              );
            })}
          </div>
        </details>
      )}

      <button
        onClick={async () => {
          await navigator.clipboard.writeText(
            `Q: ${faq.question}\nA: ${faq.answer}`
          );
          onCopy(index);
          setTimeout(() => onCopy(null), 2000);
        }}
        className={`mt-3 px-4 py-2 rounded text-white ${
          copiedIndex === index
            ? "bg-[rgb(255,103,0)]"
            : "bg-[rgb(255,103,0)] hover:bg-[rgb(230,90,0)]"
        }`}
      >
        {copiedIndex === index ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
export default function FAQSection({
  title,
  faqs = [],
  rephrasedFaqs = [],
  copiedIndex,
  onCopy,
  onCopyRephrased,
  emptyText = "No FAQs available",
}) {
  return (
    <div className="w-full md:w-[48%] flex flex-col bg-white shadow-xl rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6">
        {title} ({faqs.length})
      </h2>

      <div className="flex-1 overflow-y-auto">
        {faqs.length > 0 ? (
          faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              copiedIndex={copiedIndex}
              onCopy={onCopy}
              onCopyRephrased={onCopyRephrased}
              rephrasedData={rephrasedFaqs?.[i]}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">{emptyText}</p>
        )}
      </div>
    </div>
  );
}
