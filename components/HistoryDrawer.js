import React from 'react';
import { Drawer, List, Typography, Button, Tag, Divider, Empty, Tooltip } from 'antd';
import { HistoryOutlined, UserOutlined, NumberOutlined, ClockCircleOutlined, RestOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Text, Title } = Typography;

const HistoryDrawer = ({ visible, onClose, history, restoreFromHistory }) => {
  return (
    <Drawer
      title={
        <div className="drawer-title" style={{ display: 'flex', alignItems: 'center' }}>
          <HistoryOutlined className="drawer-icon" style={{ color: '#ffb366', fontSize: '20px', marginRight: '10px' }} />
          <span style={{ color: '#ffb366', fontWeight: 600, fontSize: '18px' }}>步数历史记录</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      className="history-drawer"
      closeIcon={<RestOutlined className="drawer-close" style={{ color: '#ffb366', fontSize: '20px' }} />}
      footer={
        <div className="drawer-footer">
          <Text className="drawer-footer-text" style={{ color: '#ffb366', fontWeight: 500, fontSize: '16px' }}>
            共 {history.length} 条历史记录
          </Text>
        </div>
      }
      styles={{
        header: {
          background: 'linear-gradient(135deg, rgba(40, 30, 80, 0.99) 0%, rgba(30, 25, 60, 0.99) 100%)',
          borderBottom: '1px solid rgba(255, 179, 102, 0.4)',
          zIndex: 1150,
          padding: '16px 24px'
        },
        body: { 
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(40, 30, 80, 0.99) 0%, rgba(30, 25, 60, 0.99) 100%)',
          zIndex: 1150
        },
        footer: {
          background: 'linear-gradient(135deg, rgba(40, 30, 80, 0.99) 0%, rgba(30, 25, 60, 0.99) 100%)',
          borderTop: '1px solid rgba(255, 179, 102, 0.4)',
          zIndex: 1150,
          padding: '16px 24px'
        },
        content: {
          background: 'linear-gradient(135deg, rgba(40, 30, 80, 0.99) 0%, rgba(30, 25, 60, 0.99) 100%)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
          zIndex: 1150
        },
        mask: { 
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(5px)',
          zIndex: 1149
        },
        wrapper: {
          zIndex: 1151
        }
      }}
    >
      <AnimatePresence>
        {history.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="history-list-container"
            style={{ position: 'relative', zIndex: 1102 }}
          >
            <List
              className="history-list"
              dataSource={history}
              renderItem={(item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <List.Item
                    className="history-item"
                    style={{
                      background: 'rgba(25, 20, 50, 0.9)',
                      padding: '18px',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      border: '1px solid rgba(255, 179, 102, 0.3)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                      backdropFilter: 'blur(8px)',
                    }}
                    actions={[
                      <Button
                        key="restore"
                        type="primary"
                        onClick={() => restoreFromHistory(item)}
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.95) 0%, rgba(255, 102, 51, 0.95) 100%)',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(255, 128, 51, 0.5)',
                          fontWeight: 500,
                          fontSize: '15px',
                          height: '36px',
                          padding: '0 16px'
                        }}
                      >
                        使用此数据
                      </Button>
                    ]}
                  >
                    <div style={{ width: '100%' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <Tag color="#7c4dff" style={{ fontWeight: 600, padding: '2px 10px', fontSize: '14px' }}>
                          #{history.length - index}
                        </Tag>
                        <Text style={{ color: '#ffb366', fontSize: '14px', fontWeight: 500 }}>
                          {new Date(item.timestamp).toLocaleString()}
                        </Text>
                      </div>
                      
                      <Divider style={{ 
                        margin: '8px 0 14px', 
                        background: 'rgba(255, 179, 102, 0.3)' 
                      }} />
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            backgroundColor: 'rgba(255, 179, 102, 0.35)', 
                            padding: '8px', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '42px',
                            height: '42px',
                            border: '1px solid rgba(255, 179, 102, 0.5)'
                          }}>
                            <UserOutlined style={{ color: '#ffb366', fontSize: '22px' }} />
                          </div>
                          <Text style={{ 
                            color: '#ffffff', 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: 600,
                            fontSize: '16px',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                          }} ellipsis={{ tooltip: item.account }}>
                            {item.account}
                          </Text>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            backgroundColor: 'rgba(255, 179, 102, 0.35)', 
                            padding: '8px', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '42px',
                            height: '42px',
                            border: '1px solid rgba(255, 179, 102, 0.5)'
                          }}>
                            <NumberOutlined style={{ color: '#ffb366', fontSize: '22px' }} />
                          </div>
                          <Text style={{ 
                            color: '#ffffff', 
                            fontWeight: 600, 
                            fontSize: '16px',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                          }}>
                            {new Intl.NumberFormat('zh-CN').format(item.steps)} 步
                          </Text>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            backgroundColor: 'rgba(255, 179, 102, 0.35)', 
                            padding: '8px', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '42px',
                            height: '42px',
                            border: '1px solid rgba(255, 179, 102, 0.5)'
                          }}>
                            <ClockCircleOutlined style={{ color: '#ffb366', fontSize: '22px' }} />
                          </div>
                          <Text style={{ 
                            color: '#ffffff', 
                            fontWeight: 600, 
                            fontSize: '16px',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                          }}>
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                </motion.div>
              )}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '300px',
              background: 'rgba(25, 20, 50, 0.85)',
              borderRadius: '12px',
              padding: '20px',
              position: 'relative',
              zIndex: 1152,
              border: '1px solid rgba(255, 179, 102, 0.25)',
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span style={{ color: '#ffb366', fontWeight: 500, fontSize: '16px' }}>暂无历史记录</span>}
              imageStyle={{ 
                filter: 'invert(1) sepia(0.5) saturate(5) hue-rotate(5deg)', 
                opacity: 0.9,
                transform: 'scale(1.2)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Drawer>
  );
};

export default HistoryDrawer; 