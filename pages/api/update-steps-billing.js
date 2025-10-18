// 带计费功能的步数更新API
// 官网：www.ydb7.com
const axios = require('axios');
const zeppLifeSteps = require('./ZeppLifeSteps');
const { userOps, logOps } = require('../../lib/database');

// 单次调用费用
const CALL_COST = 0.006;

/**
 * 带计费功能的步数更新API处理器
 */
export default async function handler(req, res) {
  // 设置CORS头部和Content-Type
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只支持POST和GET请求
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).send(createStandardResponse('失败', '', 0, 1));
  }

  const startTime = Date.now();
  const requestId = generateRequestId();
  const clientIp = getClientIp(req);
  
  console.log(`[${requestId}] 开始处理${req.method}请求, IP: ${clientIp}`);

  try {
    // 提取请求参数
    const { account, password, steps, priority } = req.method === 'POST' ? req.body : req.query;

    // 设置优先级，默认为1
    const requestPriority = priority || 1;
    console.log(`[${requestId}] 请求优先级: ${requestPriority}`);

    // 参数验证
    if (!account || !password) {
      console.log(`[${requestId}] 参数验证失败: 缺少账号或密码`);
      
      // 记录失败日志（不扣费）
      logApiCall(requestId, account || '', clientIp, 'Zepp Life步数更新', 0, 'failed', '账号和密码不能为空', 0, 0);
      
      return res.status(400).send(createStandardResponse('失败', account || '', 0, requestPriority, '账号和密码不能为空', '#000000'));
    }

    // 检查用户余额
    const user = userOps.getOrCreate(account);
    if (user.balance < CALL_COST) {
      console.log(`[${requestId}] 余额不足: 当前余额${user.balance}, 需要${CALL_COST}`);
      
      // 记录失败日志（不扣费）
      logApiCall(requestId, account, clientIp, 'Zepp Life步数更新', 0, 'failed', '余额不足，请先充值', 0, user.balance);
      
      return res.status(400).send(createStandardResponse('失败', account, 0, requestPriority, `余额不足（当前:¥${user.balance.toFixed(4)}），请先充值`, '#ff0000'));
    }

    // 处理步数参数
    let targetSteps;
    if (steps) {
      targetSteps = parseInt(steps, 10);
      if (isNaN(targetSteps) || targetSteps < 0 || targetSteps > 100000) {
        console.log(`[${requestId}] 步数参数无效: ${steps}`);
        
        // 记录失败日志（不扣费）
        logApiCall(requestId, account, clientIp, 'Zepp Life步数更新', 0, 'failed', '步数参数无效', 0, user.balance);
        
        return res.status(400).send(createStandardResponse("失败", account, 0, requestPriority));
      }
    } else {
      // 生成合理范围内的随机步数
      targetSteps = Math.floor(Math.random() * 10000) + 20000;
    }

    console.log(`[${requestId}] 处理参数: 账号=${account}, 目标步数=${targetSteps}`);

    let apiSuccess = false;
    let errorMessage = '';

    // 第一步：尝试调用makuo.cc API
    try {
      const makuoResult = await callMakuoAPI(requestId, account, password, targetSteps);
      
      if (makuoResult.success) {
        apiSuccess = true;
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] makuo.cc API调用成功，耗时: ${duration}ms`);
      } else {
        errorMessage = makuoResult.message;
        console.log(`[${requestId}] makuo.cc API失败: ${makuoResult.message}`);
        
        // 如果是明确的业务错误（如账号密码错误），不进行回退
        if (makuoResult.shouldNotFallback) {
          console.log(`[${requestId}] 不进行回退，直接返回错误`);
          
          // 记录失败日志（不扣费）
          logApiCall(requestId, account, clientIp, 'Zepp Life步数更新', targetSteps, 'failed', errorMessage, 0, user.balance);
          
          return res.status(500).send(createStandardResponse('失败', account, 0, requestPriority));
        }
      }
    } catch (makuoError) {
      errorMessage = makuoError.message;
      console.log(`[${requestId}] makuo.cc API异常: ${makuoError.message}`);
    }

    // 第二步：如果makuo失败，回退到ZeppLife API
    if (!apiSuccess) {
      console.log(`[${requestId}] 开始回退到ZeppLife API...`);
      
      try {
        // 登录获取token
        console.log(`[${requestId}] 开始登录流程...`);
        const { loginToken, userId } = await zeppLifeSteps.login(account, password);
        console.log(`[${requestId}] 登录成功,获取到loginToken和userId`);

        // 获取app token
        console.log(`[${requestId}] 开始获取appToken...`);
        const appToken = await zeppLifeSteps.getAppToken(loginToken);
        console.log(`[${requestId}] 获取appToken成功`);

        // 修改步数
        console.log(`[${requestId}] 开始更新步数...`);
        const result = await zeppLifeSteps.updateSteps(loginToken, appToken, targetSteps);
        console.log(`[${requestId}] 步数更新结果:`, result);

        apiSuccess = true;
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] ZeppLife API调用成功，总耗时: ${duration}ms`);
        
      } catch (zeppError) {
        errorMessage = zeppError.message;
        console.error(`[${requestId}] ZeppLife API调用失败:`, zeppError.message);
      }
    }

    // 处理结果
    if (apiSuccess) {
      // 扣除费用
      userOps.deductBalance(account, CALL_COST);
      userOps.incrementCalls(account, true);
      
      // 获取扣费后余额
      const updatedUser = userOps.getStats(account);
      
      // 记录成功日志
      logApiCall(requestId, account, clientIp, 'Zepp Life步数更新', targetSteps, 'success', null, CALL_COST, updatedUser.balance);
      
      console.log(`[${requestId}] 调用成功，扣费${CALL_COST}元，剩余余额${updatedUser.balance}元`);
      
      return res.status(200).send(createStandardResponse('成功', account, targetSteps, requestPriority));
    } else {
      // 失败不扣费
      userOps.incrementCalls(account, false);
      
      // 记录失败日志
      logApiCall(requestId, account, clientIp, 'Zepp Life步数更新', targetSteps, 'failed', errorMessage, 0, user.balance);
      
      console.log(`[${requestId}] 调用失败，不扣费`);
      
      return res.status(500).send(createStandardResponse('失败', account, 0, requestPriority));
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] 请求处理失败，耗时: ${duration}ms`, error);
    
    const account = req.method === 'POST' ? req.body?.account || '' : req.query?.account || '';
    const priority = req.method === 'POST' ? req.body?.priority || 1 : req.query?.priority || 1;
    
    // 记录失败日志（不扣费）
    if (account) {
      const user = userOps.getOrCreate(account);
      logApiCall(requestId, account, clientIp, 'Zepp Life步数更新', 0, 'failed', error.message, 0, user.balance);
    }
    
    return res.status(500).send(createStandardResponse('失败', account, 0, priority));
  }
}

/**
 * 记录API调用日志
 */
function logApiCall(requestId, account, ip, apiName, steps, status, errorMessage, cost, balanceAfter) {
  try {
    logOps.add({
      request_id: requestId,
      account,
      ip,
      api_name: apiName,
      steps,
      status,
      error_message: errorMessage,
      cost,
      balance_after: balanceAfter
    });
  } catch (error) {
    console.error('记录API调用日志失败:', error);
  }
}

/**
 * 获取客户端IP
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';
}

/**
 * 创建标准格式的响应（一行一个值）
 */
function createStandardResponse(status, account, steps, priority = 1, customMessage = null, messageColor = null) {
  const currentTime = new Date().toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // 返回纯文本格式，一行一个值
  let responseStatus = status;
  if (customMessage) {
    responseStatus = customMessage;
  }

  let statusLine = `刷步状态：${responseStatus}`;
  if (messageColor) {
    statusLine = `<span style="color:${messageColor}">${statusLine}</span>`;
  }

  const response = `${statusLine}
