'use client';

import React from 'react';

export default function LoadingSpinner({ size = 40, message }: { size?: number; message?: string }) {
  return (
    <div className="loading-spinner-container">
      <svg
        className="loading-spinner"
        width={size}
        height={size}
        viewBox="0 0 50 50"
      >
        <circle
          className="loading-spinner-track"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
        <circle
          className="loading-spinner-fill"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
          strokeDasharray="80, 200"
          strokeLinecap="round"
        />
      </svg>
      {message && <p className="loading-spinner-text">{message}</p>}
    </div>
  );
}
