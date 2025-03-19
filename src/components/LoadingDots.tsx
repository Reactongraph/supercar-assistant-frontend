import React from "react";

export const LoadingDots: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce"></div>
    </div>
  );
};
