import https from 'https';
import crypto from 'crypto';

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
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json, */*',
      },
      timeout: 30000
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('响应解析失败: ' + data.substring(0, 100))); }
      });
    });
    req.on('error', (e) => reject(e));
    req.on('timeout', () => { req.destroy(); reject(new Error('请求超时')); });
    req.end();
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { account, password, steps } = req.method === 'POST' ? req.body : req.query;
    if (!account || !password) {
      return res.status(400).json({ success: false, message: '账号和密码不能为空' });
    }
    const targetSteps = steps ? parseInt(steps, 10) : Math.floor(Math.random() * 80000) + 10000;
    const token = '6772b1000722a841a5c608fc942dd114';
    const apiUrl = `https://api.yunmge.com/api/zepplifepro?token=${token}&user=${encodeURIComponent(account)}&pass=${encodeURIComponent(password)}&steps=${targetSteps}`;
    const data = await httpsGet(apiUrl);
    if (data && data.code === 200) {
      return res.status(200).json({
        success: true,
        message: `步数修改成功: ${targetSteps}`,
        data: {
          user: account,
          steps: targetSteps,
          update_time: new Date().toLocaleString('zh-CN'),
          api_source: 'api.yunmge.com',
          response_data: data
        }
      });
    } else {
      return res.status(200).json({ success: false, message: data?.msg || '刷步失败，请检查账号密码' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: '服务异常: ' + error.message });
  }
}
