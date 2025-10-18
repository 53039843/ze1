const Database = require('better-sqlite3');
const path = require('path');

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'data', 'stats.db');

// 确保数据目录存在
const fs = require('fs');
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(dbPath);

// 初始化数据库表
function initDatabase() {
  // 创建用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account TEXT UNIQUE NOT NULL,
      balance REAL DEFAULT 0,
      total_calls INTEGER DEFAULT 0,
      success_calls INTEGER DEFAULT 0,
      failed_calls INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建API调用日志表
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL,
      account TEXT NOT NULL,
      ip TEXT NOT NULL,
      api_name TEXT NOT NULL,
      steps INTEGER,
      status TEXT NOT NULL,
      error_message TEXT,
      cost REAL DEFAULT 0,
      balance_after REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_api_logs_account ON api_logs(account);
    CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_logs(status);
  `);

  // 创建充值订单表
  db.exec(`
    CREATE TABLE IF NOT EXISTS recharge_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      account TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_type TEXT,
      trade_no TEXT,
      notify_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_recharge_orders_account ON recharge_orders(account);
    CREATE INDEX IF NOT EXISTS idx_recharge_orders_order_id ON recharge_orders(order_id);
  `);

  console.log('数据库初始化完成');
}

// 初始化数据库
initDatabase();

// 用户相关操作
const userOps = {
  // 获取或创建用户
  getOrCreate: (account) => {
    const stmt = db.prepare('SELECT * FROM users WHERE account = ?');
    let user = stmt.get(account);
    
    if (!user) {
      const insert = db.prepare('INSERT INTO users (account, balance) VALUES (?, 0)');
      insert.run(account);
      user = stmt.get(account);
    }
    
    return user;
  },

  // 更新余额
  updateBalance: (account, amount) => {
    const stmt = db.prepare('UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE account = ?');
    return stmt.run(amount, account);
  },

  // 扣除余额（用于API调用）
  deductBalance: (account, cost) => {
    const stmt = db.prepare('UPDATE users SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE account = ?');
    return stmt.run(cost, account);
  },

  // 增加调用统计
  incrementCalls: (account, success) => {
    const field = success ? 'success_calls' : 'failed_calls';
    const stmt = db.prepare(`UPDATE users SET total_calls = total_calls + 1, ${field} = ${field} + 1, updated_at = CURRENT_TIMESTAMP WHERE account = ?`);
    return stmt.run(account);
  },

  // 获取用户统计信息
  getStats: (account) => {
    const stmt = db.prepare('SELECT * FROM users WHERE account = ?');
    return stmt.get(account);
  }
};

// API日志相关操作
const logOps = {
  // 添加API调用日志
  add: (logData) => {
    const stmt = db.prepare(`
      INSERT INTO api_logs (request_id, account, ip, api_name, steps, status, error_message, cost, balance_after)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      logData.request_id,
      logData.account,
      logData.ip,
      logData.api_name,
      logData.steps,
      logData.status,
      logData.error_message,
      logData.cost,
      logData.balance_after
    );
  },

  // 获取API调用记录（分页）
  getList: (account, page = 1, pageSize = 20) => {
    const offset = (page - 1) * pageSize;
    const stmt = db.prepare(`
      SELECT * FROM api_logs 
      WHERE account = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(account, pageSize, offset);
  },

  // 获取总记录数
  getCount: (account) => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM api_logs WHERE account = ?');
    return stmt.get(account).count;
  },

  // 获取按日期统计的数据
  getDailyStats: (account, days = 7) => {
    const stmt = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM api_logs
      WHERE account = ? AND created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    return stmt.all(account, days);
  }
};

// 充值订单相关操作
const orderOps = {
  // 创建订单
  create: (orderData) => {
    const stmt = db.prepare(`
      INSERT INTO recharge_orders (order_id, account, amount, payment_type)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(orderData.order_id, orderData.account, orderData.amount, orderData.payment_type);
  },

  // 更新订单状态
  updateStatus: (order_id, status, trade_no = null) => {
    const stmt = db.prepare(`
      UPDATE recharge_orders 
      SET status = ?, trade_no = ?, notify_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE order_id = ?
    `);
    return stmt.run(status, trade_no, order_id);
  },

  // 获取订单信息
  get: (order_id) => {
    const stmt = db.prepare('SELECT * FROM recharge_orders WHERE order_id = ?');
    return stmt.get(order_id);
  },

  // 获取用户订单列表
  getList: (account, page = 1, pageSize = 20) => {
    const offset = (page - 1) * pageSize;
    const stmt = db.prepare(`
      SELECT * FROM recharge_orders 
      WHERE account = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(account, pageSize, offset);
  }
};

module.exports = {
  db,
  userOps,
  logOps,
  orderOps
};

