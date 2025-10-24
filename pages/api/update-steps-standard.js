// 标准格式API接口：返回美观的一行一个值格式
const { callXiaotuoAPI } = require('../../lib/xiaotuo-api-util'); // 引入新的备用API调用函数
// 官网：www.ydb7.com
const axios = require('axios');
const zeppLifeSteps = require('./ZeppLifeSteps');

/**
 * 标准格式的步数更新API处理器
 * 返回格式：一行一个值，美观易读
 */
export default async function handler(req, res) {
  // 设置CORS头部
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只支持POST和GET请求
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json(createStandardResponse('失败', '', 0));
  }

  const startTime = Date.now();
  const requestId = generateRequestId();
  console.log(`[${requestId}] 开始处理${req.method}请求`);

  try {
    // 提取请求参数
    const { account, password, steps } = req.method === 'POST' ? req.body : req.query;

    // 参数验证
    if (!account || !password) {
      console.log(`[${requestId}] 参数验证失败: 缺少账号或密码`);
      return res.status(400).json(createStandardResponse('失败', account || '', 0));
    }

    // 处理步数参数
    let targetSteps;
    if (steps) {
      targetSteps = parseInt(steps, 10);
      if (isNaN(targetSteps) || targetSteps < 0 || targetSteps > 100000) {
        console.log(`[${requestId}] 步数参数无效: ${steps}`);
        return res.status(400).json(createStandardResponse('失败', account, 0));
      }
    } else {
      // 生成合理范围内的随机步数
      targetSteps = Math.floor(Math.random() * 10000) + 20000;
    }

    console.log(`[${requestId}] 处理参数: 账号=${account}, 目标步数=${targetSteps}`);

    // 第一步：尝试调用小驼API (api.xiaotuo.net)
    try {
      const xiaotuoResult = await callXiaotuoAPI(requestId, account, password, targetSteps);

      if (xiaotuoResult.success) {
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] 小驼API调用成功，耗时: ${duration}ms`);
        return res.status(200).json(createStandardResponse('成功', account, targetSteps));
      }

      // 小驼API失败，检查是否应该回退
      console.log(`[${requestId}] 小驼API失败: ${xiaotuoResult.message}`);
      
      // 对于小驼API，我们默认所有失败都应该回退到下一个API (api.3x.ink)
      // if (xiaotuoResult.shouldNotFallback) {
      //   console.log(`[${requestId}] 不进行回退，直接返回错误`);
      //   return res.status(500).json(createStandardResponse('失败', account, 0));
      // }

    } catch (xiaotuoError) {
      console.log(`[${requestId}] 小驼API异常: ${xiaotuoError.message}`);
    }

    // 第二步：回退到api.3x.ink API
    try {
      console.log(`[${requestId}] 开始回退到api.3x.ink API...`);
      const makuoResult = await callMakuoAPI(requestId, account, password, targetSteps);
      
      if (makuoResult.success) {
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] api.3x.ink API调用成功，耗时: ${duration}ms`);
        
        // 返回标准格式
        return res.status(200).json(createStandardResponse('成功', account, targetSteps));
      }

      // api.3x.ink API失败，检查是否应该回退
      console.log(`[${requestId}] api.3x.ink API失败: ${makuoResult.message}`);
      
      // 如果是明确的业务错误（如账号密码错误），不进行回退
      if (makuoResult.shouldNotFallback) {
        console.log(`[${requestId}] 不进行回退，直接返回错误`);
        return res.status(500).json(createStandardResponse('失败', account, 0));
      }

    } catch (makuoError) {
      console.log(`[${requestId}] api.3x.ink API异常: ${makuoError.message}`);
    }

    // 第三步：回退到ZeppLife API
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
      
      return res.status(200).json(createStandardResponse('成功', account, targetSteps));
      
    } catch (zeppError) {
      console.error(`[${requestId}] ZeppLife API调用失败:`, zeppError.message);
      
      // 返回错误 - 标准格式
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] 所有API均失败，总耗时: ${duration}ms`);
      
      return res.status(500).json(createStandardResponse('失败', account, 0));
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] 请求处理失败，耗时: ${duration}ms`, error);
    
    return res.status(500).json(createStandardResponse('失败', req.method === 'POST' ? req.body?.account || '' : req.query?.account || '', 0));
  }
}

/**
 * 创建标准格式的响应
 */
function createStandardResponse(status, account, steps) {
  const currentTime = new Date().toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return {
    "刷步状态": status,
    "账号": account,
    "时间": currentTime,
    "步数": steps,
    "官网": "www.ydb7.com"
  };
}

/**
 * 调用api.3x.ink API
 */
async function callMakuoAPI(requestId, account, password, targetSteps) {
  const apiUrl = 'https://api.3x.ink/api/get.sport.update';
  const token = 'xbAbPHInyLaesR6PKG6MZg';

  try {
    console.log(`[${requestId}] 正在调用api.3x.ink API...`);
    
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
        'Referer': 'https://api.3x.ink/'
      },
      timeout: 15000, // 15秒超时
      validateStatus: function (status) {
        return status < 500; // 只有5xx错误才会被reject
      }
    });

    console.log(`[${requestId}] api.3x.ink API响应状态: ${response.status}`);
    console.log(`[${requestId}] api.3x.ink API响应数据:`, response.data);

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
        message: `api.3x.ink API调用失败: ${errorMsg}`,
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
    console.error(`[${requestId}] api.3x.ink API调用异常:`, error.message);
    
    // 网络错误或超时，应该回退
    return {
      success: false,
      message: `api.3x.ink API网络错误: ${error.message}`,
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
