import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Modal, Input, message, Select, Statistic, Tag, Space, Spin } from 'antd';
import { 
  DollarOutlined, 
  ApiOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ReloadOutlined,
  AlipayOutlined,
  WechatOutlined
} from '@ant-design/icons';
import Head from 'next/head';
import axios from 'axios';
import { Line } from '@ant-design/plots';
import Background from '../components/Background';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Option } = Select;

// 固定账号，无需登录
const FIXED_ACCOUNT = 'demo@zepp.com';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [apiLogs, setApiLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(10);
  const [paymentType, setPaymentType] = useState('alipay');

  // 检查是否从充值成功页面返回
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      message.success('充值成功！余额已更新');
      window.history.replaceState({}, '', '/dashboard-simple');
    }
    
    // 自动加载数据
    loadAllData();
  }, []);

  // 加载所有数据
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, dailyRes, logsRes] = await Promise.all([
        axios.get(`/api/stats/user-simple?account=${FIXED_ACCOUNT}`),
        axios.get(`/api/stats/daily-simple?account=${FIXED_ACCOUNT}&days=7`),
        axios.get(`/api/stats/logs-simple?account=${FIXED_ACCOUNT}&page=${currentPage}&pageSize=${pageSize}`)
      ]);

      if (statsRes.data.success) {
        setUserStats(statsRes.data.data);
      }

      if (dailyRes.data.success) {
        setDailyStats(dailyRes.data.data);
      }

      if (logsRes.data.success) {
        setApiLogs(logsRes.data.data.records);
        setLogsTotal(logsRes.data.data.total);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    loadAllData();
  };

  // 分页变化
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // 加载日志数据（分页变化时）
  useEffect(() => {
    axios.get(`/api/stats/logs-simple?account=${FIXED_ACCOUNT}&page=${currentPage}&pageSize=${pageSize}`)
      .then(res => {
        if (res.data.success) {
          setApiLogs(res.data.data.records);
          setLogsTotal(res.data.data.total);
        }
      })
      .catch(error => {
        console.error('加载日志失败:', error);
      });
  }, [currentPage, pageSize]);

  // 打开充值弹窗
  const handleRecharge = () => {
    setRechargeModalVisible(true);
  };

  // 提交充值
  const handleRechargeSubmit = async () => {
    if (!rechargeAmount || rechargeAmount < 1 || rechargeAmount > 10000) {
      message.error('充值金额必须在1-10000元之间');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/recharge/create', {
        account: FIXED_ACCOUNT,
        amount: rechargeAmount,
        type: paymentType
      });

      if (res.data.success) {
        window.location.href = res.data.data.pay_url;
      } else {
        message.error(res.data.message || '创建订单失败');
      }
    } catch (error) {
      console.error('创建充值订单失败:', error);
      message.error('创建充值订单失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 图表配置
  const chartConfig = {
    data: dailyStats.map(item => ({
      date: item.date,
      value: item.total,
      type: '总调用'
    })).concat(dailyStats.map(item => ({
      date: item.date,
      value: item.success,
      type: '成功'
    }))),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: ['#1890ff', '#52c41a'],
    legend: {
      position: 'top',
    },
    tooltip: {
      showMarkers: true,
    },
    point: {
      size: 5,
      shape: 'circle',
    },
  };

  // 日志表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'API名称',
      dataIndex: 'api_name',
      key: 'api_name',
      width: 150,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
    },
    {
      title: '调用时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text) => {
        try {
          return new Date(text).toLocaleString('zh-CN');
        } catch {
          return text;
        }
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'success' ? 'success' : 'error'} icon={status === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '步数',
      dataIndex: 'steps',
      key: 'steps',
      width: 100,
    },
    {
      title: '费用',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost) => `¥${(cost || 0).toFixed(4)}`,
    },
    {
      title: '余额',
      dataIndex: 'balance_after',
      key: 'balance_after',
      width: 100,
      render: (balance) => balance !== null && balance !== undefined ? `¥${balance.toFixed(4)}` : '-',
    },
  ];

  return (
    <>
      <Head>
        <title>API使用统计 - Zepp Life步数修改助手</title>
        <meta name="description" content="查看API使用统计、余额管理和充值" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Background />
      
      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Header />
        
        <div style={{ 
          maxWidth: 1400, 
          margin: '0 auto', 
          padding: '24px',
          paddingTop: '80px'
        }}>
          {/* 标题栏 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 24,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            padding: '16px 24px',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24 }}>API使用统计仪表盘</h1>
              <p style={{ margin: '4px 0 0 0', color: '#666' }}>演示账号: {FIXED_ACCOUNT}</p>
            </div>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              刷新数据
            </Button>
          </div>

          <Spin spinning={loading}>
            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Statistic
                    title="账户余额"
                    value={userStats?.balance || 0}
                    precision={4}
                    prefix="¥"
                    valueStyle={{ color: '#3f8600' }}
                    suffix={
                      <Button 
                        type="primary" 
                        size="small" 
                        onClick={handleRecharge}
                        style={{ marginLeft: 8 }}
                      >
                        充值
                      </Button>
                    }
                  />
                  <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                    单价: ¥0.006/次（失败不扣费）
                  </p>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Statistic
                    title="总调用次数"
                    value={userStats?.total_calls || 0}
                    prefix={<ApiOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Statistic
                    title="成功次数"
                    value={userStats?.success_calls || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Statistic
                    title="成功率"
                    value={userStats?.success_rate || 0}
                    precision={2}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* API使用统计图表 */}
            <Card 
              title="API使用统计（最近7天）"
              style={{ 
                marginBottom: 24,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {dailyStats.length > 0 ? (
                <Line {...chartConfig} height={300} />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                  暂无数据
                </div>
              )}
            </Card>

            {/* 最近调用记录 */}
            <Card 
              title="最近调用记录"
              extra={<span style={{ fontSize: 14, color: '#666' }}>总调用次数: {logsTotal}</span>}
              style={{ 
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Table
                columns={columns}
                dataSource={apiLogs}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: logsTotal,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 1200 }}
              />
            </Card>
          </Spin>

          {/* 充值弹窗 */}
          <Modal
            title="账户充值"
            open={rechargeModalVisible}
            onOk={handleRechargeSubmit}
            onCancel={() => setRechargeModalVisible(false)}
            okText="立即充值"
            cancelText="取消"
            confirmLoading={loading}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>充值金额（元）</label>
                <Input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(parseFloat(e.target.value))}
                  placeholder="请输入充值金额"
                  min={1}
                  max={10000}
                  size="large"
                  prefix="¥"
                />
                <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  充值金额范围: 1-10000元
                </p>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8 }}>支付方式</label>
                <Select
                  value={paymentType}
                  onChange={setPaymentType}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="alipay">
                    <AlipayOutlined style={{ marginRight: 8, color: '#1677ff' }} />
                    支付宝
                  </Option>
                  <Option value="wxpay">
                    <WechatOutlined style={{ marginRight: 8, color: '#07c160' }} />
                    微信支付
                  </Option>
                </Select>
              </div>
              <div style={{ 
                background: '#f0f5ff', 
                padding: 16, 
                borderRadius: 8,
                border: '1px solid #adc6ff'
              }}>
                <p style={{ margin: 0, fontSize: 14, color: '#1890ff' }}>
                  <strong>充值说明：</strong>
                </p>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: 20, fontSize: 13, color: '#666' }}>
                  <li>单次API调用费用: ¥0.006</li>
                  <li>失败的调用不扣费</li>
                  <li>充值后即时到账</li>
                  <li>余额不过期</li>
                </ul>
              </div>
            </Space>
          </Modal>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Dashboard;

