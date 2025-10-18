# API计费和统计功能说明

## 功能概述

本次更新为Zepp Life步数修改工具添加了完整的API计费、统计和充值功能，包括：

1. **API调用计费系统**
2. **用户余额管理**
3. **易支付充值集成**
4. **可视化统计仪表板**
5. **详细的调用记录**

## 功能特性

### 1. 计费系统

- **单次调用费用**: ¥0.006
- **计费规则**: 仅成功调用扣费，失败不扣费
- **余额不足提醒**: 自动检查余额，不足时拒绝调用并提示充值

### 2. 统计仪表板

访问路径: `/dashboard`

**主要功能**:
- 账户余额显示
- 总调用次数统计
- 成功/失败次数统计
- 成功率计算
- 7天API使用趋势图表
- 详细的调用记录表格（包含IP、时间、状态）

### 3. 充值功能

**支持的支付方式**:
- 支付宝
- 微信支付

**充值流程**:
1. 在仪表板点击"充值"按钮
2. 输入充值金额（1-10000元）
3. 选择支付方式
4. 跳转到易支付页面完成支付
5. 支付成功后自动返回并更新余额

**易支付配置**:
- 接口地址: https://912pay.com/
- 商户ID: 1129
- 商户密钥: tlyayFFWFlyH3aH8Ya5wZ5Hq55l3yS53

## 技术实现

### 数据库

使用 **SQLite** 数据库存储数据，包含以下表：

1. **users** - 用户信息表
   - 账号、余额、调用统计

2. **api_logs** - API调用日志表
   - 请求ID、账号、IP、状态、费用等

3. **recharge_orders** - 充值订单表
   - 订单号、金额、状态、支付方式等

### API接口

#### 统计相关
- `GET /api/stats/user?account={account}` - 获取用户统计信息
- `GET /api/stats/daily?account={account}&days={days}` - 获取每日统计
- `GET /api/stats/logs?account={account}&page={page}&pageSize={pageSize}` - 获取调用记录

#### 充值相关
- `POST /api/recharge/create` - 创建充值订单
- `POST /api/recharge/notify` - 易支付回调接口
- `GET /api/recharge/status?order_id={order_id}` - 查询订单状态

#### 计费API
- `POST /api/update-steps-billing` - 带计费功能的步数更新API

## 使用方法

### 1. 安装依赖

```bash
npm install better-sqlite3 crypto-js @ant-design/plots
```

### 2. 启动服务

```bash
npm run dev
```

### 3. 访问仪表板

打开浏览器访问: `http://localhost:3000/dashboard`

### 4. 输入账号

首次访问会弹出账号输入框，输入您的Zepp Life账号即可查看统计数据。

### 5. 充值余额

点击"充值"按钮，输入金额并选择支付方式，完成支付后余额会自动更新。

### 6. 使用计费API

原有的API接口保持不变，新增了带计费功能的接口：

```bash
# 使用计费API
curl -X POST http://localhost:3000/api/update-steps-billing \
  -H "Content-Type: application/json" \
  -d '{
    "account": "your_account",
    "password": "your_password",
    "steps": 8000
  }'
```

## 数据库位置

数据库文件存储在: `./data/stats.db`

## 注意事项

1. **首次运行**: 数据库会自动创建，无需手动初始化
2. **数据备份**: 建议定期备份 `data/stats.db` 文件
3. **易支付配置**: 确保易支付回调URL可以正常访问
4. **生产环境**: 部署到生产环境时，请确保数据库文件有写权限

## 文件结构

```
ze1/
├── lib/
│   ├── database.js          # 数据库操作封装
│   └── epay.js              # 易支付工具类
├── pages/
│   ├── api/
│   │   ├── stats/
│   │   │   ├── user.js      # 用户统计API
│   │   │   ├── daily.js     # 每日统计API
│   │   │   └── logs.js      # 调用记录API
│   │   ├── recharge/
│   │   │   ├── create.js    # 创建充值订单
│   │   │   ├── notify.js    # 充值回调
│   │   │   └── status.js    # 订单状态查询
│   │   └── update-steps-billing.js  # 计费API
│   └── dashboard.js         # 统计仪表板页面
├── data/
│   └── stats.db             # SQLite数据库文件
└── database-design.md       # 数据库设计文档
```

## 截图预览

仪表板包含以下内容：
- 账户余额卡片（带充值按钮）
- 总调用次数卡片
- 成功次数卡片
- 成功率卡片
- API使用趋势图（7天数据）
- 详细调用记录表格（支持分页）

## 常见问题

### Q: 如何切换到计费模式？

A: 将原有的 `/api/update-steps` 接口替换为 `/api/update-steps-billing` 即可启用计费功能。

### Q: 充值后余额没有更新？

A: 请检查易支付回调接口是否配置正确，可以在服务器日志中查看回调信息。

### Q: 数据库文件在哪里？

A: 数据库文件位于项目根目录的 `data/stats.db`。

### Q: 如何修改单次调用费用？

A: 在 `pages/api/update-steps-billing.js` 文件中修改 `CALL_COST` 常量的值。

## 技术支持

如有问题，请查看日志文件或联系技术支持。

