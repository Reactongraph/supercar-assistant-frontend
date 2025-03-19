import React from "react";
import { DealershipAddressInfo } from "../types/chat";
import { Button } from "./Button";

interface DealershipAddressProps {
  data: DealershipAddressInfo;
}

export const DealershipAddress: React.FC<DealershipAddressProps> = ({
  data,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 my-4">
      <div className="flex items-center gap-4 mb-6">
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">{data.name}</h3>
          <p className="text-gray-600">{data.address}</p>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="primary" fullWidth>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          Get Directions
        </Button>
      </div>
    </div>
  );
};
