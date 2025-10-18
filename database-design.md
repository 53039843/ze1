# 数据库设计文档

## 数据库表结构

### 1. users 表 - 用户信息表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account TEXT UNIQUE NOT NULL,           -- 用户账号（唯一）
  balance REAL DEFAULT 0,                 -- 余额（元）
  total_calls INTEGER DEFAULT 0,          -- 总调用次数
  success_calls INTEGER DEFAULT 0,        -- 成功调用次数
  failed_calls INTEGER DEFAULT 0,         -- 失败调用次数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. api_logs 表 - API调用日志表
```sql
CREATE TABLE api_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL,               -- 请求ID
  account TEXT NOT NULL,                  -- 调用账号
  ip TEXT NOT NULL,                       -- 调用IP
  api_name TEXT NOT NULL,                 -- API名称
  steps INTEGER,                          -- 步数
  status TEXT NOT NULL,                   -- 状态：success/failed
  error_message TEXT,                     -- 错误信息
  cost REAL DEFAULT 0,                    -- 本次调用费用
  balance_after REAL,                     -- 调用后余额
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_logs_account ON api_logs(account);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX idx_api_logs_status ON api_logs(status);
```

### 3. recharge_orders 表 - 充值订单表
```sql
CREATE TABLE recharge_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT UNIQUE NOT NULL,          -- 订单号
  account TEXT NOT NULL,                  -- 充值账号
  amount REAL NOT NULL,                   -- 充值金额
  status TEXT DEFAULT 'pending',          -- 订单状态：pending/success/failed
  payment_type TEXT,                      -- 支付方式：alipay/wxpay
  trade_no TEXT,                          -- 易支付交易号
  notify_time DATETIME,                   -- 通知时间
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recharge_orders_account ON recharge_orders(account);
CREATE INDEX idx_recharge_orders_order_id ON recharge_orders(order_id);
```

## API接口设计

### 1. 获取用户统计信息
- **接口**: `GET /api/stats/user?account={account}`
- **返回**:
```json
{
  "success": true,
  "data": {
    "account": "user@example.com",
    "balance": 10.50,
    "total_calls": 1500,
    "success_calls": 1450,
    "failed_calls": 50,
    "success_rate": 96.67
  }
}
```

### 2. 获取API调用统计（按日期）
- **接口**: `GET /api/stats/daily?account={account}&days={days}`
- **返回**:
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-10-18",
      "total": 120,
      "success": 115,
      "failed": 5
    }
  ]
}
```

### 3. 获取API调用记录
- **接口**: `GET /api/stats/logs?account={account}&page={page}&pageSize={pageSize}`
- **返回**:
```json
{
  "success": true,
  "data": {
    "total": 1500,
    "page": 1,
    "pageSize": 20,
    "records": [
      {
        "id": "68f3471935870b39f2e64ce5",
        "api_name": "Zepp Life步数更新",
        "ip": "154.219.115.242",
        "created_at": "2025-10-18 15:51:53",
        "status": "success",
        "steps": 8000,
        "cost": 0.006
      }
    ]
  }
}
```

### 4. 创建充值订单
- **接口**: `POST /api/recharge/create`
- **参数**:
```json
{
  "account": "user@example.com",
  "amount": 10
}
```
- **返回**:
```json
{
  "success": true,
  "data": {
    "order_id": "R20251018155300001",
    "pay_url": "https://912pay.com/submit.php?..."
  }
}
```

### 5. 充值回调接口
- **接口**: `POST /api/recharge/notify`
- **说明**: 易支付异步通知接口

### 6. 查询充值订单状态
- **接口**: `GET /api/recharge/status?order_id={order_id}`
- **返回**:
```json
{
  "success": true,
  "data": {
    "order_id": "R20251018155300001",
    "status": "success",
    "amount": 10
  }
}
```

## 计费规则

- **单次调用费用**: 0.006元
- **扣费规则**: 仅成功调用扣费，失败不扣费
- **余额不足**: 返回错误提示，不执行API调用

