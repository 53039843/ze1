import React from 'react';
import { Typography, Space, Button, Tooltip, Image } from 'antd';
import { GithubOutlined, HeartOutlined, WechatOutlined, HomeOutlined } from '@ant-design/icons';
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
          <Space className="footer-links">
            <Button
              type="default"
              className="glass-button premium-button"
              onClick={() => window.open('https://ol.xhy6.com/', '_blank')}
            >
              全自动会员版
            </Button>
            <Button
              type="primary"
              className="glass-button"
              onClick={() => window.open('https://qm.qq.com/q/pnDAFtRpo4', '_blank')}
            >
              进群获取教程
            </Button>
            <Button
              type="default"
              className="glass-button"
              icon={<HomeOutlined />}
              onClick={() => window.open('https://www.shuabu.mobi', '_blank')}
            >
              回到首页
            </Button>
          </Space>
        </div>
        
        <div className="footer-right">
          <Tooltip title="这里没有东西">
            <Button 
              type="text" 
              icon={<GithubOutlined />} 
              className="footer-button"
              href="./"
              target="_blank"
            />
          </Tooltip>
          <Tooltip title="支持我们">
            <Button 
              type="text" 
              icon={<HeartOutlined />} 
              className="footer-button sponsor-button"
              href="https://qm.qq.com/q/pnDAFtRpo4"
              target="_blank"
            />
          </Tooltip>
        </div>
      </div>
      
      <div className="footer-disclaimer">
        <Text type="secondary" className="disclaimer-text">
          免责声明：本工具仅供学习研究
        </Text>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-copyright">
          <Text className="copyright">
            © {currentYear} 版权所有
          </Text>
          <Text className="icp-info">
            京IPC备7000002-6号
          </Text>
        </div>
      </div>
    </motion.div>
  );
};

export default Footer;
