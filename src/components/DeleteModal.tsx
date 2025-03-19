import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onDelete,
}) => {
  const actions = (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="bg-red-500 hover:bg-red-600"
      >
        Delete
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Chat Session"
      actions={actions}
    >
      <p className="text-gray-600">
        Are you sure you want to delete this chat session? This action cannot be
        undone.
      </p>
    </Modal>
  );
};
