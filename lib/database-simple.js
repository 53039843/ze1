// 简化版数据库 - 使用JSON文件存储（适用于Vercel）
// 注意：这是演示版本，生产环境建议使用Vercel Postgres或KV

const fs = require('fs');
const path = require('path');

// 数据文件路径（存储在/tmp目录，Vercel支持）
const DATA_DIR = '/tmp';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// 默认账号（固定账号，无需登录）
const DEFAULT_ACCOUNT = 'demo@zepp.com';

// 初始化数据文件
function initDataFiles() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify({}));
    }
    if (!fs.existsSync(LOGS_FILE)) {
      fs.writeFileSync(LOGS_FILE, JSON.stringify([]));
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error('初始化数据文件失败:', error);
  }
}

// 读取数据
function readData(file) {
  try {
    if (!fs.existsSync(file)) {
      return file === LOGS_FILE || file === ORDERS_FILE ? [] : {};
    }
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    return file === LOGS_FILE || file === ORDERS_FILE ? [] : {};
  }
}

// 写入数据
function writeData(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('写入数据失败:', error);
  }
}

// 用户操作
const userOps = {
  // 获取或创建用户
  getOrCreate: (account = DEFAULT_ACCOUNT) => {
    initDataFiles();
    const users = readData(USERS_FILE);
    
    if (!users[account]) {
      users[account] = {
        account,
        balance: 0,
        total_calls: 0,
        success_calls: 0,
        failed_calls: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      writeData(USERS_FILE, users);
    }
    
    return users[account];
  },

  // 更新余额
  updateBalance: (account, amount) => {
    const users = readData(USERS_FILE);
    if (users[account]) {
      users[account].balance += amount;
      users[account].updated_at = new Date().toISOString();
      writeData(USERS_FILE, users);
    }
  },

  // 扣除余额
  deductBalance: (account, cost) => {
    const users = readData(USERS_FILE);
    if (users[account]) {
      users[account].balance -= cost;
      users[account].updated_at = new Date().toISOString();
      writeData(USERS_FILE, users);
    }
  },

  // 增加调用统计
  incrementCalls: (account, success) => {
    const users = readData(USERS_FILE);
    if (users[account]) {
      users[account].total_calls += 1;
      if (success) {
        users[account].success_calls += 1;
      } else {
        users[account].failed_calls += 1;
      }
      users[account].updated_at = new Date().toISOString();
      writeData(USERS_FILE, users);
    }
  },

  // 获取用户统计
  getStats: (account) => {
    const users = readData(USERS_FILE);
    return users[account] || null;
  }
};

// 日志操作
const logOps = {
  // 添加日志
  add: (logData) => {
    const logs = readData(LOGS_FILE);
    logs.unshift({
      ...logData,
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    });
    
    // 只保留最近1000条记录
    if (logs.length > 1000) {
      logs.splice(1000);
    }
    
    writeData(LOGS_FILE, logs);
  },

  // 获取日志列表（分页）
  getList: (account, page = 1, pageSize = 20) => {
    const logs = readData(LOGS_FILE);
    const filtered = logs.filter(log => log.account === account);
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  },

  // 获取总数
  getCount: (account) => {
    const logs = readData(LOGS_FILE);
    return logs.filter(log => log.account === account).length;
  },

  // 获取每日统计
  getDailyStats: (account, days = 7) => {
    const logs = readData(LOGS_FILE);
    const filtered = logs.filter(log => log.account === account);
    
    const stats = {};
    const now = new Date();
    
    filtered.forEach(log => {
      const date = log.created_at.split('T')[0];
      const logDate = new Date(date);
      const diffDays = Math.floor((now - logDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays < days) {
        if (!stats[date]) {
          stats[date] = { date, total: 0, success: 0, failed: 0 };
        }
        stats[date].total += 1;
        if (log.status === 'success') {
          stats[date].success += 1;
        } else {
          stats[date].failed += 1;
        }
      }
    });
    
    return Object.values(stats).sort((a, b) => b.date.localeCompare(a.date));
  }
};

// 订单操作
const orderOps = {
  // 创建订单
  create: (orderData) => {
    const orders = readData(ORDERS_FILE);
    orders.unshift({
      ...orderData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    writeData(ORDERS_FILE, orders);
  },

  // 更新订单状态
  updateStatus: (order_id, status, trade_no = null) => {
    const orders = readData(ORDERS_FILE);
    const order = orders.find(o => o.order_id === order_id);
    if (order) {
      order.status = status;
      order.trade_no = trade_no;
      order.notify_time = new Date().toISOString();
      order.updated_at = new Date().toISOString();
      writeData(ORDERS_FILE, orders);
    }
  },

  // 获取订单
  get: (order_id) => {
    const orders = readData(ORDERS_FILE);
    return orders.find(o => o.order_id === order_id);
  },

  // 获取订单列表
  getList: (account, page = 1, pageSize = 20) => {
    const orders = readData(ORDERS_FILE);
    const filtered = orders.filter(o => o.account === account);
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }
};

module.exports = {
  userOps,
  logOps,
  orderOps,
  DEFAULT_ACCOUNT
};

