import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="grid grid-cols-3 gap-2">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-5 h-5 bg-brand-500 rounded-md animate-modern-fade" />
        ))}
      </div>

      <style jsx>{`
        @keyframes modern-fade {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        .animate-modern-fade {
          animation: modern-fade 1.2s infinite ease-in-out;
        }

        .animate-modern-fade:nth-child(1) { animation-delay: 0s; }
        .animate-modern-fade:nth-child(2) { animation-delay: 0.1s; }
        .animate-modern-fade:nth-child(3) { animation-delay: 0.2s; }
        .animate-modern-fade:nth-child(4) { animation-delay: 0.3s; }
        .animate-modern-fade:nth-child(5) { animation-delay: 0.4s; }
        .animate-modern-fade:nth-child(6) { animation-delay: 0.5s; }
        .animate-modern-fade:nth-child(7) { animation-delay: 0.6s; }
        .animate-modern-fade:nth-child(8) { animation-delay: 0.7s; }
        .animate-modern-fade:nth-child(9) { animation-delay: 0.8s; }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
