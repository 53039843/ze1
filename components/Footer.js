import React from 'react';
import { Typography, Space, Button, Tooltip, Image } from 'antd';
import { GithubOutlined, HeartOutlined, WechatOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import NextLink from 'next/link';

const { Text, Link } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.div 
      className="footer-container glass-card-small"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="footer-content">
        <div className="footer-left">
          <Text className="copyright">
            © {currentYear} Zepp Life Steps 助手
          </Text>
          <Space className="footer-links">
            <Link href="https://github.com/miloce/Zepp-Life-Steps" target="_blank" className="footer-link">
              官方网站
            </Link>
            <Link href="https://github.com/miloce/Zepp-Life-Steps/issues" target="_blank" className="footer-link">
              问题反馈
            </Link>
          </Space>
        </div>
        
        <div className="footer-right">
          <Tooltip title="GitHub源码">
            <Button 
              type="text" 
              icon={<GithubOutlined />} 
              className="footer-button"
              href="https://github.com/miloce/Zepp-Life-Steps"
              target="_blank"
            />
          </Tooltip>
          <Tooltip title="支持我们">
            <Button 
              type="text" 
              icon={<HeartOutlined />} 
              className="footer-button sponsor-button"
              href="https://afdian.com/leaflet?slug=miloce"
              target="_blank"
            />
          </Tooltip>
        </div>
      </div>
      
      <div className="miniprogram-qrcode">
        <Tooltip title="扫码使用微信小程序版">
          <div className="qrcode-container glass-card-small">
            <Text className="qrcode-title">微信小程序版</Text>
            <Image 
              src="https://cdn.jsdelivr.net/gh/miloce/Zepp-Life-Steps/img/MiniProgramCode.png" 
              alt="微信小程序二维码" 
              className="qrcode-image"
              width={120}
              preview={false}
            />
            <Text className="qrcode-desc">扫码立即使用</Text>
          </div>
        </Tooltip>
      </div>
      
      <div className="footer-disclaimer">
        <Text type="secondary" className="disclaimer-text">
          免责声明：本工具仅供学习研究，使用本工具所产生的任何后果由使用者自行承担
        </Text>
      </div>
    </motion.div>
  );
};

export default Footer; 