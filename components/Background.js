import React from 'react';
import { motion } from 'framer-motion';

const Background = () => {
  // 生成随机颜色
  const getRandomColor = (opacity = 1) => {
    const colors = [
      `rgba(99, 102, 241, ${opacity})`,   // primary
      `rgba(236, 72, 153, ${opacity})`,   // secondary
      `rgba(16, 185, 129, ${opacity})`,   // success
      `rgba(245, 158, 11, ${opacity})`,   // warning
      `rgba(59, 130, 246, ${opacity})`    // info
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // 主要形状数量
  const shapes = 6;
  
  return (
    <div className="background-container">
      {/* 主要形状 */}
      {[...Array(shapes)].map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          className={`shape shape-${i + 1}`}
          animate={{
            x: [0, Math.sin(i * 60) * 100, Math.cos(i * 30) * -80, 0],
            y: [0, Math.cos(i * 45) * -100, Math.sin(i * 45) * 80, 0],
            scale: [1, 1 + Math.sin(i) * 0.2, 1 - Math.sin(i) * 0.1, 1],
            rotate: [0, i % 2 ? 180 : -180, i % 2 ? 360 : -360]
          }}
          transition={{
            duration: 20 + i * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: `linear-gradient(135deg, ${getRandomColor(0.4)}, ${getRandomColor(0.2)})`,
            filter: `blur(${Math.random() * 2 + 1}px)`,
            opacity: 0.6 - i * 0.05
          }}
        />
      ))}
    </div>
  );
};

export default Background; 