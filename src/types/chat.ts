export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: number;
}

export interface ToolUse {
  type: "tool_use";
  data: {
    name: string;
    parameters: Record<string, unknown>;
  };
}

export interface RawToolOutput {
  name: string;
  output: string;
}

export interface ToolOutput {
  type:
    | "weather"
    | "dealership"
    | "appointment_slots"
    | "appointment_confirmation"
    | "get_dealership_address"
    | "unknown";
  data:
    | WeatherInfo
    | DealershipInfo
    | AppointmentSlots
    | AppointmentConfirmation
    | DealershipAddressInfo
    | RawToolOutput;
}

export interface ChunkEvent {
  type: "chunk";
  data: string;
}

export type StreamEvent = ToolUse | ToolOutput | ChunkEvent;

export interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export interface DealershipInfo {
  name: string;
  address: string;
  phone: string;
  hours: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  selected?: boolean;
}

export interface AppointmentSlots {
  timeSlots: TimeSlot[];
  date: string;
  dealership: string;
  vehicle?: string;
}

export interface AppointmentConfirmation {
  date: string;
  time: string;
  dealership: string;
  serviceType: string;
  notes?: string;
  confirmationId?: string;
  vehicle?: string;
}

export interface DealershipAddressInfo {
  name: string;
  address: string;
  phone: string;
  hours: string;
}

export interface ToolData {
  toolType:
    | "weather"
    | "dealership"
    | "appointment_slots"
    | "appointment_confirmation"
    | "unknown";
  toolData:
    | WeatherInfo
    | DealershipInfo
    | AppointmentSlots
    | AppointmentConfirmation;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export type ToolOutputType =
  | {
      type: "appointment_slots";
      data: AppointmentSlots;
    }
  | {
      type: "get_dealership_address";
      data: DealershipAddressInfo;
    }
  | {
      type: "weather";
      data: WeatherData;
    }
  | {
      type: "appointment_confirmation";
      data: AppointmentConfirmation;
    }
  | {
      type: "unknown";
      data: RawToolOutput;
    };
