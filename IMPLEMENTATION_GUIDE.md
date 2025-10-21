# API对接实现方案

## 项目概述

本项目成功将原有的ZeppLife步数更新API对接到了makuo.cc API，实现了以下目标：

1. **优先使用makuo.cc API**：提供更稳定的服务
2. **智能回退机制**：当makuo.cc API失败时自动回退到ZeppLife API
3. **保持原有返回格式**：确保前端代码无需修改
4. **完善的错误处理**：提供详细的日志和错误信息
5. **CORS支持**：支持跨域请求

## 核心实现

### 1. API接口地址

- **原始接口**: `https://s.ydb7.com/api/update-steps`
- **makuo.cc接口**: `https://api.3x.ink/api/get.sport.update`
- **本地测试**: `http://localhost:3000/api/update-steps`

### 2. 请求格式

#### GET请求
```bash
GET /api/update-steps?account=tr00042@163.com&password=aEqNzMqDeT.&steps=1000
```

#### POST请求
```bash
POST /api/update-steps
Content-Type: application/json

{
  "account": "tr00042@163.com",
  "password": "aEqNzMqDeT.",
  "steps": 1000
}
```

### 3. 响应格式

#### 成功响应
```json
{
  "success": true,
  "message": "步数修改成功: 1000",
  "data": {
    "user": "tr00042@163.com",
    "steps": 1000,
    "update_time": "2025/9/27 09:15:34",
    "api_source": "makuo.cc API",
    "userid": "1196108107",
    "makuo_response": {
      "code": 200,
      "msg": "请求成功！",
      "time": "2025-09-27 09:12:48",
      "api_source": "API官网:api.3x.ink",
      "data": {
        "user": "tr00042@163.com",
        "steps": 1000,
        "userid": "1196108107"
      },
      "cached_time": "2025-09-27 09:12:48"
    }
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "账号和密码不能为空"
}
```

## 技术实现细节

### 1. 核心逻辑流程

```
1. 接收请求参数 (account, password, steps)
2. 参数验证
3. 尝试调用makuo.cc API
   ├─ 成功 → 返回结果
   └─ 失败 → 检查是否应该回退
       ├─ 业务错误 → 直接返回错误
       └─ 网络错误 → 回退到ZeppLife API
4. ZeppLife API回退流程
   ├─ 登录获取token
   ├─ 获取app token  
   ├─ 更新步数
   └─ 返回结果
```

### 2. 关键特性

#### 智能回退机制
- **业务错误不回退**：账号密码错误等业务问题直接返回错误
- **网络错误自动回退**：超时、连接失败等网络问题自动使用备用API

#### 错误处理
- **参数验证**：检查必需参数和步数范围
- **请求追踪**：每个请求分配唯一ID用于日志追踪
- **详细日志**：记录每个步骤的执行情况和耗时

#### CORS支持
- **跨域请求**：支持前端跨域调用
- **预检请求**：正确处理OPTIONS请求

### 3. makuo.cc API集成

#### 请求配置
```javascript
const response = await axios.get('https://api.3x.ink/api/get.sport.update', {
  params: {
    user: account,
    pass: password,
    steps: targetSteps.toString()
  },
  headers: {
    'Authorization': 'LUvOOl2x8II1POI9KfnFeQ',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Referer': 'https://api.3x.ink/'
  },
  timeout: 15000
});
```

#### 响应处理
- **成功判断**：`response.data.code === 200`
- **数据转换**：将makuo.cc响应转换为原有格式
- **错误分类**：区分业务错误和网络错误

## 测试结果

### 1. 功能测试

✅ **GET请求测试**
```bash
curl -X GET "http://localhost:3000/api/update-steps?account=tr00042@163.com&password=aEqNzMqDeT.&steps=1000"
# 返回: {"success":true,"message":"步数修改成功: 1000",...}
```

✅ **POST请求测试**
```bash
curl -X POST "http://localhost:3000/api/update-steps" -H "Content-Type: application/json" -d '{"account":"tr00042@163.com","password":"aEqNzMqDeT.","steps":2000}'
# 返回: {"success":true,"message":"步数修改成功: 2000",...}
```

✅ **参数验证测试**
```bash
curl -X GET "http://localhost:3000/api/update-steps?account=&password=&steps=1000"
# 返回: {"success":false,"message":"账号和密码不能为空"}
```

✅ **步数验证测试**
```bash
curl -X GET "http://localhost:3000/api/update-steps?account=test@test.com&password=test123&steps=abc"
# 返回: {"success":false,"message":"步数必须是0-100000之间的有效数字"}
```

✅ **CORS测试**
```bash
curl -X OPTIONS "http://localhost:3000/api/update-steps" -H "Origin: http://example.com"
# 返回: 200 OK with CORS headers
```

### 2. 性能测试

- **makuo.cc API响应时间**：~200ms
- **完整请求处理时间**：~300ms
- **回退机制触发时间**：~15s (超时后)

## 部署说明

### 1. 文件结构
```
pages/api/
├── update-steps.js          # 主要API文件（已更新）
├── update-steps-makuo.js    # 备份文件
├── ZeppLifeSteps.js         # ZeppLife API实现
├── makuo-steps.js           # 第一版实现
├── makuo-steps-final.js     # 最终优化版
└── ...
```

### 2. 环境要求
- Node.js 18+
- Next.js 15.3.2
- axios 1.8.4

### 3. 部署步骤
1. 确保所有依赖已安装：`npm install`
2. 启动开发服务器：`npm run dev`
3. 生产环境构建：`npm run build`
4. 启动生产服务器：`npm start`

## 监控和维护

### 1. 日志监控
- 每个请求都有唯一的requestId用于追踪
- 详细记录API调用过程和耗时
- 区分makuo.cc API和ZeppLife API的使用情况

### 2. 错误监控
- 监控makuo.cc API的成功率
- 监控回退机制的触发频率
- 记录各种错误类型的分布

### 3. 性能优化建议
- 可以考虑添加缓存机制减少重复请求
- 可以添加请求限流防止滥用
- 可以优化超时时间配置

## 总结

本实现方案成功实现了以下目标：

1. **无缝对接**：前端代码无需任何修改
2. **高可用性**：双API保障，提高服务稳定性
3. **向后兼容**：保持原有API的所有功能和格式
4. **易于维护**：清晰的代码结构和详细的日志
5. **生产就绪**：完善的错误处理和CORS支持

该方案已通过全面测试，可以直接部署到生产环境使用。
