// MMP Steps API - 接入 api.mmp.cc 刷步接口
// 接口文档: GET https://api.mmp.cc/api/ZeppLife?user=账号&pass=密码&count=步数

import https from 'https';
import crypto from 'crypto';

/**
 * 封装 HTTPS GET 请求为 Promise
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      rejectUnauthorized: false,
      secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
      ciphers: 'DEFAULT:@SECLEVEL=0',
      minVersion: 'TLSv1',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cache-Control': 'no-cache'
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          // 如果不是 JSON，直接返回原始文本
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    req.end();
  });
}

/**
 * 调用 api.mmp.cc ZeppLife 刷步接口
 * @param {string} user - 账号（邮箱或手机号）
 * @param {string} pass - 密码
 * @param {number} count - 步数
 * @returns {Promise<object>} API 响应结果
 */
async function callMmpApi(user, pass, count) {
  const apiUrl = `https://api.mmp.cc/api/ZeppLife?user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}&count=${count}`;
  console.log(`[MMP] 调用接口: https://api.mmp.cc/api/ZeppLife?user=${user}&pass=***&count=${count}`);
  const result = await httpsGet(apiUrl);
  console.log(`[MMP] 接口响应:`, result);
  return result;
}

/**
 * 创建标准 JSON 响应格式
 */
function createResponse(code, msg, account, steps) {
  const currentTime = new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');

  return {
    code,
    msg,
    time: currentTime,
    api_source: 'api.mmp.cc',
    data: {
      user: account,
      steps,
      update_time: currentTime
    }
  };
}

function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * MMP Steps API 处理器
 * 支持 GET / POST 请求
 * 参数: account(账号), password(密码), steps(步数，可选，默认随机)
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json(createResponse(405, '方法不允许', '', 0));
  }

  const startTime = Date.now();
  const requestId = generateRequestId();
  console.log(`[${requestId}] MMP Steps API - 开始处理 ${req.method} 请求`);

  try {
    // 提取参数（兼容 GET 和 POST）
    const params = req.method === 'POST' ? req.body : req.query;
    const { account, password, steps } = params;

    // 参数校验
    if (!account || !password) {
      console.log(`[${requestId}] 参数缺失: 账号或密码为空`);
      return res.status(400).json(createResponse(400, '账号和密码不能为空', account || '', 0));
    }

    // 处理步数
    let targetSteps;
    if (steps) {
      targetSteps = parseInt(steps, 10);
      if (isNaN(targetSteps) || targetSteps < 0 || targetSteps > 999999) {
        console.log(`[${requestId}] 步数参数无效: ${steps}`);
        return res.status(400).json(createResponse(400, '步数参数无效（范围: 0-999999）', account, 0));
      }
    } else {
      // 默认随机步数 10000~30000
      targetSteps = Math.floor(Math.random() * 20000) + 10000;
    }

    console.log(`[${requestId}] 参数: 账号=${account}, 步数=${targetSteps}`);

    // 调用 api.mmp.cc 接口
    const apiResult = await callMmpApi(account, password, targetSteps);

    const duration = Date.now() - startTime;

    // 判断是否成功（兼容多种响应格式）
    const isSuccess =
      (apiResult.code !== undefined && (apiResult.code === 200 || apiResult.code === '200' || apiResult.code === 0)) ||
      (apiResult.status !== undefined && (apiResult.status === 200 || apiResult.status === 'success' || apiResult.status === 'ok')) ||
      (apiResult.msg !== undefined && (apiResult.msg === 'ok' || apiResult.msg === 'success' || String(apiResult.msg).includes('成功'))) ||
      (apiResult.raw !== undefined && (apiResult.raw.includes('成功') || apiResult.raw.includes('success')));

    if (isSuccess) {
      console.log(`[${requestId}] 刷步成功，耗时: ${duration}ms`);
      return res.status(200).json(createResponse(200, '刷步成功', account, targetSteps));
    } else {
      const errMsg = apiResult.msg || apiResult.message || apiResult.raw || JSON.stringify(apiResult);
      console.log(`[${requestId}] 刷步失败: ${errMsg}，耗时: ${duration}ms`);
      return res.status(500).json(createResponse(500, `刷步失败: ${errMsg}`, account, 0));
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] 请求处理异常，耗时: ${duration}ms`, error.message);
    return res.status(500).json(createResponse(500, `服务器错误: ${error.message}`, '', 0));
  }
}
