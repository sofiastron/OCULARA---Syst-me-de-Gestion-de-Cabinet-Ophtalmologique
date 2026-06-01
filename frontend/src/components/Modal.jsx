import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    // Backdrop : Effet flou sur le fond au lieu d'un simple noir opaque
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/20 backdrop-blur-md transition-opacity">
      
      {/* Conteneur de la Modale : Effet Glassmorphism */}
      <div className="bg-[#fdfaf6]/95 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-md mx-4 overflow-hidden transform transition-all">
        
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#c1bdaf]/40">
          <h2 className="text-xl font-serif font-bold text-[#2d2925] tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#7a7771] hover:text-[#2d2925] transition-colors text-3xl leading-none font-light"
          >
            &times;
          </button>
        </div>
        
        {/* Contenu */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}