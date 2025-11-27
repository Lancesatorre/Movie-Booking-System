import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-black via-[#1a0000] to-red-900 overflow-hidden">
      {/* Optional soft red glow overlay */}
     <div className="absolute inset-0 bg-red-900/10 blur-3xl z-0"></div>
        <div className="absolute inset-0 bg-black/60 z-0"></div>
        
        {/* Optional: Add some cinematic elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 right-32 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl"></div>
      <div className="relative z-10">
        <Navbar />
        <main className='pt-17'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
