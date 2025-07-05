// frontend/src/components/common/LoadingSpinner.jsx
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-10 h-10">
        {/* Neon Ring Spin */}
        <div className="absolute w-full h-full border-4 border-t-transparent border-primary rounded-full animate-spin shadow-[0_0_10px_rgba(0,255,255,0.7)]" />

        {/* Center Pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="block w-3 h-3 bg-primary rounded-full animate-ping shadow-[0_0_5px_rgba(0,255,255,0.7)]" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
