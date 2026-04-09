/**
 * Vercel Cron Job - ZeppLife 自动刷步
 * 每天北京时间 09:00 (UTC 01:00) 自动执行
 *
 * 执行逻辑：
 * 1. 首先尝试主接口 api.mmp.cc
 * 2. 主接口失败则切换备用接口 ze1.vercel.app/api/mmp-steps
 * 3. 成功判断：code=200 / status=success / 包含"成功"
 */

import http from 'http';
import https from 'https';

// 刷步配置
const CONFIG = {
  account: '53039843@qq.com',
  password: '666888zyy',
  steps: 23456,
};

/**
 * 通用 HTTP/HTTPS GET 请求
 */
function httpGet(url, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ ok: true, statusCode: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ ok: true, statusCode: res.statusCode, body: null, raw: data });
        }
      });
    });
    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: '请求超时' });
    });
  });
}

/**
 * 判断响应是否成功
 */
function isSuccess(result) {
  if (!result.ok) return false;
  const body = result.body;
  const raw = result.raw || '';
  if (!body && !raw) return false;

  // 检查 JSON body
  if (body) {
    if (body.code === 200 || body.code === '200' || body.code === 0) return true;
    if (body.status === 'success' || body.status === 'ok' || body.status === 200) return true;
    if (body.msg && (String(body.msg).includes('成功') || body.msg === 'ok' || body.msg === 'success')) return true;
    if (body.message && String(body.message).includes('成功')) return true;
    if (body.success === true) return true;
  }

  // 检查原始文本
  const text = raw || JSON.stringify(body || '');
  if (text.includes('成功') || text.includes('"code":200') || text.includes('"code": 200')) return true;
  if (text.includes('"status":"success"') || text.includes('"status": "success"')) return true;

  return false;
}

export default async function handler(req, res) {
  // 验证 Cron 请求（Vercel 会在请求头中加入 Authorization）
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
    // 仅在设置了 CRON_SECRET 时才验证
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const startTime = Date.now();
  const bjTime = new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');

  console.log(`[Cron] ===== ZeppLife 自动刷步开始 =====`);
  console.log(`[Cron] 北京时间: ${bjTime}`);
  console.log(`[Cron] 账号: ${CONFIG.account}, 步数: ${CONFIG.steps}`);

  const logs = [];
  let finalStatus = 'failed';
  let usedApi = '';

  // ===== 步骤 1：尝试主接口 api.mmp.cc =====
  const primaryUrl = `http://api.mmp.cc/api/ZeppLife?user=${encodeURIComponent(CONFIG.account)}&pass=${encodeURIComponent(CONFIG.password)}&count=${CONFIG.steps}`;
  console.log(`[Cron] 尝试主接口: api.mmp.cc`);
  logs.push({ step: 1, api: 'api.mmp.cc', url: 'http://api.mmp.cc/api/ZeppLife' });

  const primaryResult = await httpGet(primaryUrl, 20000);
  console.log(`[Cron] 主接口响应:`, JSON.stringify(primaryResult).substring(0, 200));
  logs[0].response = primaryResult.body || primaryResult.raw || primaryResult.error;

  if (isSuccess(primaryResult)) {
    finalStatus = 'success';
    usedApi = 'api.mmp.cc (主接口)';
    logs[0].success = true;
    console.log(`[Cron] ✅ 主接口刷步成功`);
  } else {
    logs[0].success = false;
    console.log(`[Cron] ❌ 主接口失败，切换备用接口`);

    // ===== 步骤 2：切换备用接口 ze1.vercel.app =====
    const fallbackUrl = `https://ze1.vercel.app/api/mmp-steps?account=${encodeURIComponent(CONFIG.account)}&password=${encodeURIComponent(CONFIG.password)}&steps=${CONFIG.steps}`;
    console.log(`[Cron] 尝试备用接口: ze1.vercel.app`);
    logs.push({ step: 2, api: 'ze1.vercel.app/api/mmp-steps', url: 'https://ze1.vercel.app/api/mmp-steps' });

    const fallbackResult = await httpGet(fallbackUrl, 30000);
    console.log(`[Cron] 备用接口响应:`, JSON.stringify(fallbackResult).substring(0, 200));
    logs[1].response = fallbackResult.body || fallbackResult.raw || fallbackResult.error;

    if (isSuccess(fallbackResult)) {
      finalStatus = 'success';
      usedApi = 'ze1.vercel.app (备用接口)';
      logs[1].success = true;
      console.log(`[Cron] ✅ 备用接口刷步成功`);
    } else {
      logs[1].success = false;
      console.log(`[Cron] ❌ 备用接口也失败`);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`[Cron] ===== 执行完毕，耗时 ${duration}ms，状态: ${finalStatus} =====`);

  return res.status(finalStatus === 'success' ? 200 : 500).json({
    status: finalStatus,
    message: finalStatus === 'success' ? `刷步成功，使用 ${usedApi}` : '主接口和备用接口均失败',
    account: CONFIG.account,
    steps: CONFIG.steps,
    bjTime,
    duration: `${duration}ms`,
    logs,
  });
}
