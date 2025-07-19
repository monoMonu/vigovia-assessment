import React from 'react';

const Footer = () => {
   return (
      <footer className="bg-gray-900 text-white mt-16">
         <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                     vigovia
                  </h3>
                  <p className="text-sm text-gray-400 tracking-wider">PLAN.PACK.GO ✈️</p>
               </div>

               <div className="text-center md:text-left">
                  <h4 className="text-lg font-semibold mb-3">Vigovia Tech Pvt. Ltd</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                     Registered Office: Hd-109 Cinnabar Hills,<br />
                     Links Business Park, Karnataka, India.
                  </p>
               </div>

               <div className="text-center md:text-left">
                  <h4 className="text-lg font-semibold mb-3">Contact</h4>
                  <p className="text-gray-400 text-sm">
                     <span className="block">Phone: +91-99X9999999</span>
                     <span className="block">Email: Contact@Vigovia.Com</span>
                  </p>
               </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
               <p className="text-gray-400 text-sm">
                  © 2025 Vigovia Tech Pvt. Ltd. All rights reserved.
               </p>
            </div>
         </div>
      </footer>
   )
}


export default Footer;