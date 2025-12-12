// components/LoadingState.jsx
import React from 'react';

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-b-4 border-transparent border-t-red-600 border-b-red-600 h-32 w-32 mx-auto"></div>
          <div className="relative animate-pulse">
            <div className="h-32 w-32 mx-auto bg-gradient-to-br from-red-600/20 to-red-600/5 rounded-full flex items-center justify-center">
              <div className="h-16 w-16 bg-gradient-to-br from-red-600/30 to-transparent rounded-full"></div>
            </div>
          </div>
          
          {/* Pulse effect */}
          <div className="absolute inset-0 mx-auto h-32 w-32">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-600/20"></div>
            <div 
              className="absolute inset-4 animate-ping rounded-full bg-red-600/10"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            {message}
          </h3>
          <p className="text-gray-400 text-sm animate-pulse">
            Please wait...
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center mt-6 space-x-2">
          <div 
            className="h-2 w-2 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: '0s' }}
          ></div>
          <div 
            className="h-2 w-2 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div 
            className="h-2 w-2 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;