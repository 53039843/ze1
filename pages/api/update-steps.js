// 标准格式API接口:返回美观的一行一个值格式
// 官网:api.ydb7.com
// 统一使用 api.yunmge.com API
import https from 'https';
import crypto from 'crypto';
const { logOps, userOps } = require("../../lib/database-simple");

// 封装 https 请求为 Promise
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
          reject(new Error('响应解析失败: ' + data.substring(0, 100)));
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
 * 标准格式的步数更新API处理器
 * 返回格式:一行一个值,美观易读
 */
export default async function handler(req, res) {
  // 设置CORS头部和Content-Type
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只支持POST和GET请求
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json(createStandardResponse(500, '方法不允许', '', 0));
  }

  const startTime = Date.now();
  const requestId = generateRequestId();
  // 统一处理优先级，避免后续变量冲突
  console.log(`[${requestId}] 开始处理${req.method}请求`);

  try {
    // 提取请求参数
    const { account, password, steps } = req.method === 'POST' ? req.body : req.query;
    const priority = req.method === 'POST' ? req.body?.priority : req.query?.priority;

    // 设置最终优先级,默认为1
    const finalRequestPriority = priority || 1;
    console.log(`[${requestId}] 请求优先级: ${finalRequestPriority}`);

    // 参数验证
    if (!account || !password) {
      console.log(`[${requestId}] 参数验证失败: 缺少账号或密码`);
      return res.status(400).json(createStandardResponse(500, '账号和密码不能为空', account || '', 0));
    }

    // 处理步数参数
    let targetSteps;
    if (steps) {
      targetSteps = parseInt(steps, 10);
      if (isNaN(targetSteps) || targetSteps < 0) {
        console.log(`[${requestId}] 步数参数无效: ${steps}`);
        return res.status(400).json(createStandardResponse(500, '步数参数无效', account, 0));
      }
    } else {
      // 生成合理范围内的随机步数
      targetSteps = Math.floor(Math.random() * 100000) + 10000;
    }

    console.log(`[${requestId}] 处理参数: 账号=${account}, 目标步数=${targetSteps}`);

    // 调用 api.yunmge.com API
    const token = '6772b1000722a841a5c608fc942dd114';
    const apiUrl = `https://api.yunmge.com/api/zepplifepro?token=${token}&user=${encodeURIComponent(account)}&pass=${encodeURIComponent(password)}&steps=${targetSteps}`;
    
    try {
      console.log(`[${requestId}] 调用 api.yunmge.com API...`);
      
      const responseData = await httpsGet(apiUrl);
      
      console.log(`[${requestId}] api.yunmge.com API 响应:`, responseData);
      
      const xiaotuoResult = {
        success: responseData && responseData.code === 200,
        message: responseData?.msg || '未知错误',
        shouldNotFallback: false
      };
      
      if (xiaotuoResult.success) {
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] api.yunmge.com API调用成功,耗时: ${duration}ms`);
        
        // 返回标准格式
        try {
          await logOps.add({
            account,
            api_name: 'update-steps',
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            status: 'success',
            steps: targetSteps,
            cost: 0.006,
            balance_after: userOps.getStats(account)?.balance
          });
        } catch (dbError) {
          console.log(`[${requestId}] 数据库记录失败:`, dbError.message);
        }
        return res.status(200).json(createStandardResponse(200, '刷步成功', account, targetSteps));
      }

      // api.yunmge.com API失败
      console.log(`[${requestId}] api.yunmge.com API失败: ${xiaotuoResult.message}`);
      
      // 如果是明确的业务错误(如账号密码错误),不进行回退
      if (xiaotuoResult.shouldNotFallback) {
        console.log(`[${requestId}] 不进行回退,直接返回错误`);
        try {
          await logOps.add({
            account,
            api_name: 'update-steps',
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            status: 'failed',
            steps: targetSteps,
            cost: 0,
            balance_after: userOps.getStats(account)?.balance
          });
        } catch (dbError) {
          console.log(`[${requestId}] 数据库记录失败:`, dbError.message);
        }
        return res.status(500).json(createStandardResponse(500, `刷步失败: ${xiaotuoResult.message} | ${JSON.stringify(responseData)}`, account, 0));
      }

    } catch (apiError) {
      console.log(`[${requestId}] api.yunmge.com API异常: ${apiError.message}`);
      return res.status(500).json(createStandardResponse(500, `刷步失败: ${apiError.message}`, account, 0));
    }

    // API调用失败,返回错误
    console.log(`[${requestId}] API调用失败,返回错误...`);
    
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] API调用失败,总耗时: ${duration}ms`);
    
    try {
      await logOps.add({
        account,
        api_name: 'update-steps',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        status: 'failed',
        steps: targetSteps,
        cost: 0,
        balance_after: userOps.getStats(account)?.balance
      });
    } catch (dbError) {
      console.log(`[${requestId}] 数据库记录失败:`, dbError.message);
    }
    return res.status(500).json(createStandardResponse(500, `刷步失败: ${xiaotuoResult?.message || '未知'} | ${JSON.stringify(responseData)}`, account, 0));

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] 请求处理失败,耗时: ${duration}ms`, error);
    
    const account = req.method === 'POST' ? req.body?.account || '' : req.query?.account || '';
    const finalRequestPriority = req.method === 'POST' ? req.body?.priority || 1 : req.query?.priority || 1;
    
    return res.status(500).json(createStandardResponse(500, '服务器内部错误', account, 0));
  }
}

/**
 * 创建标准格式的响应 - JSON格式
 * 参考：https://api.makuo.cc/doc/get.sport.update
 */
function createStandardResponse(code, msg, account, steps) {
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
    code: code,
    msg: msg,
    time: currentTime,
    api_source: "官方API网:https://api.yunmge.com/",
    data: {
      user: account,
      steps: steps,
      update_time: currentTime
    }
  };
}


function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
