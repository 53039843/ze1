import React from 'react';
import { Typography, Row, Col, Statistic, Progress, Button, Tooltip, Badge } from 'antd';
import { FireOutlined, TrophyOutlined, HistoryOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Text, Title } = Typography;

const StatsCard = ({ lastUpdate, history, streak, clearHistory, showHistory }) => {
  const formatNumber = (num) => {
    return new Intl.NumberFormat('zh-CN').format(num);
  };

  return (
    <motion.div
      className="stats-card glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Link href="https://ol.hpny.shop/" target="_blank" className="footer-link">
              全自动会员版
            </Link>
      <div className="card-header">
        <Title level={3} className="glass-title">数据统计</Title>
        <Text className="glass-subtitle">您的步数更新统计</Text>
      </div>

      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={8}>
          <motion.div 
            className="stat-item"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Statistic 
              title={<Text className="stat-title">最近更新步数</Text>}
              value={lastUpdate ? formatNumber(lastUpdate.steps) : '-'}
              valueStyle={{ color: 'var(--primary-color)' }} 
              prefix={<FireOutlined />} 
            />
            {lastUpdate && (
              <div className="stat-extra">
                <ClockCircleOutlined /> 
                <Text className="stat-time">{new Date(lastUpdate.timestamp).toLocaleString()}</Text>
              </div>
            )}
          </motion.div>
        </Col>
        
        <Col xs={24} sm={8}>
          <motion.div 
            className="stat-item"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Statistic 
              title={<Text className="stat-title">连续记录天数</Text>}
              value={streak}
              valueStyle={{ color: 'var(--success-color)' }} 
              prefix={<TrophyOutlined />} 
              suffix="天"
            />
            <div className="streak-progress-container">
              <Progress 
                percent={streak % 10 * 10} 
                size="small" 
                showInfo={false} 
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                className="streak-progress" 
              />
              <Text className="progress-text">距离下一个里程碑：{10 - streak % 10}天</Text>
            </div>
          </motion.div>
        </Col>
        
        <Col xs={24} sm={8}>
          <motion.div 
            className="stat-item"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Statistic 
              title={<Text className="stat-title">历史记录数</Text>}
              value={history.length} 
              valueStyle={{ color: 'var(--warning-color)' }} 
              prefix={<HistoryOutlined />} 
              suffix="条"
            />
            <div className="history-actions">
              <Badge count={history.length} overflowCount={99} size="small">
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={showHistory}
                  icon={<HistoryOutlined />}
                  className="history-button"
                >
                </Button>
              </Badge>
              
              {history.length > 0 && (
                <Tooltip title="清除所有历史记录">
                  <Button 
                    type="text" 
                    danger 
                    size="small" 
                    onClick={clearHistory}
                    icon={<DeleteOutlined />}
                    className="clear-button"
                  />
                </Tooltip>
              )}
            </div>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default StatsCard; 
