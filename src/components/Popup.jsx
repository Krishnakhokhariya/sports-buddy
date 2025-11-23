import React from 'react'

export default function Popup({ message, type = "alert", onClose, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-xl shadow-md w-80 text-center">
        <p className="text-gray-800">{message}</p>

        <div className="flex justify-center gap-4 mt-4">
          {type === "confirm" && (
            <button
              onClick={onCancel}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}

          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}


