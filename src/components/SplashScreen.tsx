import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Fallback if video doesn't load or end event doesn't fire
      setVideoEnded(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (videoEnded) {
      const exitTimer = setTimeout(() => {
        onComplete();
      }, 500);
      
      return () => clearTimeout(exitTimer);
    }
  }, [videoEnded, onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-slate-900 z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: videoEnded ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl w-full mx-auto relative">
        <video 
          src="/assets/logo.mp4" 
          autoPlay 
          muted 
          playsInline
          className="w-full"
          onEnded={() => setVideoEnded(true)}
        />
        
        {/* Fallback if video doesn't load */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ display: 'none' }}  // This is a fallback that's hidden by default
        >
          <div className="text-6xl font-bold text-white mb-4">Swarup Workspace</div>
          <div className="text-xl text-white opacity-80">Empowering your productivity</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;