# API接口测试文档

## 基础信息

- **部署地址**: https://ze1.vercel.app
- **固定账号**: demo@zepp.com

---

## 1. 用户统计API

### 接口地址
```
GET https://ze1.vercel.app/api/stats/user-simple
```

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 否 | 账号（默认：demo@zepp.com） |

### 请求示例

#### cURL
```bash
curl "https://ze1.vercel.app/api/stats/user-simple?account=demo@zepp.com"
```

#### JavaScript (Fetch)
```javascript
fetch('https://ze1.vercel.app/api/stats/user-simple?account=demo@zepp.com')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Python
```python
import requests

response = requests.get('https://ze1.vercel.app/api/stats/user-simple', 
                       params={'account': 'demo@zepp.com'})
print(response.json())
```

### 响应示例
```json
{
  "success": true,
  "data": {
    "account": "demo@zepp.com",
    "balance": 0,
    "total_calls": 0,
    "success_calls": 0,
    "failed_calls": 0,
    "created_at": "2025-10-18T09:45:47.039Z",
    "updated_at": "2025-10-18T09:45:47.039Z",
    "success_rate": 0
  }
}
```

---

## 2. 每日统计API

### 接口地址
```
GET https://ze1.vercel.app/api/stats/daily-simple
```

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 否 | 账号（默认：demo@zepp.com） |
| days | number | 否 | 统计天数（默认：7） |

### 请求示例

#### cURL
```bash
curl "https://ze1.vercel.app/api/stats/daily-simple?account=demo@zepp.com&days=7"
```

#### JavaScript (Fetch)
```javascript
fetch('https://ze1.vercel.app/api/stats/daily-simple?account=demo@zepp.com&days=7')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Python
```python
import requests

response = requests.get('https://ze1.vercel.app/api/stats/daily-simple', 
                       params={'account': 'demo@zepp.com', 'days': 7})
print(response.json())
```

### 响应示例
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-10-18",
      "total": 5,
      "success": 4,
      "failed": 1
    },
    {
      "date": "2025-10-17",
      "total": 3,
      "success": 3,
      "failed": 0
    }
  ]
}
```

---

## 3. 调用记录API

### 接口地址
```
GET https://ze1.vercel.app/api/stats/logs-simple
```

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 否 | 账号（默认：demo@zepp.com） |
| page | number | 否 | 页码（默认：1） |
| pageSize | number | 否 | 每页数量（默认：20） |

### 请求示例

#### cURL
```bash
curl "https://ze1.vercel.app/api/stats/logs-simple?account=demo@zepp.com&page=1&pageSize=20"
```

#### JavaScript (Fetch)
```javascript
fetch('https://ze1.vercel.app/api/stats/logs-simple?account=demo@zepp.com&page=1&pageSize=20')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Python
```python
import requests

response = requests.get('https://ze1.vercel.app/api/stats/logs-simple', 
                       params={
                           'account': 'demo@zepp.com',
                           'page': 1,
                           'pageSize': 20
                       })
print(response.json())
```

### 响应示例
```json
{
  "success": true,
  "data": {
    "total": 10,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "records": [
      {
        "id": "mgw2xm11rv3v3",
        "account": "demo@zepp.com",
        "api_name": "Zepp Life步数更新",
        "ip": "123.45.67.89",
        "created_at": "2025-10-18T09:32:55.000Z",
        "status": "success",
        "steps": 8888,
        "cost": 0.006,
        "balance_after": 9.994,
        "error_message": null
      }
    ]
  }
}
```

---

## 4. 创建充值订单API

### 接口地址
```
POST https://ze1.vercel.app/api/recharge/create
```

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 是 | 账号 |
| amount | number | 是 | 充值金额（1-10000） |
| type | string | 是 | 支付方式（alipay/wxpay） |

### 请求示例

#### cURL
```bash
curl -X POST "https://ze1.vercel.app/api/recharge/create" \
  -H "Content-Type: application/json" \
  -d '{
    "account": "demo@zepp.com",
    "amount": 10,
    "type": "alipay"
  }'
```

