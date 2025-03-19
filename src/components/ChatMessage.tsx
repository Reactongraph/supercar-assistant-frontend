import { Message } from "../types/chat";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const getMessageStyle = () => {
    switch (message.role) {
      case "user":
        return "bg-blue-600 text-white ml-auto";
      case "assistant":
        return "bg-white border border-gray-200 text-gray-900 mr-auto";
      case "system":
        return "bg-yellow-50 border border-yellow-100 text-gray-800 mx-auto";
      default:
        return "bg-gray-100 text-gray-900 mx-auto";
    }
  };

  return (
    <div className="w-full flex flex-col mb-4">
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${getMessageStyle()}`}
      >
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
};
