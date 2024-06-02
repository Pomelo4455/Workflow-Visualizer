import React, { useRef, useEffect } from "react";

const TaskModal = ({ selectedTask, setSelectedTask }) => {
  const modalRef = useRef();

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setSelectedTask(null);
    }
  };

  useEffect(() => {
    if (selectedTask) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedTask]);

  if (!selectedTask) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
      <div
        ref={modalRef}
        className="relative bg-white p-6 rounded-md shadow-lg"
      >
        <button
          className="absolute top-1 right-4 text-2xl text-gray-700 hover:text-gray-900 transition-colors duration-200"
          onClick={() => setSelectedTask(null)}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          {selectedTask.name}
        </h2>
        <div className="text-sm text-gray-700">
          <p className="mb-2">
            <span className="font-bold">Next Balance Connector:</span>{" "}
            {selectedTask.taskConfig.nextBalanceConnector}
          </p>
          <p className="mb-2">
            <span className="font-bold">Previous Balance Connector:</span>{" "}
            {selectedTask.taskConfig.previousBalanceConnector}
          </p>
          <p className="mb-2">
            <span className="font-bold">Tokens Source: </span>{" "}
            {selectedTask.tokensSource}
          </p>
          <p className="mb-2">
            <span className="font-bold">Recipient: </span>{" "}
            {selectedTask.taskConfig.recipient
              ? selectedTask.taskConfig.recipient
              : "No recipient"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
