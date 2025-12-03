import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function LayoutAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
 <div className="min-h-screen relative bg-gradient-to-br from-black via-[#1d1a1a] to-red-900 overflow-hidden">
      {/* Optional soft red glow overlay */}
     <div className="absolute inset-0 bg-red-900/10 blur-3xl z-0"></div>
        <div className="absolute inset-0 bg-black/60 z-0"></div>
        
        {/* Optional: Add some cinematic elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 right-32 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <Sidebar onToggle={setIsSidebarOpen} />
        <main className={`transition-all duration-300 ${isSidebarOpen ? 'ml-0 lg:ml-[280px]' : 'ml-0 lg:ml-20'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}