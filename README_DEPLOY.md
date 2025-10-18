# Zepp Life 步数修改助手 - 带API计费和统计功能

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/53039843/ze1)

## 🚀 快速部署

### 一键部署到Railway（推荐）

点击上方按钮即可一键部署，支持SQLite数据库持久化。

详细部署指南请查看：[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

### 其他部署方式

- **Render**: 参考 [PERMANENT_DEPLOYMENT.md](./PERMANENT_DEPLOYMENT.md)
- **Docker**: 参考 [PERMANENT_DEPLOYMENT.md](./PERMANENT_DEPLOYMENT.md)
- **VPS自托管**: 参考 [PERMANENT_DEPLOYMENT.md](./PERMANENT_DEPLOYMENT.md)

## ✨ 新增功能

### API计费系统
- 单次调用费用：¥0.006
- 失败不扣费机制
- 余额不足自动拦截

### 统计仪表板
- 账户余额显示
- 总调用次数统计
- 成功/失败次数统计
- 7天API使用趋势图表
- 详细调用记录（IP、时间、状态）

### 易支付充值
- 支持支付宝和微信支付
- 充值即时到账
- 订单状态查询

## 📖 文档

- [功能说明](./BILLING_FEATURE.md) - 详细功能介绍
- [部署指南](./PERMANENT_DEPLOYMENT.md) - 完整部署说明
- [Railway部署](./RAILWAY_DEPLOY.md) - Railway快速部署
- [数据库设计](./database-design.md) - 数据库结构
- [测试报告](./TEST_REPORT.md) - 功能测试结果

## 🛠️ 本地开发

```bash
# 克隆仓库
git clone https://github.com/53039843/ze1.git
cd ze1

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用
# 首页: http://localhost:3000
# 仪表板: http://localhost:3000/dashboard
```

## 📊 技术栈

- **前端**: Next.js 15, React 18, Ant Design 5
- **后端**: Next.js API Routes, Better-SQLite3
- **图表**: @ant-design/plots
- **支付**: 易支付集成

## 📝 使用说明

1. 访问仪表板页面 `/dashboard`
2. 输入账号查看统计数据
3. 点击充值按钮进行充值
4. 使用计费API调用步数更新功能

## 🔐 易支付配置

- 商户ID: 1129
- 支持支付宝和微信支付
- 回调URL需要配置为: `https://your-domain.com/api/recharge/notify`

## ⚠️ 重要提示

- 项目使用SQLite数据库，需要支持文件持久化的部署平台
- 推荐使用Railway或Render进行部署
- Vercel等Serverless平台需要迁移到云数据库

## 📄 License

MIT License
