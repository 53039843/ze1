import React from 'react';
import { Modal, Switch, Typography, Slider, Space, Button, Divider, Tooltip } from 'antd';
import { SettingOutlined, ClockCircleOutlined, BellOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

const SettingsModal = ({ 
  visible, 
  onClose, 
  autoUpdate, 
  setAutoUpdate, 
  autoUpdateInterval, 
  setAutoUpdateInterval, 
  notificationEnabled, 
  setNotificationEnabled
}) => {
  return (
    <Modal
      title={
        <div className="modal-title">
          <SettingOutlined className="modal-icon" />
          <span>设置</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      className="settings-modal glass-modal"
      width={480}
    >
      <div className="settings-content">
        <div className="settings-section">
          <Title level={5} className="settings-title">自动更新</Title>
          <div className="settings-option">
            <div className="option-label">
              <Text className="option-text">启用自动更新</Text>
              <Text type="secondary" className="option-description">
                系统将按照设定时间间隔自动更新步数
              </Text>
            </div>
            <Switch checked={autoUpdate} onChange={setAutoUpdate} />
          </div>
          
          {autoUpdate && (
            <div className="settings-option interval-option">
              <div className="option-label">
                <Text className="option-text">
                  <ClockCircleOutlined /> 更新间隔（小时）
                </Text>
                <Text type="secondary" className="option-current-value">
                  当前: {autoUpdateInterval} 小时
                </Text>
              </div>
              <Slider
                min={1}
                max={24}
                step={1}
                value={autoUpdateInterval}
                onChange={setAutoUpdateInterval}
                className="glass-slider"
                style={{ marginTop: 8 }}
              />
            </div>
          )}
        </div>
        
        <Divider className="settings-divider" />
        
        <div className="settings-section">
          <Title level={5} className="settings-title">消息通知</Title>
          <div className="settings-option">
            <div className="option-label">
              <Text className="option-text">启用通知</Text>
              <Text type="secondary" className="option-description">
                操作后显示成功/失败通知
              </Text>
            </div>
            <Switch checked={notificationEnabled} onChange={setNotificationEnabled} />
          </div>
        </div>
        
        <Divider className="settings-divider" />
        
        <div className="settings-section">
          <Title level={5} className="settings-title">数据</Title>
          <div className="settings-actions">
            <Tooltip title="清除所有数据并重置应用">
              <Button 
                danger 
                icon={<ReloadOutlined />}
                onClick={() => {
                  if (confirm('确定要清除所有数据并重置应用吗？此操作不可撤销。')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
              >
                重置应用
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal; 