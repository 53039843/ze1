import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Tooltip, 
  Space, 
  Slider, 
  Switch, 
  Typography 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  NumberOutlined, 
  InfoCircleOutlined, 
  SyncOutlined, 
  FireOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Text, Title } = Typography;

const StepForm = ({
  form,
  onFinish,
  loading,
  randomRange,
  setRandomRange,
  useRandom,
  setUseRandom,
  generateRandomSteps
}) => {
  const [showPremiumButton, setShowPremiumButton] = useState(false);
  return (
    <motion.div
      className="step-form-container glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="card-header">
        <Title level={2} className="glass-title">微信步数修改</Title>
        <Text className="glass-subtitle"><span style={{ color: 'gold' }}>修改您的微信运动步数，抢占排行榜！~</span><br />第一次使用看右下角使用帮助哦~</Text>
      </div>

      <Form
        form={form}
        name="stepForm"
        onFinish={onFinish}
        className="glass-form"
        size="large"
      >
        <div className="form-item-container">
          <Form.Item
            name="account"
            rules={[{ required: true, message: '请输入您的Zepp Life应用账号!' }]}
          >
            <Input 
              className="glass-input"
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="手机号/邮箱" 
              autoComplete="username"
              suffix={
                <Tooltip title="填写您的Zepp Life应用账号">
                  <InfoCircleOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />
                </Tooltip>
              }
            />
          </Form.Item>
        </div>

        <div className="form-item-container">
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入您的密码!' }]}
          >
            <Input.Password
              className="glass-input"
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="密码"
              autoComplete="current-password"
              suffix={
                <Tooltip title="填写您的小米账号密码">
                  <InfoCircleOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />
                </Tooltip>
              }
            />
          </Form.Item>
        </div>

        <div className="form-item-container">
          <Space className="step-controls">
            <Form.Item
              name="steps"
              className="step-input"
              rules={useRandom ? [] : [{ required: true, message: '请输入步数!' },
                ({
                  validator(_, value) {
                    if (!value || value <= 30000) {
                      setShowPremiumButton(false);
                      return Promise.resolve();
                    }
                    setShowPremiumButton(true);
                    return Promise.reject(new Error("步数超过3万，请前往会员版使用哦~"));
                  },
                })]}
            >
              <Input
                className="glass-input"
                disabled={useRandom}
                prefix={<NumberOutlined className="site-form-item-icon" />}
                placeholder="步数"
                suffix={
                  <Tooltip title="填写您想要修改的步数">
                    <InfoCircleOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />
                  </Tooltip>
                }
              />
            </Form.Item>

            <Tooltip title="使用随机步数">
              <Switch
                checked={useRandom}
                onChange={setUseRandom}
                className="random-switch"
              />
            </Tooltip>
          </Space>
        </div>

        {useRandom && (
          <motion.div 
            className="random-steps-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Text className="glass-text">随机步数范围：{randomRange[0]} - {randomRange[1]} 步</Text>
            <div className="slider-container">
              <Slider
                range
                min={100}
                max={30000}
                defaultValue={randomRange}
                onChange={setRandomRange}
                className="glass-slider"
              />
            </div>
            <Button 
              type="dashed" 
              icon={<SyncOutlined />} 
              onClick={generateRandomSteps}
              className="random-button"
            >
              生成随机步数
            </Button>
          </motion.div>
        )}

        <Form.Item className="form-submit">
          <Space>
            {showPremiumButton && (
              <Button
                type="default"
                className="glass-button premium-button"
                onClick={() => window.open('https://hy.xhy6.com', '_blank')}
              >
                前往会员版
              </Button>
            )}
            <Button
              type="primary"
              htmlType="submit"
              className="glass-button"
              loading={loading}
              icon={<FireOutlined />}
              disabled={loading}
            >
              {loading ? '刷步中...' : '提交刷步'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </motion.div>
  );
};

export default StepForm; 
