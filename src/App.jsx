import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NewPage from "./pages/Faqs/NewPage";
import ExistingPage from "./pages/Faqs/ExistingPage";
import BacklinkLayout from "./pages/Backlink/BacklinkLayout";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/faqs" element={<HomePage />} />
        <Route path="/faqs/new" element={<NewPage />} />
        <Route path="/faqs/existing" element={<ExistingPage />} />
        <Route path="/backlink-tracker" element={<BacklinkLayout />} />
      </Routes>
    </Router>
  );
}