#### JavaScript (Fetch)
```javascript
fetch('https://ze1.vercel.app/api/recharge/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    account: 'demo@zepp.com',
    amount: 10,
    type: 'alipay'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

#### Python
```python
import requests

response = requests.post('https://ze1.vercel.app/api/recharge/create',
                        json={
                            'account': 'demo@zepp.com',
                            'amount': 10,
                            'type': 'alipay'
                        })
print(response.json())
```

### 响应示例
```json
{
  "success": true,
  "data": {
    "order_id": "R1729241234567890",
    "pay_url": "https://912pay.com/submit.php?...",
    "amount": 10
  }
}
```

---

## 5. 带计费的步数更新API

### 接口地址
```
POST https://ze1.vercel.app/api/update-steps-billing
```

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 是 | Zepp Life账号 |
| password | string | 是 | 账号密码 |
| steps | number | 否 | 步数（默认随机） |

### 请求示例

#### cURL
```bash
curl -X POST "https://ze1.vercel.app/api/update-steps-billing" \
  -H "Content-Type: application/json" \
  -d '{
    "account": "ydb1001@qq.com",
    "password": "Aa123456",
    "steps": 8888
  }'
```

#### JavaScript (Fetch)
```javascript
fetch('https://ze1.vercel.app/api/update-steps-billing', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    account: 'ydb1001@qq.com',
    password: 'Aa123456',
    steps: 8888
  })
})
  .then(res => res.text())
  .then(data => console.log(data));
```

#### Python
```python
import requests

response = requests.post('https://ze1.vercel.app/api/update-steps-billing',
                        json={
                            'account': 'ydb1001@qq.com',
                            'password': 'Aa123456',
                            'steps': 8888
                        })
print(response.text)
```

### 响应示例（成功）
```
刷步状态：成功
账号：ydb1001@qq.com
时间：2025/10/18 17:32:55
步数：8888
优先级：1
单价：¥0.006
官网：www.ydb7.com
```

### 响应示例（余额不足）
```
刷步状态：余额不足（当前:¥0.0030），请先充值
账号：ydb1001@qq.com
时间：2025/10/18 17:33:24
步数：0
优先级：1
单价：¥0.006
官网：www.ydb7.com
```

---

## 6. 原步数更新API（无计费）

### 接口地址
```
POST https://ze1.vercel.app/api/update-steps
GET https://ze1.vercel.app/api/update-steps
```

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 是 | Zepp Life账号 |
| password | string | 是 | 账号密码 |
| steps | number | 否 | 步数（默认随机） |

### 请求示例

#### POST方式
```bash
curl -X POST "https://ze1.vercel.app/api/update-steps" \
  -H "Content-Type: application/json" \
  -d '{
    "account": "ydb1001@qq.com",
    "password": "Aa123456",
    "steps": 8888
  }'
```

#### GET方式
```bash
curl "https://ze1.vercel.app/api/update-steps?account=ydb1001@qq.com&password=Aa123456&steps=8888"
```

---

## 完整测试脚本

### Bash脚本
```bash
#!/bin/bash

BASE_URL="https://ze1.vercel.app"
ACCOUNT="demo@zepp.com"

echo "=== 1. 测试用户统计API ==="
curl -s "$BASE_URL/api/stats/user-simple?account=$ACCOUNT" | jq

echo -e "\n=== 2. 测试每日统计API ==="
curl -s "$BASE_URL/api/stats/daily-simple?account=$ACCOUNT&days=7" | jq

echo -e "\n=== 3. 测试调用记录API ==="
curl -s "$BASE_URL/api/stats/logs-simple?account=$ACCOUNT&page=1&pageSize=5" | jq

echo -e "\n=== 4. 测试创建充值订单API ==="
curl -s -X POST "$BASE_URL/api/recharge/create" \
  -H "Content-Type: application/json" \
  -d "{\"account\":\"$ACCOUNT\",\"amount\":10,\"type\":\"alipay\"}" | jq

