import React from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

export const TopLoader: React.FC = () => {
    const { t } = useTranslation('home')
    return (
      <div className="relative h-7 flex flex-col justify-center items-center">
        <div className="relative w-16 h-2.5 mb-2">
          {/* Center dot (static) */}
          <div
            className="absolute top-0 left-1/2 w-2.5 h-2.5 rounded-full bg-primary"
            style={{ transform: 'translateX(-10%)' }}
          />
  
          {/* Left dot (no opacity change) */}
          <motion.div
            className="absolute top-0 left-1/2 w-2.5 h-2.5 rounded-full bg-primary"
            style={{ transform: 'translateX(-50%)' }}
            animate={{ x: [0, -29, 0] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
              times: [0, 0.5, 1],
            }}
          />
  
          {/* Right dot (no opacity change) */}
          <motion.div
            className="absolute top-0 left-1/2 w-2.5 h-2.5 rounded-full bg-primary"
            style={{ transform: 'translateX(-50%)' }}
            animate={{ x: [0, 25, 0] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
              times: [0, 0.5, 1],
            }}
          />
        </div>
        <div className="text-[10px] text-black text-center w-full ml-2">{t('loading')}</div>
      </div>
    )
  }

