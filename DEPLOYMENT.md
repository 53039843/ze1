# 部署说明

## 本地开发

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问应用
- 首页: http://localhost:3000
- 仪表板: http://localhost:3000/dashboard

## 生产部署

### Vercel部署

1. **推送代码到GitHub**
```bash
git add .
git commit -m "添加API计费和统计功能"
git push origin main
```

2. **在Vercel中导入项目**
   - 访问 https://vercel.com
   - 点击 "Import Project"
   - 选择您的GitHub仓库

3. **配置环境变量（如需要）**
   - 在Vercel项目设置中添加环境变量

4. **部署**
   - Vercel会自动构建和部署
   - 部署完成后会提供访问URL

### 注意事项

#### 数据库持久化
- **重要**: Vercel的Serverless环境不支持文件系统持久化
- 建议使用以下方案之一：
  1. **Vercel Postgres** - Vercel官方数据库服务
  2. **Supabase** - 免费的PostgreSQL数据库
  3. **PlanetScale** - MySQL数据库服务
  4. **MongoDB Atlas** - NoSQL数据库

#### 迁移到云数据库

如果需要在生产环境使用，建议修改 `lib/database.js` 以支持云数据库：

```javascript
// 示例：使用PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

#### 易支付回调URL
确保在生产环境中，易支付的回调URL可以正常访问：
```
https://your-domain.com/api/recharge/notify
```

## 自托管部署

### 使用Node.js

1. **构建项目**
```bash
npm run build
```

2. **启动生产服务器**
```bash
npm start
```

3. **使用PM2管理进程**
```bash
npm install -g pm2
pm2 start npm --name "zepp-life" -- start
pm2 save
pm2 startup
```

### 使用Docker

创建 `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

构建和运行:
```bash
docker build -t zepp-life .
docker run -p 3000:3000 -v $(pwd)/data:/app/data zepp-life
```

## 数据备份

定期备份数据库文件：
```bash
# 备份
cp data/stats.db data/stats.db.backup.$(date +%Y%m%d)

# 恢复
cp data/stats.db.backup.20251018 data/stats.db
```

## 监控和日志

### 查看日志
```bash
# 开发环境
npm run dev

# 生产环境（使用PM2）
pm2 logs zepp-life
```

### 监控数据库大小
```bash
du -h data/stats.db
```

## 性能优化

1. **数据库索引**: 已在 `lib/database.js` 中创建必要索引
2. **API缓存**: 考虑使用Redis缓存热点数据
3. **CDN**: 静态资源使用CDN加速
4. **数据库连接池**: 生产环境使用连接池管理

## 安全建议

1. **环境变量**: 敏感信息使用环境变量
2. **HTTPS**: 生产环境必须使用HTTPS
3. **速率限制**: 添加API速率限制防止滥用
4. **输入验证**: 所有用户输入进行验证和清理
5. **SQL注入防护**: 使用参数化查询（已实现）

## 故障排查

### 数据库文件权限问题
```bash
chmod 755 data
chmod 644 data/stats.db
```

### 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 依赖问题
```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
```

## 技术支持

如有问题，请查看：
- [Next.js文档](https://nextjs.org/docs)
- [Ant Design文档](https://ant.design/docs/react/introduce-cn)
- [Better-SQLite3文档](https://github.com/WiseLibs/better-sqlite3)
