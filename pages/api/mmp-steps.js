// MMP Steps API - 接入 api.mmp.cc 刷步接口
// 接口文档: GET http://api.mmp.cc/api/ZeppLife?user=账号&pass=密码&count=步数
// 注意: 使用 HTTP 协议（CDN 会重定向到 HTTPS，但直接 HTTPS 可能 404）

import http from 'http';
import https from 'https';
import crypto from 'crypto';

/**
 * 封装 HTTP/HTTPS GET 请求为 Promise，支持重定向
 */
function httpGet(url, maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.128 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cache-Control': 'no-cache'
      },
      timeout: 30000
    };

    if (isHttps) {
      options.secureOptions = crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT;
      options.ciphers = 'DEFAULT:@SECLEVEL=0';
      options.minVersion = 'TLSv1';
    }

    const req = lib.request(options, (res) => {
      // 处理重定向
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
        const redirectUrl = res.headers.location.startsWith('http') ? res.headers.location : `${urlObj.protocol}//${urlObj.host}${res.headers.location}`;
        console.log(`[MMP] 重定向 ${res.statusCode} -> ${redirectUrl}`);
        resolve(httpGet(redirectUrl, maxRedirects - 1));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[MMP] 原始响应(HTTP ${res.statusCode}): "${data.substring(0, 300)}"`);
        if (!data || data.trim() === '') {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ code: 200, msg: 'ok', raw: '' });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: 空响应`));
          }
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data, statusCode: res.statusCode });
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
  // 使用 HTTP 协议（避免 HTTPS 的 CDN 封锁问题）
  const apiUrl = `http://api.mmp.cc/api/ZeppLife?user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}&count=${count}`;
  console.log(`[MMP] 调用接口: http://api.mmp.cc/api/ZeppLife?user=${user}&pass=***&count=${count}`);
  const result = await httpGet(apiUrl);
  console.log(`[MMP] 接口响应:`, JSON.stringify(result).substring(0, 200));
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
    const rawText = apiResult.raw || '';
    const isSuccess =
      (apiResult.code !== undefined && (apiResult.code === 200 || apiResult.code === '200' || apiResult.code === 0)) ||
      (apiResult.status !== undefined && (apiResult.status === 200 || apiResult.status === 'success' || apiResult.status === 'ok')) ||
      (apiResult.msg !== undefined && (apiResult.msg === 'ok' || apiResult.msg === 'success' || String(apiResult.msg).includes('成功'))) ||
      (rawText.includes('成功') || rawText.includes('success') || rawText.includes('"code":200') || rawText.includes('"code": 200'));

    if (isSuccess) {
      console.log(`[${requestId}] 刷步成功，耗时: ${duration}ms`);
      return res.status(200).json(createResponse(200, '刷步成功', account, targetSteps));
    } else {
      const errMsg = apiResult.msg || apiResult.message || rawText.substring(0, 100) || JSON.stringify(apiResult).substring(0, 100);
      console.log(`[${requestId}] 刷步失败: ${errMsg}，耗时: ${duration}ms`);
      return res.status(500).json(createResponse(500, `刷步失败: ${errMsg}`, account, 0));
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] 请求处理异常，耗时: ${duration}ms`, error.message);
    return res.status(500).json(createResponse(500, `服务器错误: ${error.message}`, '', 0));
  }
}
