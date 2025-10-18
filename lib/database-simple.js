import { createClient } from '@vercel/kv';
const fs = require('fs');
const path = require('path');

// Vercel KV client
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const DATA_DIR = '/tmp';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const DEFAULT_ACCOUNT = 'demo@zepp.com';

function initDataFiles() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify({}));
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
    }
  } catch (error) {
    console.error('初始化数据文件失败:', error);
  }
}

function readData(file) {
  try {
    if (!fs.existsSync(file)) {
      return file === ORDERS_FILE ? [] : {};
    }
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    return file === ORDERS_FILE ? [] : {};
  }
}

function writeData(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('写入数据失败:', error);
  }
}

const userOps = {
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
  updateBalance: (account, amount) => {
    const users = readData(USERS_FILE);
    if (users[account]) {
      users[account].balance += amount;
      users[account].updated_at = new Date().toISOString();
      writeData(USERS_FILE, users);
    }
  },
  deductBalance: (account, cost) => {
    const users = readData(USERS_FILE);
    if (users[account]) {
      users[account].balance -= cost;
      users[account].updated_at = new Date().toISOString();
      writeData(USERS_FILE, users);
    }
  },
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
  getStats: (account) => {
    const users = readData(USERS_FILE);
    return users[account] || null;
  }
};

const KV_LOGS_KEY = 'api_logs';

const logOps = {
  add: async (logData) => {
    const newLog = {
      ...logData,
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    await kv.lpush(KV_LOGS_KEY, newLog);
    await kv.ltrim(KV_LOGS_KEY, 0, 999);
  },
  getList: async (account, page = 1, pageSize = 20) => {
    const start = (page - 1) * pageSize;
    const allLogs = await kv.lrange(KV_LOGS_KEY, 0, -1);
    const filtered = allLogs.filter(log => log.account === account);
    return filtered.slice(start, start + pageSize);
  },
  getCount: async (account) => {
    const allLogs = await kv.lrange(KV_LOGS_KEY, 0, -1);
    return allLogs.filter(log => log.account === account).length;
  },
  getDailyStats: async (account, days = 7) => {
    const allLogs = await kv.lrange(KV_LOGS_KEY, 0, -1);
    const filtered = allLogs.filter(log => log.account === account);
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

const orderOps = {
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
  get: (order_id) => {
    const orders = readData(ORDERS_FILE);
    return orders.find(o => o.order_id === order_id);
  },
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
