import React, { useState, useEffect } from 'react';

// Animated Loading Spinner Component with Multiple Variants
export default function LoadingSpinner({
  text = 'Generating FAQs...',
  fullScreen = true,
  size = 'lg',
  variant = 'pulse', // 'pulse', 'orbit', 'dots', 'wave'
  color = '#FF6700',
  showProgress = true
}) {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    const progressInterval = setInterval(() => {
      setProgress(prev => prev >= 95 ? 95 : prev + Math.random() * 8);
    }, 800);

    return () => {
      clearInterval(dotInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const sizeMap = {
    sm: { spinner: 40, text: 'text-sm' },
    md: { spinner: 60, text: 'text-base' },
    lg: { spinner: 80, text: 'text-lg' },
    xl: { spinner: 100, text: 'text-xl' }
  };

  const currentSize = sizeMap[size] || sizeMap.lg;

  const styles = `
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.5; }
      100% { transform: scale(0.8); opacity: 1; }
    }
    @keyframes orbit {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes bounce-dot {
      0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
    @keyframes wave {
      0%, 100% { transform: scaleY(0.5); }
      50% { transform: scaleY(1.5); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(255, 103, 0, 0.4); }
      50% { box-shadow: 0 0 40px rgba(255, 103, 0, 0.8); }
    }
    .spinner-container {
      animation: float 3s ease-in-out infinite;
    }
    .pulse-ring {
      animation: pulse-ring 1.5s ease-in-out infinite;
    }
    .orbit-ring {
      animation: orbit 1.2s linear infinite;
    }
    .bounce-dot-1 { animation: bounce-dot 1.4s infinite ease-in-out; animation-delay: -0.32s; }
    .bounce-dot-2 { animation: bounce-dot 1.4s infinite ease-in-out; animation-delay: -0.16s; }
    .bounce-dot-3 { animation: bounce-dot 1.4s infinite ease-in-out; }
    .wave-bar { animation: wave 1.2s ease-in-out infinite; }
    .shimmer-text {
      background: linear-gradient(90deg, ${color} 25%, #fff 50%, ${color} 75%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 2s infinite;
    }
    .glow-border {
      animation: glow 2s ease-in-out infinite;
    }
    .progress-bar {
      transition: width 0.5s ease-out;
    }
  `;

  const renderSpinner = () => {
    switch (variant) {
      case 'orbit':
        return (
          <div className="relative" style={{ width: currentSize.spinner, height: currentSize.spinner }}>
            {/* Outer rotating ring */}
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent orbit-ring"
              style={{
                borderTopColor: color,
                borderRightColor: `${color}60`
              }}
            />
            {/* Inner pulsing circle */}
            <div
              className="absolute rounded-full pulse-ring"
              style={{
                width: currentSize.spinner * 0.5,
                height: currentSize.spinner * 0.5,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: `${color}30`,
                border: `2px solid ${color}`
              }}
            />
            {/* Center dot */}
            <div
              className="absolute rounded-full"
              style={{
                width: 12,
                height: 12,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: color
              }}
            />
          </div>
        );

      case 'dots':
        return (
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`rounded-full bounce-dot-${i}`}
                style={{
                  width: currentSize.spinner * 0.25,
                  height: currentSize.spinner * 0.25,
                  backgroundColor: color
                }}
              />
            ))}
          </div>
        );

      case 'wave':
        return (
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="wave-bar rounded-full"
                style={{
                  width: currentSize.spinner * 0.1,
                  height: currentSize.spinner * 0.6,
                  backgroundColor: color,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
      default:
        return (
          <div className="relative" style={{ width: currentSize.spinner, height: currentSize.spinner }}>
            {/* Multiple pulsing rings */}
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full pulse-ring"
                style={{
                  border: `3px solid ${color}`,
                  opacity: 0.6 - (i * 0.2),
                  animationDelay: `${i * 0.3}s`
                }}
              />
            ))}
            {/* Center icon */}
            <div
              className="absolute rounded-full flex items-center justify-center glow-border"
              style={{
                width: currentSize.spinner * 0.5,
                height: currentSize.spinner * 0.5,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: color
              }}
            >
              <svg
                className="text-white"
                style={{ width: currentSize.spinner * 0.25, height: currentSize.spinner * 0.25 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        );
    }
  };

  if (fullScreen) {
    return (
      <>
        <style>{styles}</style>
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-sm">
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-20"
                style={{
                  width: Math.random() * 10 + 5,
                  height: Math.random() * 10 + 5,
                  backgroundColor: color,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <div className="spinner-container flex flex-col items-center">
            {/* Main Spinner */}
            <div className="mb-8">
              {renderSpinner()}
            </div>

            {/* Animated Text */}
            <div className="text-center">
              <h2 className={`shimmer-text ${currentSize.text} font-bold mb-2`}>
                {text}{dots}
              </h2>
              <p className="text-slate-400 text-sm">
                Please wait while we process your request
              </p>
            </div>

            {/* Progress Bar */}
            {showProgress && (
              <div className="mt-6 w-64">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full progress-bar"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}cc)`
                    }}
                  />
                </div>
                <p className="text-slate-500 text-xs mt-2 text-center">
                  {Math.round(progress)}% complete
                </p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Inline spinner (non-fullscreen)
  return (
    <>
      <style>{styles}</style>
      <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-xl">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`rounded-full bounce-dot-${i}`}
              style={{
                width: 10,
                height: 10,
                backgroundColor: color
              }}
            />
          ))}
        </div>
        <span className="text-slate-600 text-sm font-medium">{text}</span>
      </div>
    </>
  );
}

// Enhanced Inline Spinner with step indicators
export function InlineSpinner({
  label = 'Loading...',
  steps = [],
  currentStep = 0,
  color = '#FF6700'
}) {
  const styles = `
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spin-slow {
      animation: spin-slow 2s linear infinite;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-sm">
        {/* Spinner Icon */}
        <div className="relative mb-4">
          <div
            className="w-12 h-12 rounded-full spin-slow"
            style={{
              border: `3px solid ${color}20`,
              borderTopColor: color
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>

        {/* Label */}
        <p
          className="text-base font-semibold mb-3"
          style={{ color }}
        >
          {label}
        </p>

        {/* Step Indicators */}
        {steps.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i < currentStep
                      ? 'bg-green-500 text-white'
                      : i === currentStep
                        ? 'text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  style={i === currentStep ? { backgroundColor: color } : {}}
                >
                  {i < currentStep ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 transition-all duration-300 ${i < currentStep ? 'bg-green-500' : 'bg-slate-200'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Current Step Label */}
        {steps.length > 0 && steps[currentStep] && (
          <p className="text-slate-500 text-sm mt-3 text-center">
            {steps[currentStep]}
          </p>
        )}
      </div>
    </>
  );
}

// Button Spinner - Compact spinner for buttons
export function ButtonSpinner({
  label = 'Processing...',
  size = 'sm',
  color = '#ffffff'
}) {
  const sizeMap = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24
  };

  const spinnerSize = sizeMap[size] || sizeMap.sm;

  const styles = `
    @keyframes button-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .button-spinner {
      animation: button-spin 0.8s linear infinite;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="flex items-center gap-2">
        <svg
          className="button-spinner"
          style={{ width: spinnerSize, height: spinnerSize }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke={`${color}40`}
            strokeWidth="3"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        {label && <span>{label}</span>}
      </div>
    </>
  );
}

// Status Spinner - Shows loading with status message
export function StatusSpinner({
  status = 'Loading...',
  type = 'info', // 'info', 'success', 'warning', 'error'
  isLoading = true
}) {
  const typeStyles = {
    info: { color: '#3B82F6', bg: 'bg-blue-50', border: 'border-blue-200' },
    success: { color: '#10B981', bg: 'bg-green-50', border: 'border-green-200' },
    warning: { color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200' },
    error: { color: '#EF4444', bg: 'bg-red-50', border: 'border-red-200' }
  };

  const currentStyle = typeStyles[type] || typeStyles.info;

  const styles = `
    @keyframes status-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .status-pulse {
      animation: status-pulse 1.5s ease-in-out infinite;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${currentStyle.bg} ${currentStyle.border}`}
      >
        {isLoading ? (
          <div
            className="w-5 h-5 rounded-full border-2 border-t-transparent status-pulse"
            style={{
              borderColor: `${currentStyle.color}40`,
              borderTopColor: currentStyle.color,
              animation: 'button-spin 1s linear infinite, status-pulse 1.5s ease-in-out infinite'
            }}
          />
        ) : (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: currentStyle.color }}
          >
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <span
          className="text-sm font-medium"
          style={{ color: currentStyle.color }}
        >
          {status}
        </span>
      </div>
    </>
  );
}