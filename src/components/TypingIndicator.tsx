import React from "react";
import { LoadingDots } from "./LoadingDots";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="bg-gray-100 rounded-lg px-4 py-3 shadow-sm">
        <LoadingDots />
      </div>
    </div>
  );
};
