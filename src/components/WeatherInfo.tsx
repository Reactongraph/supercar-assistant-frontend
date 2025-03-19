import React from "react";
import { WeatherInfo as WeatherInfoType } from "../types/chat";

interface WeatherInfoProps {
  data: WeatherInfoType;
}

export const WeatherInfo: React.FC<WeatherInfoProps> = ({ data }) => {
  const getWeatherIcon = () => {
    const condition = data.condition.toLowerCase();
    if (condition.includes("sun") || condition.includes("clear")) {
      return (
        <svg
          className="w-12 h-12 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    } else if (condition.includes("cloud")) {
      return (
        <svg
          className="w-12 h-12 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      );
    } else if (condition.includes("rain")) {
      return (
        <svg
          className="w-12 h-12 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 16l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 my-4">
      <div className="flex items-center gap-6">
        <div className="p-3 bg-blue-50 rounded-xl">{getWeatherIcon()}</div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            {data.temperature}°C
          </h3>
          <p className="text-lg text-gray-600 capitalize">{data.condition}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Humidity</p>
              <p className="text-lg font-semibold text-gray-800">
                {data.humidity}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Wind Speed</p>
              <p className="text-lg font-semibold text-gray-800">
                {data.windSpeed} km/h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
