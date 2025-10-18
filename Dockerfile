FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装Python和构建工具（better-sqlite3需要）
RUN apk add --no-cache python3 make g++

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install --production=false

# 复制所有文件
COPY . .

# 构建Next.js应用
RUN npm run build

# 创建数据目录
RUN mkdir -p /app/data && chmod 755 /app/data

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["npm", "start"]

