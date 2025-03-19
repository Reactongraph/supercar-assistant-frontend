"use client";

import React, { useState, useEffect, useRef } from "react";
import { RenameModal } from "./RenameModal";
import { DeleteModal } from "./DeleteModal";
import {
  Message,
  ToolOutput as ToolOutputType,
  RawToolOutput,
} from "../types/chat";
import {
  createMessage,
  generateSessionId,
  fetchEventSource,
} from "../utils/chat";
import { ToolOutput } from "./ToolOutput";
import { AppointmentSlots } from "./AppointmentSlots";
import { Button } from "./Button";
import { LoadingDots } from "./LoadingDots";
import { TypingIndicator } from "./TypingIndicator";

interface CurrentMessage {
  content: string;
  created: boolean;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  timestamp: number;
}

export const Chat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState<Set<string>>(
    new Set()
  );
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [sessionToRename, setSessionToRename] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentMessageRef = useRef<CurrentMessage>({
    content: "",
    created: false,
  });

  // Initialize first session or load existing sessions
  useEffect(() => {
    const savedSessions = localStorage.getItem("chatSessions");
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      // Set current session to the most recent one
      if (parsedSessions.length > 0) {
        const mostRecentSession = parsedSessions.reduce(
          (prev: ChatSession, current: ChatSession) =>
            prev.timestamp > current.timestamp ? prev : current
        );
        setCurrentSessionId(mostRecentSession.id);
        setMessages(mostRecentSession.messages);
      } else {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("chatSessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Update messages in the current session whenever messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === currentSessionId
            ? { ...session, messages, timestamp: Date.now() }
            : session
        )
      );
    }
  }, [messages, currentSessionId]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: generateSessionId(),
      name: `Chat ${sessions.length + 1}`,
      messages: [],
      timestamp: Date.now(),
    };
    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    currentMessageRef.current = { content: "", created: false };
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      currentMessageRef.current = { content: "", created: false };
    }
  };

  const renameSession = (sessionId: string, newName: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, name: newName } : session
      )
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== sessionId)
    );
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(
        (session) => session.id !== sessionId
      );
      if (remainingSessions.length > 0) {
        switchSession(remainingSessions[remainingSessions.length - 1].id);
      } else {
        createNewSession();
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isSessionLoading = (sessionId: string) =>
    loadingSessions.has(sessionId);

  const setSessionLoading = (sessionId: string, loading: boolean) => {
    setLoadingSessions((prev) => {
      const newSet = new Set(prev);
      if (loading) {
        newSet.add(sessionId);
      } else {
        newSet.delete(sessionId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault();
    const messageText = overrideInput || input;
    if (
      (!messageText.trim() && !overrideInput) ||
      isSessionLoading(currentSessionId)
    )
      return;

    const userMessage = createMessage("user", messageText);
    setMessages((prev) => [...prev, userMessage]);
    if (!overrideInput) {
      setInput("");
    }
    setSessionLoading(currentSessionId, true);

    currentMessageRef.current = { content: "", created: false };

    try {
      await fetchEventSource(
        currentSessionId,
        messageText,
        (data: string) => {
          if (data.trim()) {
            setMessages((prev) => {
              // Find the last message
              const lastMessage = prev[prev.length - 1];

              // If there's no last message or the last message is not from assistant
              // or if it's a system/tool message, create a new message
              if (!lastMessage || lastMessage.role !== "assistant") {
                return [...prev, createMessage("assistant", data)];
              }

              // Otherwise, append to the last assistant message
              const updatedMessages = [...prev];
              updatedMessages[prev.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + data,
              };
              return updatedMessages;
            });
          }
        },
        (toolUseData: { data?: { name: string } }) => {
          // Handle tool use event
          if (toolUseData.data?.name === "check_appointment_availability") {
            const systemMessage = createMessage(
              "system",
              "Checking available appointment slots..."
            );
            setMessages((prev) => {
              // Only add system message if it doesn't exist
              const hasSystemMessage = prev.some(
                (msg) =>
                  msg.role === "system" &&
                  msg.content.includes("Checking available appointment slots")
              );
              return hasSystemMessage ? prev : [...prev, systemMessage];
            });
          }
        },
        (
          toolOutputData:
            | ToolOutputType
            | { data: RawToolOutput }
            | RawToolOutput
            | string
        ) => {
          // Handle tool output event
          if (!toolOutputData) return;

          try {
            let toolOutput: ToolOutputType | undefined;

            // Handle different types of tool output data
            if (typeof toolOutputData === "string") {
              try {
                const parsed = JSON.parse(toolOutputData);
                if (parsed.type && parsed.data) {
                  toolOutput = parsed as ToolOutputType;
                } else if (parsed.name) {
                  // Handle raw tool output
                  toolOutput = processRawToolOutput(parsed);
                }
              } catch (e) {
                console.error("Failed to parse tool output string:", e);
              }
            } else if ("type" in toolOutputData && "data" in toolOutputData) {
              toolOutput = toolOutputData as ToolOutputType;
            } else if ("data" in toolOutputData) {
              toolOutput = processRawToolOutput(toolOutputData.data);
            } else {
              toolOutput = processRawToolOutput(toolOutputData);
            }

            // Add tool output message if valid
            if (toolOutput) {
              setMessages((prev) => {
                // Check if this tool output already exists
                const hasToolOutput = prev.some(
                  (msg) =>
                    msg.role === "tool" &&
                    msg.content.includes(toolOutput?.type || "")
                );
                return hasToolOutput
                  ? prev
                  : [
                      ...prev,
                      createMessage("tool", JSON.stringify(toolOutput)),
                    ];
              });
            }
          } catch (error) {
            console.error("Error processing tool output:", error);
          }
        },
        () => {
          setSessionLoading(currentSessionId, false);
          scrollToBottom();
        },
        (error: Error) => {
          console.error("Error:", error);
          setMessages((prev) => [
            ...prev,
            createMessage(
              "system",
              "An error occurred while processing your request."
            ),
          ]);
          setSessionLoading(currentSessionId, false);
        }
      );
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        createMessage(
          "system",
          "An error occurred while processing your request."
        ),
      ]);
      setSessionLoading(currentSessionId, false);
    }
  };

  // Helper function to process raw tool output
  const processRawToolOutput = (
    data: RawToolOutput | { name: string; output: string }
  ): ToolOutputType | undefined => {
    if (!("name" in data) || !("output" in data)) return undefined;

    switch (data.name) {
      case "check_appointment_availability":
        const availabilityStr = data.output
          .replace(/^"/, "")
          .replace(/"$/, "")
          .replace(/```/g, "")
          .replace(/'/g, '"')
          .trim();

        let timeSlots: string[];
        try {
          timeSlots = JSON.parse(availabilityStr);
        } catch {
          const matches = availabilityStr.match(/\[(.*?)\]/);
          timeSlots =
            matches && matches[1]
              ? matches[1]
                  .split(",")
                  .map((slot: string) => slot.trim().replace(/['"]/g, ""))
              : [];
        }

        return {
          type: "appointment_slots",
          data: {
            timeSlots: timeSlots.map((time: string) => ({
              time: time.trim().replace(/['"]/g, ""),
              available: true,
            })),
            date: "19/03/2025",
            dealership: "5th Avenue, New York",
            vehicle: "Super Car 123",
          },
        };

      case "schedule_appointment":
        try {
          // First, parse the outer JSON structure
          let outputData = data.output;

          // Remove any wrapping quotes from the output string
          if (outputData.startsWith('"') && outputData.endsWith('"')) {
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

          return {
            type: "appointment_confirmation",
            data: {
              confirmationId:
                appointmentData.confirmacion_id ||
                appointmentData.confirmation_id ||
                "SuperCar-123",
              date:
                appointmentData.fecha || appointmentData.date || "19/03/2025",
              time: appointmentData.hora || appointmentData.time || "10:00",
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
        } catch (error) {
          console.error(
            "Error parsing appointment data:",
            error,
            "Raw output:",
            data.output
          );
          // Provide a fallback with the data we know
          return {
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

      case "get_dealership_address":
        return {
          type: "get_dealership_address",
          data: {
            name: "Dealership Location",
            address: data.output,
            phone: "(555) 123-4567",
            hours: "Mon-Sat: 9:00 AM - 6:00 PM",
          },
        };

      default:
        return {
          type: "unknown",
          data: data,
        };
    }
  };

  const filteredSessions = sessions.filter((session) =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openRenameModal = (sessionId: string) => {
    setSessionToRename(sessionId);
    setRenameModalOpen(true);
  };

  const openDeleteModal = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteModalOpen(true);
  };

  const handleDeleteSession = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete);
      setDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  };

  const Message: React.FC<{ message: Message }> = ({ message }) => {
    if (message.role === "tool") {
      try {
        const toolOutput = JSON.parse(message.content);
        if (toolOutput.type === "appointment_slots") {
          return (
            <div className="flex justify-start mb-4">
              <AppointmentSlots
                timeSlots={toolOutput.data.timeSlots}
                date={toolOutput.data.date}
                dealership={toolOutput.data.dealership}
                vehicle={toolOutput.data.vehicle}
                onSelect={(time) => {
                  console.log("Selected time:", time);
                }}
                onConfirm={(time) => {
                  // Find the current chat session
                  const currentSession = sessions.find(
                    (s) => s.id === currentSessionId
                  );
                  if (currentSession) {
                    const messageText = `I'd like to schedule my test drive for ${time}.`;
                    // Trigger the API call directly without adding a duplicate message
                    handleSubmit(
                      {
                        preventDefault: () => {},
                      } as React.FormEvent,
                      messageText
                    );
                  }
                }}
              />
            </div>
          );
        }
        return (
          <div className="flex justify-start mb-4">
            <ToolOutput data={toolOutput} />
          </div>
        );
      } catch (error) {
        console.error("Error parsing tool output:", error);
        return (
          <div className="flex justify-start mb-4">
            <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2 max-w-[70%]">
              Error displaying tool output
            </div>
          </div>
        );
      }
    }

    // Handle regular messages
    return (
      <div
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        } mb-4`}
      >
        <div
          className={`${
            message.role === "user"
              ? "bg-blue-500 text-white"
              : message.role === "system"
              ? "bg-yellow-100 text-gray-800"
              : "bg-gray-100 text-gray-800"
          } rounded-lg px-4 py-2 max-w-[70%] whitespace-pre-wrap`}
        >
          {message.content}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar toggle button */}
      <Button
        variant="icon"
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </Button>

      {/* Session sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative z-40 w-80 h-full border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 ease-in-out overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Chat Sessions
            </h2>
            <Button
              variant="primary"
              onClick={createNewSession}
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Chat
            </Button>
          </div>
          <div className="flex-none p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="space-y-1 p-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  session.id === currentSessionId
                    ? "bg-blue-50 border border-blue-100"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div
                    onClick={() => {
                      switchSession(session.id);
                      setIsSidebarOpen(false);
                    }}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {session.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.messages.length} messages
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameModal(session.id);
                      }}
                      className="hover:bg-blue-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Button>
                    <Button
                      variant="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(session.id);
                      }}
                      className="hover:bg-red-50 hover:text-red-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Chat header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                {sessions.find((s) => s.id === currentSessionId)?.name ||
                  "New Chat"}
              </h2>
              <p className="text-sm text-gray-500 hidden sm:block">
                {messages.length} messages
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="icon"
                onClick={() => {
                  const session = sessions.find(
                    (s) => s.id === currentSessionId
                  );
                  if (session) {
                    setSessionToRename(session.id);
                    setRenameModalOpen(true);
                  }
                }}
                className="hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {messages.map((message: Message, index: number) => (
              <Message key={index} message={message} />
            ))}
            {isSessionLoading(currentSessionId) && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim() || isSessionLoading(currentSessionId)) return;
              handleSubmit(e);
            }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!input.trim() || isSessionLoading(currentSessionId))
                        return;
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 text-sm"
                  style={{ minHeight: "36px", maxHeight: "120px" }}
                  disabled={isSessionLoading(currentSessionId)}
                />
              </div>
              <Button
                variant="primary"
                type="submit"
                disabled={isSessionLoading(currentSessionId)}
                className="h-[36px] px-3 whitespace-nowrap text-sm"
              >
                <span className="hidden sm:inline">Send</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Replace the old modals with new components */}
      <RenameModal
        isOpen={renameModalOpen}
        onClose={() => {
          setRenameModalOpen(false);
          setSessionToRename(null);
        }}
        onRename={(newName) => {
          if (sessionToRename) {
            renameSession(sessionToRename, newName);
            setRenameModalOpen(false);
            setSessionToRename(null);
          }
        }}
        initialName={
          sessionToRename
            ? sessions.find((s) => s.id === sessionToRename)?.name || ""
            : ""
        }
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSessionToDelete(null);
        }}
        onDelete={handleDeleteSession}
      />
    </div>
  );
};
