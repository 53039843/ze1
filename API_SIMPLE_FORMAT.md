# API简洁格式修改说明

## 修改目标

将GitHub项目的API接口返回信息强制转为简洁格式，只返回：**账号、时间、成功状态、步数**

官网：www.ydb7.com

## 修改内容

### 原有复杂格式
```json
{
  "success": true,
  "message": "步数修改成功: 75383",
  "data": {
    "user": "tr00042@163.com",
    "steps": 75383,
    "update_time": "2025/9/27 09:41:23",
    "api_source": "makuo.cc API",
    "userid": "1196198107",
    "makuo_response": {"code": 200, "msg": "请求成功"},
    "time": "2025-09-27 09:41:23",
    "api_source": "API官网:api.3x.ink",
    "data": {"user": "tr00042@163.com", "steps": 75383, "userid": "1196198107"},
    "cached_time": "2025-09-27 09:41:23"
  }
}
```

### 新的纯文本格式（一行一个值）
```
刷步状态：成功
账号：tr00042@163.com
时间：2025/09/27 10:27:23
步数：75383
官网：www.ydb7.com
```

## 格式对比

- **原有格式**: JSON复杂嵌套，12个字段
- **新格式**: 纯文本，5行信息  
- **简化程度**: 58%，且更易读

## 修改的文件

1. **pages/api/update-steps.js** - 主要API接口文件
   - 修改所有返回格式为简洁格式
   - 保持原有功能逻辑不变
   - 支持GET和POST请求方式

2. **pages/api/update-steps-simple.js** - 新增的简洁格式专用接口
   - 完全按照简洁格式设计
   - 作为备用接口

## 接口使用方式

### GET请求
```
https://s.ydb7.com/api/update-steps?account=tr00042@163.com&password=aEqNzMqDeT.&steps=75383
```

### POST请求
```json
POST /api/update-steps
Content-Type: application/json

{
  "account": "tr00042@163.com",
  "password": "aEqNzMqDeT.",
  "steps": 75383
}
```

## 返回字段说明

| 字段名 | 格式 | 说明 |
|-------|-----|------|
| 刷步状态 | 刷步状态：成功/失败 | 操作结果 |
| 账号 | 账号：用户邮箱 | 用户账号 |
| 时间 | 时间：YYYY/MM/DD HH:mm:ss | 操作时间（中国时区） |
| 步数 | 步数：数字 | 设置的步数 |
| 官网 | 官网：www.ydb7.com | 官网地址 |

## 错误处理

失败时也返回相同的纯文本格式，步数为0：

```
刷步状态：失败
账号：tr00042@163.com
时间：2025/09/27 10:27:23
步数：0
官网：www.ydb7.com
```

## 兼容性

- 保持与原有API接口地址完全兼容
- 支持原有的所有请求方式
- 只是简化了返回数据格式
- 官网：www.ydb7.com
