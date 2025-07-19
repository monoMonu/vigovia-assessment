import React from 'react';
import { Toaster } from 'react-hot-toast';
import ItineraryGenerator from './components/ItineraryGenerator';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <ItineraryGenerator />
    </div>
  );
}

export default App;