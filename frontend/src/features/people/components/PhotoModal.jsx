import React from "react";
import { FaTimes } from "react-icons/fa";

const PhotoModal = ({ photoUrl, onClose }) => (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="relative max-w-2xl w-full max-h-[90vh]">
            <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-gray-300">
                <FaTimes size={24} />
            </button>
            <img src={photoUrl} alt="Profile" className="w-full h-full max-h-[80vh] object-contain rounded-lg" />
            <div className="mt-2 text-center text-white">
                <button onClick={onClose} className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700">
                    Close
                </button>
            </div>
        </div>
    </div>
);

export default PhotoModal;
