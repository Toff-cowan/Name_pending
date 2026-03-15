import { MessageCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
export function ChatBubble() {
  return (
    <motion.button
      initial={{
        scale: 0,
        opacity: 0
      }}
      animate={{
        scale: 1,
        opacity: 1
      }}
      transition={{
        delay: 1,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      whileHover={{
        scale: 1.1
      }}
      whileTap={{
        scale: 0.9
      }}
      className="fixed bottom-8 right-8 z-50 bg-white text-gray-800 p-4 rounded-full shadow-2xl hover:shadow-blue-500/20 transition-shadow"
      aria-label="Open chat">
      
      <MessageCircleIcon size={28} strokeWidth={1.5} />

      {/* Optional: Add a subtle notification dot */}
      <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
    </motion.button>);

}