import React from 'react';

const LoadingSpinner = ({ message = "Generating your itinerary..." }) => {
   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vigovia-purple"></div>
            <p className="text-gray-700 font-medium">{message}</p>
            <p className="text-sm text-gray-500">Please wait while we create your perfect itinerary</p>
         </div>
      </div>
   );
};

export default LoadingSpinner;