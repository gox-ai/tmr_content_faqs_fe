import React, { useState, useEffect } from "react";

export default function LoadingSpinner({
  text = "Loading...",
  fullScreen = true,
  size = "md",
  color = "#FF6700",
  showProgress = false,
}) {

  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 3 ? "" : prev + "."));
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const sizeMap = {
    sm: 24,
    md: 36,
    lg: 48,
    xl: 64,
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;

  const styles = `
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes subtlePulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  `;

  const loader = (
    <div
      style={{
        width: spinnerSize,
        height: spinnerSize,
        border: `3px solid ${color}40`,
        borderTopColor: color,
        borderRadius: "50%",
      }}
      className="animate-spin"
    />
  );

  if (!fullScreen) {
    return (
      <>
        <style>{styles}</style>
        <div className="flex items-center gap-3">
          {loader}
          <span className="text-gray-600 text-sm">
            {text}
            {dots}
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 animate-[subtlePulse_2.8s_ease-in-out_infinite]">
          {loader}
          <div className="text-center">
            <p className="text-white font-medium text-lg tracking-wide">
              {text}
              {dots}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
