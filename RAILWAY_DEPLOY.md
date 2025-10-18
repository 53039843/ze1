# Railway 一键部署指南

## 🚀 快速部署（推荐）

### 方法一：一键部署按钮

点击下面的按钮即可一键部署到Railway：

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/53039843/ze1)

### 方法二：手动部署

#### 1. 登录Railway
访问 https://railway.app 并使用GitHub账号登录

#### 2. 创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 授权Railway访问您的GitHub账号
4. 选择仓库 `53039843/ze1`

#### 3. 配置项目
Railway会自动检测Next.js项目并开始部署，无需额外配置。

#### 4. 添加持久化存储（重要）⚠️
由于项目使用SQLite数据库，需要添加持久化卷：

1. 在Railway项目Dashboard中，点击您的服务
2. 进入 "Settings" 标签
3. 找到 "Volumes" 部分
4. 点击 "New Volume"
5. 配置：
   - **Mount Path**: `/app/data`
   - **Size**: 1GB（可根据需要调整）
6. 点击 "Add" 保存

#### 5. 等待部署完成
部署通常需要3-5分钟，您可以在 "Deployments" 标签查看进度。

#### 6. 获取访问URL
部署成功后：
1. 在项目Dashboard中点击 "Settings"
2. 找到 "Domains" 部分
3. 点击 "Generate Domain"
4. Railway会生成一个公网URL，例如：
   ```
   https://ze1-production-xxxx.up.railway.app
   ```

#### 7. 配置自定义域名（可选）
1. 在 "Domains" 部分点击 "Custom Domain"
2. 输入您的域名（例如：api.yourdomain.com）
3. 按照提示配置DNS记录：
   ```
   类型: CNAME
   名称: api
   值: ze1-production-xxxx.up.railway.app
   ```
4. 等待DNS生效（通常5-30分钟）

---

## 🔧 部署后配置

### 1. 测试网站
访问您的Railway URL，应该能看到网站首页。

测试以下页面：
- 首页: `https://your-railway-url.up.railway.app/`
- 仪表板: `https://your-railway-url.up.railway.app/dashboard`

### 2. 更新易支付回调URL
在易支付后台更新回调URL为：
```
https://your-railway-url.up.railway.app/api/recharge/notify
```

### 3. 测试API功能
```bash
# 测试用户统计API
curl "https://your-railway-url.up.railway.app/api/stats/user?account=test@example.com"

# 测试计费API
curl -X POST "https://your-railway-url.up.railway.app/api/update-steps-billing" \
  -H "Content-Type: application/json" \
  -d '{"account":"ydb1001@qq.com","password":"Aa123456","steps":8888}'
```

---

## 📊 监控和管理

### 查看日志
1. 在Railway项目Dashboard中点击您的服务
2. 进入 "Logs" 标签
3. 可以看到实时日志输出

### 查看资源使用
1. 进入 "Metrics" 标签
2. 查看CPU、内存、网络使用情况

### 重启服务
1. 进入 "Settings" 标签
2. 点击 "Restart" 按钮

---

## 🔄 更新部署

### 自动部署
Railway已配置自动部署，每次推送到GitHub main分支时会自动重新部署：

```bash
git add .
git commit -m "更新功能"
git push origin main
```

Railway会自动检测更新并重新部署（约3-5分钟）。

### 手动触发部署
1. 在Railway Dashboard中进入 "Deployments" 标签
2. 点击 "Redeploy" 按钮

---

## 💾 数据备份

### 方法一：通过Railway CLI
1. 安装Railway CLI：
   ```bash
   npm install -g @railway/cli
   ```

2. 登录：
   ```bash
   railway login
   ```

3. 连接到项目：
   ```bash
   railway link
   ```

4. 下载数据库文件：
   ```bash
   railway run cat /app/data/stats.db > stats.db.backup
   ```

### 方法二：通过API
创建一个备份API接口（需要添加认证）：
```javascript
// pages/api/backup/download.js
export default function handler(req, res) {
  // 添加认证逻辑
  const fs = require('fs');
  const dbPath = './data/stats.db';
  const dbFile = fs.readFileSync(dbPath);
  
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename=stats.db');
  res.send(dbFile);
}
```

---

## 💰 费用说明

### 免费套餐
- **额度**: 每月$5
- **运行时间**: 约500小时（足够24/7运行）
- **限制**: 
  - 512MB内存
  - 1GB存储
  - 无休眠

### 付费套餐
如果免费额度不够，可以升级到付费套餐：
- **Hobby**: $5/月起
- **Pro**: $20/月起

---

## ⚠️ 注意事项

### 1. 持久化卷必须配置
如果不配置Volume，每次重新部署时数据库文件会丢失！

### 2. 环境变量
如果需要添加环境变量：
1. 进入 "Variables" 标签
2. 点击 "New Variable"
3. 添加变量名和值

### 3. 数据库大小限制
免费套餐的Volume限制为1GB，如果数据增长过快，需要：
- 定期清理旧数据
- 或升级到付费套餐

### 4. 定期备份
建议每周备份一次数据库文件，防止数据丢失。

---

## 🐛 故障排查

### 部署失败
1. 查看 "Logs" 标签的错误信息
2. 检查 package.json 中的依赖是否正确
3. 确保 Node.js 版本兼容（推荐18.x）

### 数据库文件丢失
1. 检查是否配置了Volume
2. 确认Mount Path为 `/app/data`
3. 重新部署后数据会丢失，需要从备份恢复

### 网站无法访问
1. 检查部署状态是否为 "Active"
2. 查看日志是否有错误
3. 确认端口配置正确（默认3000）

### 易支付回调失败
1. 确认回调URL配置正确
2. 检查Railway URL是否可以公网访问
3. 查看 `/api/recharge/notify` 的日志

---

## 📚 相关资源

- [Railway官方文档](https://docs.railway.app/)
- [Railway CLI文档](https://docs.railway.app/develop/cli)
- [Next.js部署指南](https://nextjs.org/docs/deployment)
- [项目GitHub仓库](https://github.com/53039843/ze1)

---

## ✅ 部署检查清单

部署完成后，请确认以下项目：

- [ ] 网站可以正常访问
- [ ] 首页显示正常
- [ ] 仪表板页面可以打开
- [ ] 可以输入账号查看统计
- [ ] API接口响应正常
- [ ] 已配置持久化Volume
- [ ] 已更新易支付回调URL
- [ ] 已测试充值功能
- [ ] 已设置数据备份计划
- [ ] 已配置监控（可选）

---

## 🎉 完成

恭喜！您的网站已成功部署到Railway并可以永久访问。

如有问题，请查看Railway的日志或联系技术支持。

