import React from 'react';
import { SearchIcon, GlobeIcon, UserIcon, BugIcon } from 'lucide-react';
export function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between text-white">
      {/* Left Section: Logo & Search */}
      <div className="flex items-center gap-6 flex-1">
        {/* Using BugIcon as a stylized placeholder for the frog logo */}
        <div className="text-white hover:opacity-80 transition-opacity cursor-pointer">
          <BugIcon size={32} strokeWidth={1.5} />
        </div>

        <div className="relative hidden md:block w-64">
          <input
            type="text"
            placeholder=""
            className="w-full bg-white rounded-full py-2 pl-4 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          
          <SearchIcon
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18} />
          
        </div>
      </div>

      {/* Center Section: Nav Links */}
      <div className="hidden lg:flex items-center justify-center gap-10 flex-1">
        {['HOME', 'MARKET', 'NEWS', 'INSIGHT'].map((item) =>
        <a
          key={item}
          href={`#${item.toLowerCase()}`}
          className="text-sm font-bold tracking-widest hover:text-blue-400 transition-colors">
          
            {item}
          </a>
        )}
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center justify-end gap-6 flex-1">
        <div className="hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-sm font-semibold">EN</span>
          <GlobeIcon size={20} />
        </div>

        <button
          className="hover:opacity-80 transition-opacity"
          aria-label="User Profile">
          
          <UserIcon size={24} />
        </button>

        {/* Replicating the slanted button look from the screenshot while keeping it blue */}
        <button className="bg-[#0011aa] hover:bg-blue-700 text-white px-8 py-2.5 font-semibold transition-all hover:scale-105 clip-slant hidden sm:block">
          Get Started
        </button>
      </div>
    </nav>);

}