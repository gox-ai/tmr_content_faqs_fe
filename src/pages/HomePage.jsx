import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const tools = [
  {
    category: "FAQ Generator",
    description: "Generate SEO-optimized FAQs powered by AI",
    color: "emerald",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    items: [
      {
        label: "Existing Page",
        sublabel: "Generate FAQs for a live page URL",
        route: "/faqs/existing",
        accent: "emerald",
      },
      {
        label: "New Page",
        sublabel: "Generate FAQs from a topic or keyword",
        route: "/faqs/new",
        accent: "teal",
      },
    ],
  },
  {
    category: "SEO Tools",
    description: "Monitor and analyse your backlink profile",
    color: "violet",
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
    items: [
      {
        label: "Backlink Tracker",
        sublabel: "Track and monitor backlinks over time",
        route: "/backlink-tracker",
        accent: "violet",
      },
    ],
  },
];

const accentMap = {
  emerald: {
    border: "border-emerald-200 hover:border-emerald-400",
    icon: "bg-emerald-50 text-emerald-600",
    arrow: "text-emerald-500",
    hover: "hover:bg-emerald-50",
  },
  teal: {
    border: "border-teal-200 hover:border-teal-400",
    icon: "bg-teal-50 text-teal-600",
    arrow: "text-teal-500",
    hover: "hover:bg-teal-50",
  },
  violet: {
    border: "border-violet-200 hover:border-violet-400",
    icon: "bg-violet-50 text-violet-600",
    arrow: "text-violet-500",
    hover: "hover:bg-violet-50",
  },
};

const categoryAccentMap = {
  emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  violet: "text-violet-600 bg-violet-50 border-violet-100",
};

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-200 px-8 py-5"
      >
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            TMR Tools
          </span>
          <span className="ml-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            Internal
          </span>
        </div>
      </motion.header>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-5xl mx-auto px-8 pt-14 pb-10"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Marketing Toolkit
        </h1>
        <p className="text-gray-500 text-lg max-w-xl">
          AI-powered tools for marketing team — generate FAQs, track backlinks,
          and more.
        </p>
      </motion.div>

      {/* Tool Sections */}
      <div className="max-w-5xl mx-auto px-8 pb-20 space-y-10">
        {tools.map((section, si) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 + si * 0.1 }}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${categoryAccentMap[section.color]}`}
              >
                {section.icon}
                {section.category}
              </div>
              <span className="text-sm text-gray-400">
                {section.description}
              </span>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => {
                const a = accentMap[item.accent];
                return (
                  <button
                    key={item.route}
                    onClick={() => navigate(item.route)}
                    className={`group text-left bg-white rounded-2xl border-2 p-6 shadow-sm transition-all duration-200 cursor-pointer ${a.border} ${a.hover}`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${a.icon}`}
                      >
                        {section.icon}
                      </div>
                      <svg
                        className={`w-5 h-5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${a.arrow}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-500 leading-snug">
                      {item.sublabel}
                    </p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
