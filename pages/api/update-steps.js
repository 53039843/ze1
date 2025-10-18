// 标准格式API接口：返回美观的一行一个值格式
// 官网：www.ydb7.com
const axios = require('axios');
const zeppLifeSteps = require('./ZeppLifeSteps');

/**
 * 标准格式的步数更新API处理器
 * 返回格式：一行一个值，美观易读
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
    return res.status(405).send(createStandardResponse('失败', '', 0, requestPriority));
  }

  const startTime = Date.now();
  const requestId = generateRequestId();
  const requestPriority = req.method === 'POST' ? req.body?.priority || 1 : req.query?.priority || 1;
  console.log(`[${requestId}] 开始处理${req.method}请求`);

  try {
    // 提取请求参数
    const { account, password, steps, priority } = req.method === 'POST' ? req.body : req.query;

    // 设置优先级，默认为1
    const requestPriority = priority || 1;
    console.log(`[${requestId}] 请求优先级: ${requestPriority}`);

    // 参数验证
    if (!account || !password) {
      console.log(`[${requestId}] 参数验证失败: 缺少账号或密码`);
      return res.status(400).send(createStandardResponse('失败', account || '', 0, requestPriority, '账号和密码不能为空', '#000000'));
    }

    // 处理步数参数
    let targetSteps;
    if (steps) {
      targetSteps = parseInt(steps, 10);
      if (isNaN(targetSteps) || targetSteps < 0) {
        console.log(`[${requestId}] 步数参数无效: ${steps}`);
        return res.status(400).send(createStandardResponse("失败", account, 0, requestPriority));
      }
    } else {
      // 生成合理范围内的随机步数
      targetSteps = Math.floor(Math.random() * 100000) + 10000;
    }



    console.log(`[${requestId}] 处理参数: 账号=${account}, 目标步数=${targetSteps}`);

    // 第一步：尝试调用makuo.cc API
    try {
      const makuoResult = await callMakuoAPI(requestId, account, password, targetSteps);
      
      if (makuoResult.success) {
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] makuo.cc API调用成功，耗时: ${duration}ms`);
        
        // 返回标准格式
        return res.status(200).send(createStandardResponse('成功', account, targetSteps, requestPriority));
      }

      // makuo.cc API失败，检查是否应该回退
      console.log(`[${requestId}] makuo.cc API失败: ${makuoResult.message}`);
      
      // 如果是明确的业务错误（如账号密码错误），不进行回退
      if (makuoResult.shouldNotFallback) {
        console.log(`[${requestId}] 不进行回退，直接返回错误`);
        return res.status(500).send(createStandardResponse('失败', account, 0, requestPriority));
      }

    } catch (makuoError) {
      console.log(`[${requestId}] makuo.cc API异常: ${makuoError.message}`);
    }

    // 第二步：回退到ZeppLife API
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

      // 返回标准格式
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] ZeppLife API调用成功，总耗时: ${duration}ms`);
      
      return res.status(200).send(createStandardResponse('成功', account, targetSteps, requestPriority));
      
    } catch (zeppError) {
      console.error(`[${requestId}] ZeppLife API调用失败:`, zeppError.message);
      
      // 返回错误 - 标准格式
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] 所有API均失败，总耗时: ${duration}ms`);
      
      return res.status(500).send(createStandardResponse('失败', account, 0, requestPriority));
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] 请求处理失败，耗时: ${duration}ms`, error);
    
    const account = req.method === 'POST' ? req.body?.account || '' : req.query?.account || '';
    const priority = req.method === 'POST' ? req.body?.priority || 1 : req.query?.priority || 1;
    
    return res.status(500).send(createStandardResponse('失败', account, 0, priority));
  }
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
      timeout: 15000, // 15秒超时
      validateStatus: function (status) {
        return status < 500; // 只有5xx错误才会被reject
      }
    });

    console.log(`[${requestId}] makuo.cc API响应状态: ${response.status}`);
    console.log(`[${requestId}] makuo.cc API响应数据:`, response.data);

    // 检查HTTP状态码
    if (response.status !== 200) {
      throw new Error(`HTTP状态码错误: ${response.status}`);
    }

    // 检查业务状态码
    if (!response.data || response.data.code !== 200) {
      const errorMsg = response.data?.msg || '未知错误';
      
      // 判断是否为业务错误（不应该回退）
      const shouldNotFallback = isBusinessError(errorMsg);
      
      return {
        success: false,
        message: `makuo.cc API调用失败: ${errorMsg}`,
        shouldNotFallback,
        data: response.data
      };
    }

    // 成功响应
    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error(`[${requestId}] makuo.cc API调用异常:`, error.message);
    
    // 网络错误或超时，应该回退
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
