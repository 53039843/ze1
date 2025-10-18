# 永久部署指南

本项目使用SQLite数据库，需要支持文件持久化的平台。推荐使用以下平台：

## 方案一：Railway部署（推荐）⭐

Railway提供免费套餐，支持SQLite持久化存储。

### 步骤

#### 1. 注册Railway账号
访问 https://railway.app 并使用GitHub账号登录

#### 2. 创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择您的仓库 `53039843/ze1`
4. Railway会自动检测Next.js项目并开始部署

#### 3. 配置环境变量（可选）
在Railway项目设置中添加：
- `NODE_ENV=production`
- `PORT=3000`

#### 4. 添加持久化卷（Volume）
1. 在Railway项目中点击 "Settings"
2. 找到 "Volumes" 部分
3. 点击 "Add Volume"
4. 设置挂载路径: `/app/data`
5. 保存设置

#### 5. 获取部署URL
部署完成后，Railway会提供一个公网URL，例如：
```
https://ze1-production.up.railway.app
```

#### 6. 配置自定义域名（可选）
1. 在Railway项目设置中点击 "Domains"
2. 添加您的自定义域名
3. 按照提示配置DNS记录

### 费用
- 免费套餐：每月$5额度（约500小时运行时间）
- 足够个人项目使用

---

## 方案二：Render部署

Render也提供免费套餐，支持持久化存储。

### 步骤

#### 1. 注册Render账号
访问 https://render.com 并使用GitHub账号登录

#### 2. 创建Web Service
1. 点击 "New +"
2. 选择 "Web Service"
3. 连接GitHub仓库 `53039843/ze1`

#### 3. 配置部署设置
- **Name**: ze1
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free

#### 4. 添加持久化磁盘
1. 在服务设置中找到 "Disks"
2. 点击 "Add Disk"
3. 设置：
   - Name: `data`
   - Mount Path: `/app/data`
   - Size: 1GB（免费）

#### 5. 部署
点击 "Create Web Service"，Render会自动部署

#### 6. 获取URL
部署完成后会得到类似的URL：
```
https://ze1.onrender.com
```

### 费用
- 免费套餐：750小时/月
- 注意：免费套餐15分钟无活动会休眠

---

## 方案三：自托管VPS部署

如果您有自己的服务器，可以使用Docker部署。

### 使用Docker部署

#### 1. 在服务器上安装Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### 2. 克隆仓库
```bash
git clone https://github.com/53039843/ze1.git
cd ze1
```

#### 3. 构建Docker镜像
```bash
docker build -t ze1-app .
```

#### 4. 运行容器
```bash
docker run -d \
  --name ze1 \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  ze1-app
```

#### 5. 配置Nginx反向代理（可选）
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 6. 配置SSL证书（使用Let's Encrypt）
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 方案四：使用PM2部署（VPS）

如果您有VPS但不想使用Docker：

### 步骤

#### 1. 安装Node.js和PM2
```bash
# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
sudo npm install -g pm2
```

#### 2. 克隆并构建项目
```bash
git clone https://github.com/53039843/ze1.git
cd ze1
npm install
npm run build
```

#### 3. 使用PM2启动
```bash
pm2 start npm --name "ze1" -- start
pm2 save
pm2 startup
```

#### 4. 查看日志
```bash
pm2 logs ze1
```

#### 5. 重启服务
```bash
pm2 restart ze1
```

---

## 部署后配置

### 1. 更新易支付回调URL
部署完成后，需要在易支付后台更新回调URL：
```
https://your-domain.com/api/recharge/notify
```

### 2. 测试功能
1. 访问首页：`https://your-domain.com`
2. 访问仪表板：`https://your-domain.com/dashboard`
3. 测试API调用
4. 测试充值功能

### 3. 数据库备份
定期备份数据库文件：
```bash
# 手动备份
cp data/stats.db data/stats.db.backup.$(date +%Y%m%d)

# 自动备份（添加到crontab）
0 2 * * * cd /path/to/ze1 && cp data/stats.db data/stats.db.backup.$(date +\%Y\%m\%d)
```

---

## 监控和维护

### 健康检查
设置监控服务（如UptimeRobot）定期检查网站状态：
```
https://your-domain.com/
```

### 日志查看
- Railway: 在Dashboard中查看实时日志
- Render: 在服务页面查看日志
- Docker: `docker logs ze1`
- PM2: `pm2 logs ze1`

### 更新部署
```bash
# Railway/Render: 推送到GitHub会自动部署
git push origin main

# Docker: 重新构建和运行
git pull
docker build -t ze1-app .
docker stop ze1
docker rm ze1
docker run -d --name ze1 -p 3000:3000 -v $(pwd)/data:/app/data --restart unless-stopped ze1-app

# PM2: 拉取代码并重启
git pull
npm install
npm run build
pm2 restart ze1
```

---

## 性能优化

### 1. 启用CDN
使用Cloudflare等CDN服务加速静态资源

### 2. 数据库优化
定期清理旧数据：
```sql
-- 删除30天前的日志
DELETE FROM api_logs WHERE created_at < datetime('now', '-30 days');
```

### 3. 缓存配置
在Next.js中配置适当的缓存策略

---

## 故障排查

### 数据库文件权限问题
```bash
chmod 755 data
chmod 644 data/stats.db
```

### 端口被占用
```bash
# 查找占用端口的进程
sudo lsof -i :3000
# 杀死进程
sudo kill -9 <PID>
```

### 内存不足
增加Node.js内存限制：
```bash
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

---

## 推荐配置

**最佳选择**: Railway（免费、简单、支持持久化）

**优点**：
- ✅ 免费套餐充足
- ✅ 自动部署（Git推送即部署）
- ✅ 支持持久化卷
- ✅ 无需配置，开箱即用
- ✅ 提供免费HTTPS
- ✅ 不会休眠（相比Render）

**缺点**：
- ⚠️ 免费额度用完后需付费

---

## 下一步

1. 选择部署平台（推荐Railway）
2. 按照上述步骤部署
3. 配置易支付回调URL
4. 测试所有功能
5. 设置监控和备份

如有问题，请参考各平台的官方文档或联系技术支持。

