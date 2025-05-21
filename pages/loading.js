import React from 'react';
import styles from '../styles/Loading.module.css';
import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.backgroundShapes}>
        <motion.div 
          className={`${styles.shape} ${styles.shape1}`}
          animate={{ 
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className={`${styles.shape} ${styles.shape2}`}
          animate={{ 
            x: [0, -40, 40, 0],
            y: [0, 40, -40, 0],
            scale: [1, 0.8, 1.1, 1]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className={`${styles.shape} ${styles.shape3}`}
          animate={{ 
            x: [0, 60, -30, 0],
            y: [0, 30, 60, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <motion.div 
        className={styles.loadingSpinner}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.p 
          className={styles.loadingText}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          刷步程序正在加载...
        </motion.p>
        <motion.div 
          className={styles.loadingProgress}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.5 }}
        />
      </motion.div>
    </div>
  );
};

export default Loading; 
