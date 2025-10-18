# Vercel 一键部署指南

## 🚀 快速部署

### 方法一：一键部署按钮

点击下面的按钮即可一键部署到Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/53039843/ze1)

### 方法二：从GitHub导入

#### 1. 访问Vercel
打开浏览器访问：https://vercel.com

#### 2. 登录Vercel
使用GitHub账号登录

#### 3. 导入项目
1. 点击 "Add New..." → "Project"
2. 选择 "Import Git Repository"
3. 找到并选择仓库 `53039843/ze1`
4. 点击 "Import"

#### 4. 配置项目
Vercel会自动检测Next.js项目，无需额外配置：
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### 5. 部署
点击 "Deploy" 按钮，等待3-5分钟完成部署

#### 6. 获取访问URL
部署成功后，Vercel会提供一个公网URL：
```
https://ze1-xxxx.vercel.app
```

---

## 📝 重要说明

### 数据存储方式

由于Vercel是Serverless环境，文件系统是只读的（除了`/tmp`目录）。本项目使用以下方案：

#### 简化版（当前方案）
- 使用 `/tmp` 目录存储JSON文件
- **注意**: `/tmp`目录在每次冷启动时会清空
- 适合演示和测试
- **不适合生产环境**

#### 生产环境方案（推荐）
如需在生产环境使用，建议升级到以下方案之一：

1. **Vercel Postgres**（推荐）
   - Vercel官方数据库服务
   - 免费套餐：60小时计算时间/月
   - 自动备份和扩展
   - [查看文档](https://vercel.com/docs/storage/vercel-postgres)

2. **Vercel KV**（Redis）
   - 基于Redis的键值存储
   - 免费套餐：30MB存储
   - 适合简单数据存储
   - [查看文档](https://vercel.com/docs/storage/vercel-kv)

3. **外部数据库**
   - Supabase（免费PostgreSQL）
   - PlanetScale（免费MySQL）
   - MongoDB Atlas（免费MongoDB）

---

## 🎯 访问页面

部署完成后，可以访问以下页面：

### 主要页面
- **首页**: `https://your-vercel-url.vercel.app/`
- **统计仪表板**: `https://your-vercel-url.vercel.app/dashboard-simple`

### 特点
- ✅ **无需登录**：直接打开即可查看
- ✅ **固定账号**：使用演示账号 `demo@zepp.com`
- ✅ **实时统计**：显示API调用统计和图表
- ✅ **充值功能**：支持易支付充值

---

## 🔧 部署后配置

### 1. 测试网站
访问您的Vercel URL，确认网站正常运行

### 2. 更新易支付回调URL
在易支付后台更新回调URL为：
```
https://your-vercel-url.vercel.app/api/recharge/notify
```

### 3. 配置自定义域名（可选）
1. 在Vercel项目设置中点击 "Domains"
2. 添加您的域名
3. 按照提示配置DNS记录
4. 等待DNS生效

---

## 🔄 自动部署

Vercel已配置自动部署，每次推送到GitHub main分支时会自动重新部署：

```bash
git add .
git commit -m "更新功能"
git push origin main
```

Vercel会自动检测更新并重新部署（约2-3分钟）。

---

## 📊 监控和管理

### 查看部署日志
1. 在Vercel Dashboard中选择您的项目
2. 点击 "Deployments" 标签
3. 选择具体的部署查看日志

### 查看运行日志
1. 点击 "Logs" 标签
2. 可以看到实时的函数调用日志

### 查看分析数据
1. 点击 "Analytics" 标签
2. 查看访问量、性能等数据

---

## ⚠️ 注意事项

### 1. 数据持久化限制
- `/tmp` 目录的数据在冷启动时会丢失
- 如需持久化数据，请使用Vercel Postgres或外部数据库

### 2. 函数执行时间限制
- 免费套餐：10秒
- Pro套餐：60秒
- 如果API调用超时，需要优化代码或升级套餐

### 3. 函数调用次数限制
- 免费套餐：100GB-hours/月
- 通常足够个人项目使用

### 4. 环境变量
如需添加环境变量：
1. 在Vercel Dashboard中选择项目
2. 点击 "Settings" → "Environment Variables"
3. 添加变量名和值
4. 重新部署生效

---

## 🆙 升级到生产环境

### 使用Vercel Postgres

#### 1. 创建数据库
1. 在Vercel Dashboard中选择项目
2. 点击 "Storage" 标签
3. 点击 "Create Database"
4. 选择 "Postgres"
5. 选择区域并创建

#### 2. 获取连接信息
Vercel会自动添加以下环境变量：
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

#### 3. 修改代码
将 `lib/database-simple.js` 替换为使用PostgreSQL的版本（需要安装`pg`包）

#### 4. 重新部署
推送代码到GitHub，Vercel会自动重新部署

---

## 💰 费用说明

### Vercel免费套餐
- **带宽**: 100GB/月
- **函数执行**: 100GB-hours/月
- **函数执行时间**: 10秒
- **部署**: 无限次
- **团队成员**: 1人
- **自定义域名**: 支持

### Vercel Pro套餐（$20/月）
- **带宽**: 1TB/月
- **函数执行**: 1000GB-hours/月
- **函数执行时间**: 60秒
- **更多功能**: 密码保护、分析等

**免费套餐足够个人项目使用！**

---

## 🐛 故障排查

### 部署失败
1. 查看部署日志找到错误信息
2. 检查 package.json 中的依赖是否正确
3. 确保Node.js版本兼容（推荐18.x）

### 页面404错误
1. 检查页面文件是否在 `pages/` 目录下
2. 确认文件名和路由匹配
3. 重新部署

### API接口错误
1. 查看函数日志
2. 检查API路由是否正确
3. 确认请求方法（GET/POST）

### 数据丢失
1. 确认是否使用了 `/tmp` 目录
2. 冷启动会清空 `/tmp` 数据
3. 升级到Vercel Postgres或外部数据库

---

## 📚 相关资源

- [Vercel官方文档](https://vercel.com/docs)
- [Next.js部署指南](https://nextjs.org/docs/deployment)
- [Vercel Postgres文档](https://vercel.com/docs/storage/vercel-postgres)
- [项目GitHub仓库](https://github.com/53039843/ze1)

---

## ✅ 部署检查清单

部署完成后，请确认以下项目：

- [ ] 网站可以正常访问
- [ ] 首页显示正常
- [ ] 统计仪表板可以打开（/dashboard-simple）
- [ ] 可以查看统计数据
- [ ] API接口响应正常
- [ ] 已更新易支付回调URL
- [ ] 已配置自定义域名（可选）
- [ ] 已设置环境变量（如需要）

---

## 🎉 完成

恭喜！您的网站已成功部署到Vercel并可以永久访问。

**访问地址**: https://your-vercel-url.vercel.app/dashboard-simple

如有问题，请查看Vercel的日志或联系技术支持。

