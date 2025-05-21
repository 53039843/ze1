import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, message } from 'antd';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';

// 导入自定义组件
import Background from '../components/Background';
import Header from '../components/Header';
import StepForm from '../components/StepForm';
import StatsCard from '../components/StatsCard';
import HistoryDrawer from '../components/HistoryDrawer';
import SettingsModal from '../components/SettingsModal';
import HelpModal from '../components/HelpModal';
import Footer from '../components/Footer';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [form] = Form.useForm();
  const [randomRange, setRandomRange] = useState([10000, 50000]);
  const [useRandom, setUseRandom] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [autoUpdateInterval, setAutoUpdateInterval] = useState(24); // 小时
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [streak, setStreak] = useState(0);

  // 检查 localStorage 是否可用
  const isLocalStorageAvailable = () => {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };

  // 从 localStorage 加载历史记录和设置
  useEffect(() => {
    // 检查localStorage是否可用
    if (!isLocalStorageAvailable()) {
      console.error('localStorage不可用，数据将无法保存');
      if (notificationEnabled) {
        message.warning('浏览器存储不可用，您的历史记录和设置将无法保存。');
      }
      return;
    }

    try {
    const savedHistory = localStorage.getItem('stepsHistory');
    const savedAutoUpdate = localStorage.getItem('autoUpdate');
    const savedAutoUpdateInterval = localStorage.getItem('autoUpdateInterval');
    const savedNotificationEnabled = localStorage.getItem('notificationEnabled');
    const savedStreak = localStorage.getItem('streak');
      const savedRandomRange = localStorage.getItem('randomRange');
      const savedUseRandom = localStorage.getItem('useRandom');
    
    if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          setHistory(parsedHistory);
          setLastUpdate(parsedHistory[0]);
    }
    }
    
    if (savedAutoUpdate) {
      setAutoUpdate(savedAutoUpdate === 'true');
    }
    
    if (savedAutoUpdateInterval) {
      setAutoUpdateInterval(parseInt(savedAutoUpdateInterval));
    }
    
    if (savedNotificationEnabled) {
      setNotificationEnabled(savedNotificationEnabled === 'true');
    }
    
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
      }
      
      if (savedRandomRange) {
        try {
          const parsedRange = JSON.parse(savedRandomRange);
          if (Array.isArray(parsedRange) && parsedRange.length === 2) {
            setRandomRange(parsedRange);
          }
        } catch (e) {
          console.error('解析随机范围出错:', e);
        }
      }
      
      if (savedUseRandom) {
        setUseRandom(savedUseRandom === 'true');
      }
    } catch (error) {
      console.error('从本地存储加载数据时出错:', error);
    }
  }, []);

  // 保存设置到 localStorage
  useEffect(() => {
    // 检查localStorage是否可用
    if (!isLocalStorageAvailable()) {
      return;
    }

    try {
      if (history && Array.isArray(history)) {
    localStorage.setItem('stepsHistory', JSON.stringify(history));
      }
      localStorage.setItem('autoUpdate', String(autoUpdate));
      localStorage.setItem('autoUpdateInterval', String(autoUpdateInterval));
      localStorage.setItem('notificationEnabled', String(notificationEnabled));
      localStorage.setItem('randomRange', JSON.stringify(randomRange));
      localStorage.setItem('useRandom', String(useRandom));
    } catch (error) {
      console.error('保存数据到本地存储时出错:', error);
      if (notificationEnabled) {
        message.error('保存设置失败，部分功能可能无法正常工作');
      }
    }
  }, [history, autoUpdate, autoUpdateInterval, notificationEnabled, randomRange, useRandom]);

  // 生成随机步数
  const generateRandomSteps = () => {
    const min = randomRange[0];
    const max = randomRange[1];
    const randomSteps = Math.floor(Math.random() * (max - min + 1)) + min;
    form.setFieldsValue({ steps: randomSteps });
  };

  // 清除历史记录
  const clearHistory = () => {
    try {
    setHistory([]);
      setLastUpdate(null);
    localStorage.removeItem('stepsHistory');
      
      if (notificationEnabled) {
    message.success('历史记录已清除');
      }
    } catch (error) {
      console.error('清除历史记录时出错:', error);
      if (notificationEnabled) {
        message.error('清除历史记录失败，请重试');
      }
    }
  };

  // 从历史记录中恢复
  const restoreFromHistory = (item) => {
    form.setFieldsValue({
      account: item.account,
      steps: item.steps
    });
    setShowHistory(false);
  };

  // 添加历史记录并立即保存到localStorage
  const addToHistory = (newItem) => {
    if (!newItem) return;
    
    try {
      const updatedHistory = [newItem, ...history.slice(0, 9)]; // 保留最近的10条
      setHistory(updatedHistory);
      setLastUpdate(newItem);
      
      // 立即保存到localStorage，确保不会丢失
      if (isLocalStorageAvailable()) {
        localStorage.setItem('stepsHistory', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('添加历史记录时出错:', error);
      if (notificationEnabled) {
        message.error('保存历史记录失败');
      }
    }
  };

  // 自动更新步数
  useEffect(() => {
    let timer;
    
    if (autoUpdate && form.getFieldValue('account') && form.getFieldValue('password')) {
      const intervalMs = autoUpdateInterval * 60 * 60 * 1000;
      
      const updateSteps = async () => {
        const values = {
          account: form.getFieldValue('account'),
          password: form.getFieldValue('password'),
          steps: form.getFieldValue('steps') || Math.floor(Math.random() * (randomRange[1] - randomRange[0] + 1)) + randomRange[0]
        };
        
        try {
          setUpdateStatus('loading');
          const response = await axios.post('/api/update-steps', values);
          
          if (response.data.success) {
            if (notificationEnabled) {
              message.success('自动更新步数成功！');
            }
            
            // 添加到历史记录
            const newHistoryItem = {
              id: Date.now(),
              account: values.account,
              steps: values.steps,
              timestamp: new Date().toLocaleString()
            };
            
            addToHistory(newHistoryItem);
            setUpdateStatus('success');
            
            // 增加连续更新天数
            setStreak(prev => {
              const newStreak = prev + 1;
              localStorage.setItem('streak', newStreak);
              return newStreak;
            });
          }
        } catch (error) {
          setUpdateStatus('error');
          if (notificationEnabled) {
            message.error('自动更新失败：' + (error.response?.data?.message || error.message));
          }
        }
      };
      
      // 立即执行一次
      updateSteps();
      
      // 设置定时器
      timer = setInterval(updateSteps, intervalMs);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [autoUpdate, autoUpdateInterval, form, randomRange, notificationEnabled, history]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setUpdateStatus('loading');
      
      // 如果启用了随机步数，则生成一个随机步数
      if (useRandom) {
        values.steps = Math.floor(Math.random() * (randomRange[1] - randomRange[0] + 1)) + randomRange[0];
      }
      
      const response = await axios.post('/api/update-steps', values);
      
      if (response.data.success) {
        setUpdateStatus('success');
        
        if (notificationEnabled) {
          message.success('步数更新成功！');
        }
        
        // 添加到历史记录
        const newHistoryItem = {
          id: Date.now(),
          account: values.account,
          steps: values.steps,
          timestamp: new Date().toLocaleString()
        };
        
        addToHistory(newHistoryItem);
        
        // 增加连续更新天数
        setStreak(prev => {
          const newStreak = prev + 1;
          localStorage.setItem('streak', newStreak);
          return newStreak;
        });
      } else {
        setUpdateStatus('error');
        if (notificationEnabled) {
          message.error(response.data.message || '更新失败，请稍后重试');
        }
      }
    } catch (error) {
      setUpdateStatus('error');
      if (notificationEnabled) {
        message.error('更新失败：' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // 高性能的背景效果
  // Background组件现在支持：
  // 1. 平滑的色彩渐变和动画
  // 2. 自适应不同设备尺寸
  // 3. 暗色模式和高对比度模式支持

  return (
    <>
      <Head>
        <title>微信支付宝运动步数修改 - Zepp Life步数修改助手 | 一键同步</title>
        <meta name="description" content="专业的微信运动、支付宝运动步数一键修改工具，支持一键同步至微信运动、支付宝、钉钉和苹果健康。采用Zepp Life(小米运动)接口，支持随机步数生成、自动定时更新，无需刷固件，安全稳定。" />
        <meta name="keywords" content="微信运动步数修改,支付宝运动步数修改,微信刷步数,支付宝刷步数,Zepp Life,小米运动,步数同步,钉钉步数,微信运动排名,支付宝运动排名,小米手环,华米手表" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Zepp Life Steps" />
        
        {/* Open Graph 标签优化 */}
        <meta property="og:title" content="微信支付宝运动步数修改 - Zepp Life步数修改助手" />
        <meta property="og:description" content="专业的微信运动、支付宝运动步数一键修改工具，支持随机生成和自动更新，无需刷固件，100%成功率。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://s.vercel.app/" />
        <meta property="og:site_name" content="微信支付宝运动步数修改助手" />
        <meta property="og:image" content="https://s.vercel.app/logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="zh_CN" />
        
        {/* Twitter 卡片优化 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="微信支付宝运动步数修改 - 安全稳定的一键同步工具" />
        <meta name="twitter:description" content="一键修改微信运动、支付宝运动步数，排名靠前不被检测，支持随机生成和自动定时更新。" />
        <meta name="twitter:image" content="https://s.vercel.app/logo.png" />
        
        {/* 其他重要元标签 */}
        <meta name="application-name" content="微信支付宝运动步数修改助手" />
        <meta name="apple-mobile-web-app-title" content="微信支付宝运动步数修改助手" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#6366f1" />
        
        {/* 规范链接 */}
        <link rel="canonical" href="https://s.vercel.app/" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* 添加Manifest链接 */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* 预加载关键资源 */}
        <link rel="preload" href="/logo.png" as="image" />
        
        {/* 确保搜索引擎发现sitemap */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        
        {/* 结构化数据 - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "微信支付宝运动步数修改助手",
              "url": "https://zepp-life-steps.vercel.app/",
              "description": "专业的微信运动、支付宝运动步数修改工具，通过Zepp Life(小米运动)接口，支持随机步数生成和自动定时更新功能。",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "CNY"
              },
              "author": {
                "@type": "Organization",
                "name": "Zepp Life Steps"
              }
            })
          }}
        />
      </Head>

      <Background />
      
      <div className="app-container">
        <div className="app-content">
          <Header 
            onShowSettings={() => setShowSettings(true)}
            onShowHelp={() => setShowHelp(true)}
            streak={streak}
          />
          
          <StepForm 
            form={form}
            onFinish={onFinish}
            loading={loading}
            randomRange={randomRange}
            setRandomRange={setRandomRange}
            useRandom={useRandom}
            setUseRandom={setUseRandom}
            generateRandomSteps={generateRandomSteps}
          />
          
          <StatsCard 
            lastUpdate={lastUpdate}
            history={history}
            streak={streak}
            clearHistory={clearHistory}
            showHistory={() => setShowHistory(true)}
          />
          
          <Footer />
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <HistoryDrawer 
            visible={showHistory}
            onClose={() => setShowHistory(false)}
            history={history}
            restoreFromHistory={restoreFromHistory}
          />
        )}
      </AnimatePresence>
      
      <SettingsModal 
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        autoUpdate={autoUpdate}
        setAutoUpdate={setAutoUpdate}
        autoUpdateInterval={autoUpdateInterval}
        setAutoUpdateInterval={setAutoUpdateInterval}
        notificationEnabled={notificationEnabled}
        setNotificationEnabled={setNotificationEnabled}
      />
      
      <HelpModal 
        visible={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
};

export default Home; 
