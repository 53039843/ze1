# 功能演示指南

## 在线演示地址

**仪表板**: https://3000-imdwklantsb5ofxicez2w-7cddcb1b.manusvm.computer/dashboard

## 演示步骤

### 1. 访问仪表板
打开浏览器访问仪表板URL，首次访问会弹出账号输入框。

### 2. 输入测试账号
```
账号: test@example.com
```
点击"确认"按钮。

### 3. 查看统计数据

#### 统计卡片（顶部4个卡片）
- **账户余额**: ¥1.0000（带充值按钮）
- **总调用次数**: 5次
- **成功次数**: 4次
- **成功率**: 80.00%

#### API使用统计图表
- 显示最近7天的API调用趋势
- 蓝色线：总调用次数
- 绿色线：成功次数

#### 最近调用记录表格
包含以下列：
- ID（请求ID）
- API名称
- IP地址
- 调用时间
- 状态（成功/失败，带颜色标签）
- 步数
- 费用（¥0.0060）
- 余额（调用后剩余余额）

### 4. 测试充值功能

#### 步骤：
1. 点击"账户余额"卡片中的"充值"按钮
2. 在弹出的充值窗口中：
   - 输入充值金额（例如：10元）
   - 选择支付方式（支付宝或微信支付）
3. 点击"立即充值"按钮
4. 会跳转到易支付页面（测试环境）
5. 支付成功后会自动返回仪表板，余额会更新

### 5. 刷新数据
点击右上角的"刷新数据"按钮，重新加载最新统计数据。

### 6. 导航功能
- 点击右侧浮动按钮中的"首页"图标，返回步数修改主页
- 从主页点击"仪表板"图标，返回统计页面

## 功能亮点

### 1. 实时统计
- 所有API调用都会实时记录
- 统计数据实时更新
- 成功率自动计算

### 2. 计费透明
- 单次调用费用：¥0.006
- 失败的调用不扣费
- 每次调用都显示扣费金额和剩余余额

### 3. 详细记录
- 记录每次调用的IP地址
- 精确到秒的时间戳
- 成功/失败状态清晰标识
- 失败原因记录（如有）

### 4. 易支付集成
- 支持支付宝和微信支付
- 安全的MD5签名验证
- 自动回调处理
- 充值即时到账

### 5. 用户体验
- 玻璃态设计风格
- 响应式布局（支持移动端）
- 流畅的动画效果
- 清晰的数据可视化

## API接口测试

### 获取用户统计
```bash
curl "https://3000-imdwklantsb5ofxicez2w-7cddcb1b.manusvm.computer/api/stats/user?account=test@example.com"
```

### 获取调用记录
```bash
curl "https://3000-imdwklantsb5ofxicez2w-7cddcb1b.manusvm.computer/api/stats/logs?account=test@example.com&page=1&pageSize=20"
```

### 创建充值订单
```bash
curl -X POST "https://3000-imdwklantsb5ofxicez2w-7cddcb1b.manusvm.computer/api/recharge/create" \
  -H "Content-Type: application/json" \
  -d '{"account":"test@example.com","amount":10,"type":"alipay"}'
```

## 技术特点

### 前端技术栈
- **Next.js 15** - React框架
- **Ant Design 5** - UI组件库
- **@ant-design/plots** - 数据可视化
- **Framer Motion** - 动画效果

### 后端技术栈
- **Next.js API Routes** - API接口
- **Better-SQLite3** - 数据库
- **Crypto-JS** - 加密签名

### 数据库设计
- **users表** - 用户信息和余额
- **api_logs表** - API调用记录
- **recharge_orders表** - 充值订单

## 注意事项

1. **测试环境**: 当前为测试环境，易支付为测试配置
2. **数据持久化**: 数据存储在SQLite数据库中
3. **生产部署**: 建议使用云数据库（如PostgreSQL）
4. **安全性**: 生产环境需要添加用户认证

## 下一步计划

- [ ] 添加用户登录认证
- [ ] 支持多用户隔离
- [ ] 添加API速率限制
- [ ] 导出统计报表
- [ ] 邮件通知功能
- [ ] 更多支付方式
