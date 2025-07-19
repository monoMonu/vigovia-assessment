import React from 'react';

const Header = () => {
   return (
      <header className="bg-white shadow-sm border-b border-gray-200">
         <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
               <div className="text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-vigovia-purple to-vigovia-blue bg-clip-text text-transparent">
                     vigovia
                  </h1>
                  <p className="text-sm text-gray-600 tracking-wider">PLAN.PACK.GO ✈️</p>
               </div>
            </div>
         </div>
      </header>
   );
};

export default Header;