账号：${account}
时间：${currentTime}
步数：${steps}
优先级：${priority}
单价：¥${CALL_COST}
官网：www.ydb7.com`;

  return response;
}

/**
 * 调用makuo.cc API
 */
async function callMakuoAPI(requestId, account, password, targetSteps) {
  const apiUrl = 'https://api.makuo.cc/api/get.sport.xiaomi';
  const token = 'xbAbPHInyLaesR6PKG6MZg';

  try {
    console.log(`[${requestId}] 正在调用makuo.cc API...`);
    
    const response = await axios.get(apiUrl, {
      params: {
        user: account,
        pass: password,
        steps: targetSteps.toString()
      },
      headers: {
        'Authorization': token,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Referer': 'https://api.makuo.cc/'
      },
      timeout: 15000,
      validateStatus: function (status) {
        return status < 500;
      }
    });

    console.log(`[${requestId}] makuo.cc API响应状态: ${response.status}`);
    console.log(`[${requestId}] makuo.cc API响应数据:`, response.data);

    if (response.status !== 200) {
      throw new Error(`HTTP状态码错误: ${response.status}`);
    }

    if (!response.data || response.data.code !== 200) {
      const errorMsg = response.data?.msg || '未知错误';
      const shouldNotFallback = isBusinessError(errorMsg);
      
      return {
        success: false,
        message: `makuo.cc API调用失败: ${errorMsg}`,
        shouldNotFallback,
        data: response.data
      };
    }

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error(`[${requestId}] makuo.cc API调用异常:`, error.message);
    
    return {
      success: false,
      message: `makuo.cc API网络错误: ${error.message}`,
      shouldNotFallback: false,
      error: error.message
    };
  }
}

/**
 * 判断是否为业务错误（不应该回退的错误）
 */
function isBusinessError(errorMsg) {
  const businessErrors = [
    '账号或密码错误',
    '用户不存在',
    '密码错误',
    '账号被锁定',
    '账号已禁用',
    '参数错误',
    '无效的账号格式'
  ];
  
  return businessErrors.some(error => errorMsg.includes(error));
}

/**
 * 生成请求ID用于日志追踪
 */
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

