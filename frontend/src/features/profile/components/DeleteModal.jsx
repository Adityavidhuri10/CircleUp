import React from "react";

const DeleteModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Account</h3>
            <p className="text-gray-600 text-sm mb-6">This action is permanent. All your data will be deleted.</p>
            <div className="flex space-x-3">
                <button onClick={onCancel} className="flex-1 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
                    Cancel
                </button>
                <button onClick={onConfirm} className="flex-1 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium">
                    Delete
                </button>
            </div>
        </div>
    </div>
);

export default DeleteModal;
