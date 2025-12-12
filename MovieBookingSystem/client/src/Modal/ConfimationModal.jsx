import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Are you sure?", 
  message = "You have unsaved changes. Are you sure you want to leave?",
  confirmText = "Leave",
  cancelText = "Stay" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 max-w-md w-full mx-4 animate-slide-up">
        <div className="flex items-center flex-col gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600/20 to-orange-600/20 flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-gray-300 mt-1">{message}</p>
          </div>
        </div>
        
        <div className="flex flex-row gap-3 mt-6">
          <button
            onClick={onCancel}
            className="cursor-pointer flex-1 px-6 py-3 border-2 border-gray-700 rounded-lg hover:border-red-500 text-sm hover:bg-red-900/10 text-white transition-all duration-300 font-semibold"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer flex-1 px-6 py-3 rounded-lg font-semibold transition-all text-sm duration-300  bg-gradient-to-r from-red-700 to-orange-600/20 text-white hover:from-red-500 hover:to-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;