import { Message, ToolUse, ToolOutput } from "../types/chat";

export const generateSessionId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const createMessage = (
  role: Message["role"],
  content: string
): Message => ({
  role,
  content,
  timestamp: Date.now(),
});

export const fetchEventSource = async (
  sessionId: string,
  query: string,
  onChunk: (data: string) => void,
  onToolUse: (data: ToolUse) => void,
  onToolOutput: (data: ToolOutput) => void,
  onEnd: () => void,
  onError: (error: Error) => void
) => {
  try {
    const response = await fetch("http://localhost:8000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        query: query,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to connect to the server");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to read response");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let currentEventType = "";

    const processEvent = (eventType: string, data: string) => {
      console.log("eventType", eventType);
      console.log("data", data);
      if (!data.trim()) return;

      try {
        switch (eventType) {
          case "chunk":
            onChunk(data);
            break;
          case "tool_use":
            try {
              let toolUseData: ToolUse;

              if (typeof data === "string") {
                // Handle simple string tool names
                const toolName = String(data).trim();
                toolUseData = {
                  type: "tool_use",
                  data: {
                    name: toolName,
                    parameters: {},
                  },
                };
              } else {
                // Handle JSON format
                const parsedData = JSON.parse(data);
                toolUseData = {
                  type: "tool_use",
                  data: {
                    name:
                      parsedData.name || parsedData.tool || String(data).trim(),
                    parameters: parsedData.parameters || parsedData.args || {},
                  },
                };
              }

              onToolUse(toolUseData);
              // Add system message for appointment check
              if (toolUseData.data.name === "check_appointment_availability") {
                // onChunk("Checking available appointment slots...\n\n");
              }
            } catch (error) {
              console.error("Error processing tool use:", error);
              // If parsing fails, create a basic tool use object
              const basicToolUse: ToolUse = {
                type: "tool_use",
                data: { name: String(data).trim(), parameters: {} },
              };
              onToolUse(basicToolUse);
            }
            break;
          case "tool_output":
            console.log("tool_output", data);
            try {
              let toolOutputData: ToolOutput;
              let parsedData;

              if (typeof data === "string") {
                try {
                  parsedData = JSON.parse(data);
                } catch (parseError) {
                  console.error(
                    "Failed to parse tool output string:",
                    parseError
                  );
                  throw new Error("Invalid tool output format");
                }
              } else {
                parsedData = data;
              }

              // Ensure we have the expected structure
              if (!parsedData || !parsedData.name || !parsedData.output) {
                console.error("Invalid tool output structure:", parsedData);
                throw new Error("Invalid tool output structure");
              }

              // Process based on tool type
              switch (parsedData.name) {
                case "get_dealership_address":
                  toolOutputData = {
                    type: "get_dealership_address",
                    data: {
                      name: "Dealership Location",
                      address: parsedData.output,
                      phone: "",
                      hours: "",
                    },
                  };
                  break;

                case "check_appointment_availability":
                  const outputStr = parsedData.output
                    .replace(/^"/, "")
                    .replace(/"$/, "")
                    .replace(/```/g, "")
                    .replace(/'/g, '"');

                  console.log("Parsing appointment slots:", outputStr);

                  let timeSlots;
                  try {
                    timeSlots = JSON.parse(outputStr);
                  } catch (parseError) {
                    console.error("Failed to parse time slots:", parseError);
                    const matches = outputStr.match(/\[(.*?)\]/);
                    timeSlots =
                      matches && matches[1]
                        ? matches[1]
                            .split(",")
                            .map((slot: string) =>
                              slot.trim().replace(/['"]/g, "")
                            )
                        : [];
                  }

                  toolOutputData = {
                    type: "appointment_slots",
                    data: {
                      timeSlots: timeSlots.map((time: string) => ({
                        time: time.trim().replace(/['"]/g, ""),
                        available: true,
                      })),
                      date: new Date().toLocaleDateString(),
                      dealership: "5th Avenue, New York",
                      vehicle: "Super Car 123",
                    },
                  };
                  break;

                case "schedule_appointment":
                  try {
                    // First, parse the outer JSON structure
                    let outputData = parsedData.output;

                    // Remove any wrapping quotes from the output string
                    if (
                      outputData.startsWith('"') &&
                      outputData.endsWith('"')
                    ) {
                      outputData = outputData.slice(1, -1);
                    }

                    // Remove backticks and any markdown code block indicators
                    outputData = outputData.replace(/```/g, "").trim();

                    // Convert Python-style dict to valid JSON
                    const jsonStr = outputData
                      .replace(/'/g, '"') // Replace single quotes with double quotes
                      .replace(/None/g, "null") // Replace Python None with JSON null
                      .replace(/True/g, "true") // Replace Python True with JSON true
                      .replace(/False/g, "false"); // Replace Python False with JSON false

                    const appointmentData = JSON.parse(jsonStr);

                    toolOutputData = {
                      type: "appointment_confirmation",
                      data: {
                        confirmationId:
                          appointmentData.confirmacion_id ||
                          appointmentData.confirmation_id ||
                          "SuperCar-123",
                        date:
                          appointmentData.fecha ||
                          appointmentData.date ||
                          "19/03/2025",
                        time:
                          appointmentData.hora ||
                          appointmentData.time ||
                          "10:00",
                        dealership: "5th Avenue, New York",
                        serviceType: "Test Drive",
                        vehicle:
                          appointmentData.modelo ||
                          appointmentData.vehicle ||
                          "Super Car 123",
                        notes:
                          appointmentData.mensaje ||
                          appointmentData.message ||
                          "Appointment scheduled successfully",
                      },
                    };
                  } catch (parseError) {
                    console.error(
                      "Error parsing appointment data:",
                      parseError,
                      "Raw output:",
                      parsedData.output
                    );
                    // Provide a fallback with the data we know
                    toolOutputData = {
                      type: "appointment_confirmation",
                      data: {
                        confirmationId: "SuperCar-123",
                        date: "19/03/2025",
                        time: "10:00",
                        dealership: "5th Avenue, New York",
                        serviceType: "Test Drive",
                        vehicle: "Super Car 123",
                        notes: "Appointment scheduled successfully",
                      },
                    };
                  }
                  break;

                default:
                  console.warn("Unknown tool type:", parsedData.name);
                  toolOutputData = {
                    type: "unknown",
                    data: parsedData,
                  };
              }

              if (toolOutputData.type && toolOutputData.data) {
                onToolOutput(toolOutputData);
              } else {
                console.error(
                  "Invalid tool_output data structure:",
                  toolOutputData
                );
                throw new Error("Invalid tool output data structure");
              }
            } catch (error) {
              console.error("Failed to process tool_output data:", error);
              console.error("Raw data was:", data);
              onToolOutput({
                type: "unknown",
                data: {
                  name: "error",
                  output: "Failed to process tool output",
                },
              });
            }
            break;
          case "end":
            onEnd();
            break;
        }
      } catch (error) {
        console.error(`Error processing ${eventType} event:`, error);
        console.error("Raw data was:", data);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process complete events from the buffer
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (!line.trim()) continue;

        if (line.startsWith("event: ")) {
          currentEventType = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          const data = line.slice(6);

          console.log("currentEventType", currentEventType);
          console.log("data", data);
          processEvent(currentEventType, data);
        }
      }
    }

    onEnd();
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Unknown error"));
  }
};
