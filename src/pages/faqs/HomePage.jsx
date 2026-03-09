import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Link2, ArrowRight, MousePointer2 } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
            TMR Internal Tool
          </h1>
          <p className="text-slate-500 font-medium">
            Select a specialized tool to begin
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="group flex flex-col justify-between p-10 bg-slate-50 rounded-[32px] border border-transparent hover:border-blue-500/20 hover:bg-blue-50/30 transition-all duration-300"
          >
            <div>
              <div className="mb-8 w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                <FileText size={32} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                FAQ Generator
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                Instantly turn any text into a structured FAQ section to improve
                readability and SEO.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/content-faqs/existing")}
                className="py-3 px-4 bg-white text-slate-700 font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-slate-900 hover:text-white transition-all text-sm"
              >
                Existing Page
              </button>
              <button
                onClick={() => navigate("/content-faqs/new")}
                className="py-3 px-4 bg-white text-slate-700 font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-slate-900 hover:text-white transition-all text-sm"
              >
                New Content
              </button>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={() => navigate("/backlink-tracker")}
            className="group cursor-pointer flex flex-col justify-between p-10 bg-slate-50 rounded-[32px] border border-transparent hover:border-purple-500/20 hover:bg-purple-50/30 transition-all duration-300"
          >
            <div>
              <div className="mb-8 w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-purple-600">
                <Link2 size={32} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Backlink Tracker
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                Protect your SEO authority with automated link monitoring and
                immediate downtime notifications.
              </p>
            </div>
            <div className="flex items-center gap-2 text-purple-600 font-bold group-hover:gap-4 transition-all">
              <span>Launch Tracker</span>
              <ArrowRight size={20} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
