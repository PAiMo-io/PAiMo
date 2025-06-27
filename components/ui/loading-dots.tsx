import React from "react";

const LoadingDots = () => {
  return (
    <div className="flex space-x-2">
      <div className="dot w-2.5 h-2.5 bg-gray-300 rounded-full animate-dot1"></div>
      <div className="dot w-2.5 h-2.5 bg-gray-300 rounded-full animate-dot2"></div>
      <div className="dot w-2.5 h-2.5 bg-gray-300 rounded-full animate-dot3"></div>

      <style jsx global>{`
        @keyframes dot1 {
          0% {
            opacity: 0;
            transform: translateX(-10px) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(10px) scale(0.5);
          }
        }

        @keyframes dot2 {
          0% {
            opacity: 0;
            transform: translateX(-10px) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(10px) scale(0.5);
          }
        }

        @keyframes dot3 {
          0% {
            opacity: 0;
            transform: translateX(-10px) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(10px) scale(0.5);
          }
        }

        .dot {
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .animate-dot1 {
          animation: dot1 1s infinite;
        }

        .animate-dot2 {
          animation: dot2 1s infinite;
          animation-delay: 0.2s; 
        }

        .animate-dot3 {
          animation: dot3 1s infinite;
          animation-delay: 0.4s; 
        }
      `}</style>
    </div>
  );
};

export default LoadingDots;
