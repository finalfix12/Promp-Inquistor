
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 text-center border-b border-green-700/50 shadow-[0_4px_14px_0_rgba(0,255,128,0.1)]">
      <h1 className="text-3xl md:text-4xl font-bold text-green-500 tracking-widest uppercase">
        Prompt Inquisitor
      </h1>
      <p className="text-sm text-green-600 mt-1">AI Prompt Injection Arsenal</p>
    </header>
  );
};

export default Header;
