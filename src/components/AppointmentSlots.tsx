import React, { useState } from "react";

interface TimeSlot {
  time: string;
  available: boolean;
  selected?: boolean;
}

interface AppointmentSlotsProps {
  timeSlots: TimeSlot[];
  date: string;
  dealership: string;
  vehicle?: string;
  onSelect: (time: string) => void;
  onConfirm: (time: string) => void;
}

export const AppointmentSlots: React.FC<AppointmentSlotsProps> = ({
  timeSlots,
  date,
  dealership,
  vehicle,
  onSelect,
  onConfirm,
}) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onSelect(time);
  };

  const handleConfirm = () => {
    if (selectedTime) {
      onConfirm(selectedTime);
      setSelectedTime(null); // Reset selection after confirmation
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 my-4">
      <div className="flex items-center gap-3 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Available Test Drive Slots
          </h3>
          <p className="text-sm text-gray-600">
            {dealership} - {date}
          </p>
          {vehicle && (
            <p className="text-sm text-blue-600 mt-1">Vehicle: {vehicle}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Array.isArray(timeSlots) &&
          timeSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => handleTimeSelect(slot.time)}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-200 border 
                ${
                  selectedTime === slot.time
                    ? "bg-blue-500 text-white border-blue-600 shadow-md transform scale-[1.02]"
                    : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:border-blue-200"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${
                  selectedTime === slot.time ? "text-white" : "text-blue-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {slot.time}
              {selectedTime === slot.time && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
      </div>

      {selectedTime && (
        <div className="mt-6">
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Confirm {selectedTime} Appointment
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        {selectedTime
          ? "Click confirm to schedule your test drive"
          : "Click on an available time slot to schedule your test drive"}
      </p>
    </div>
  );
};