echo -e "\n测试完成！"
```

### Python脚本
```python
import requests
import json

BASE_URL = "https://ze1.vercel.app"
ACCOUNT = "demo@zepp.com"

def test_api():
    print("=== 1. 测试用户统计API ===")
    res = requests.get(f"{BASE_URL}/api/stats/user-simple", 
                      params={'account': ACCOUNT})
    print(json.dumps(res.json(), indent=2, ensure_ascii=False))
    
    print("\n=== 2. 测试每日统计API ===")
    res = requests.get(f"{BASE_URL}/api/stats/daily-simple", 
                      params={'account': ACCOUNT, 'days': 7})
    print(json.dumps(res.json(), indent=2, ensure_ascii=False))
    
    print("\n=== 3. 测试调用记录API ===")
    res = requests.get(f"{BASE_URL}/api/stats/logs-simple", 
                      params={'account': ACCOUNT, 'page': 1, 'pageSize': 5})
    print(json.dumps(res.json(), indent=2, ensure_ascii=False))
    
    print("\n=== 4. 测试创建充值订单API ===")
    res = requests.post(f"{BASE_URL}/api/recharge/create",
                       json={'account': ACCOUNT, 'amount': 10, 'type': 'alipay'})
    print(json.dumps(res.json(), indent=2, ensure_ascii=False))
    
    print("\n测试完成！")

if __name__ == '__main__':
    test_api()
```

### Node.js脚本
```javascript
const axios = require('axios');

const BASE_URL = 'https://ze1.vercel.app';
const ACCOUNT = 'demo@zepp.com';

async function testAPI() {
  try {
    console.log('=== 1. 测试用户统计API ===');
    let res = await axios.get(`${BASE_URL}/api/stats/user-simple`, {
      params: { account: ACCOUNT }
    });
    console.log(JSON.stringify(res.data, null, 2));
    
    console.log('\n=== 2. 测试每日统计API ===');
    res = await axios.get(`${BASE_URL}/api/stats/daily-simple`, {
      params: { account: ACCOUNT, days: 7 }
    });
    console.log(JSON.stringify(res.data, null, 2));
    
    console.log('\n=== 3. 测试调用记录API ===');
    res = await axios.get(`${BASE_URL}/api/stats/logs-simple`, {
      params: { account: ACCOUNT, page: 1, pageSize: 5 }
    });
    console.log(JSON.stringify(res.data, null, 2));
    
    console.log('\n=== 4. 测试创建充值订单API ===');
    res = await axios.post(`${BASE_URL}/api/recharge/create`, {
      account: ACCOUNT,
      amount: 10,
      type: 'alipay'
    });
    console.log(JSON.stringify(res.data, null, 2));
    
    console.log('\n测试完成！');
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testAPI();
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 405 | 请求方法不允许 |
| 500 | 服务器内部错误 |

---

## 注意事项

1. **数据持久化**：当前版本使用 `/tmp` 目录存储，Vercel冷启动会清空数据
2. **账号固定**：演示版本使用固定账号 `demo@zepp.com`
3. **计费规则**：单次调用 ¥0.006，失败不扣费
4. **请求频率**：建议不要过于频繁调用API

---

## 快速测试命令

```bash
# 测试用户统计
curl "https://ze1.vercel.app/api/stats/user-simple?account=demo@zepp.com"

# 测试每日统计
curl "https://ze1.vercel.app/api/stats/daily-simple?account=demo@zepp.com&days=7"

# 测试调用记录
curl "https://ze1.vercel.app/api/stats/logs-simple?account=demo@zepp.com&page=1&pageSize=5"

# 测试步数更新（需要真实账号）
curl -X POST "https://ze1.vercel.app/api/update-steps-billing" \
  -H "Content-Type: application/json" \
  -d '{"account":"ydb1001@qq.com","password":"Aa123456","steps":8888}'
```

