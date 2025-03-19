import React, { useState, useEffect } from "react";
import { Button } from "./Button";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  initialName: string;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  onRename,
  initialName,
}) => {
  const [newName, setNewName] = useState(initialName);

  // Reset newName when initialName changes
  useEffect(() => {
    setNewName(initialName);
  }, [initialName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onRename(newName.trim());
      setNewName("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
      <div className="flex min-h-full items-center justify-center p-4 relative">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 shadow-xl transition-all sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <Button variant="icon" onClick={onClose} aria-label="Close">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full sm:mt-0">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                Rename &ldquo;{initialName}&rdquo;
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new name"
                    autoFocus
                  />
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="sm:w-auto"
                    fullWidth
                  >
                    Rename
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="mt-3 sm:mt-0 sm:w-auto"
                    fullWidth
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
