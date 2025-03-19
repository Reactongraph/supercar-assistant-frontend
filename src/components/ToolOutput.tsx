import React from "react";
import {
  ToolOutput as ToolOutputType,
  AppointmentSlots as AppointmentSlotsType,
  AppointmentConfirmation as AppointmentConfirmationType,
  DealershipAddressInfo,
  RawToolOutput,
  WeatherData,
  DealershipInfo,
} from "../types/chat";
import { DealershipInfo as DealershipInfoComponent } from "./DealershipInfo";
import { AppointmentSlots as AppointmentSlotsComponent } from "./AppointmentSlots";
import { AppointmentConfirmation as AppointmentConfirmationComponent } from "./AppointmentConfirmation";
import { DealershipAddress } from "./DealershipAddress";

interface ToolOutputProps {
  data: ToolOutputType;
}

const WeatherComponent: React.FC<{ data: WeatherData }> = ({ data }) => {
  const getWeatherEmoji = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return "☀️";
      case "clear":
        return "🌤️";
      case "cloudy":
        return "☁️";
      case "rainy":
        return "🌧️";
      default:
        return "🌡️";
    }
  };

  const getBackgroundGradient = (temperature: number) => {
    if (temperature > 30) return "from-orange-100 to-red-100";
    if (temperature > 20) return "from-yellow-100 to-orange-100";
    if (temperature > 10) return "from-blue-100 to-green-100";
    return "from-blue-200 to-blue-100";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 my-4">
      <div
        className={`bg-gradient-to-r ${getBackgroundGradient(
          data.temperature
        )} p-6 rounded-xl`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-gray-800">
              {data.temperature}°C
            </div>
            <div className="text-xl text-gray-600 mt-2">{data.condition}</div>
          </div>
          <div className="text-6xl">{getWeatherEmoji(data.condition)}</div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="text-gray-600">
            <span className="block text-sm">Humidity</span>
            <span className="text-xl font-semibold">{data.humidity}%</span>
          </div>
          <div className="text-gray-600">
            <span className="block text-sm">Wind Speed</span>
            <span className="text-xl font-semibold">{data.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToolOutput: React.FC<ToolOutputProps> = ({ data }) => {
  const handleTimeSlotSelect = (time: string) => {
    console.log("Selected time slot:", time);
  };

  console.log("ToolOutput received data:", data);

  switch (data.type) {
    case "weather":
      return <WeatherComponent data={data.data as WeatherData} />;
    case "dealership":
      return <DealershipInfoComponent data={data.data as DealershipInfo} />;
    case "appointment_slots":
      const slotsData = data.data as AppointmentSlotsType;
      console.log("Rendering appointment slots:", slotsData);

      // Ensure timeSlots is an array
      const timeSlots = Array.isArray(slotsData.timeSlots)
        ? slotsData.timeSlots
        : [];

      return (
        <AppointmentSlotsComponent
          timeSlots={timeSlots}
          date={slotsData.date || new Date().toLocaleDateString()}
          dealership={slotsData.dealership || ""}
          vehicle={slotsData.vehicle}
          onSelect={handleTimeSlotSelect}
          onConfirm={handleTimeSlotSelect}
        />
      );
    case "appointment_confirmation":
      return (
        <AppointmentConfirmationComponent
          data={data.data as AppointmentConfirmationType}
        />
      );
    case "get_dealership_address":
      return <DealershipAddress data={data.data as DealershipAddressInfo} />;
    case "unknown":
      return (
        <div className="bg-white rounded-lg shadow-md p-6 my-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {(data.data as RawToolOutput).name}
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {(data.data as RawToolOutput).output}
              </p>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 my-4">
          <p className="text-yellow-800">
            Unsupported tool output type: {data.type}
          </p>
        </div>
      );
  }
};
