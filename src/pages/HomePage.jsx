import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-extrabold text-gray-800 mb-12 drop-shadow-md"
      >
        FAQ Generator
      </motion.h1>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex gap-8"
      >
        {/* Existing Page */}
        <button
          onClick={() => navigate("/existing")}
          className="px-10 py-5 bg-white border border-green-500 text-green-600 font-semibold rounded-2xl shadow-lg hover:bg-green-600 hover:text-white transition-all duration-300"
        >
          Existing Page
        </button>

        {/* New Page */}
        <button
          onClick={() => navigate("/new")}
          className="px-10 py-5 bg-white border border-blue-500 text-blue-600 font-semibold rounded-2xl shadow-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
        >
          New Page
        </button>
      </motion.div>
    </div>
  );
}
