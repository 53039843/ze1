// 优化版本：对接api.3x.ink API，保持原有返回格式不变
const axios = require('axios');
const zeppLifeSteps = require('./ZeppLifeSteps');

/**
 * 小米运动步数更新API处理器
 * 优先使用api.3x.ink API，失败时自动回退到ZeppLife API
 * 保持与原有update-steps.js完全相同的返回格式
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
    return res.status(405).json({ 
      success: false, 
      message: '方法不允许' 
    });
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
      return res.status(400).json({ 
        success: false, 
        message: '账号和密码不能为空' 
      });
    }

    // 处理步数参数
    let targetSteps;
    if (steps) {
      targetSteps = parseInt(steps, 10);
      if (isNaN(targetSteps) || targetSteps < 0 || targetSteps > 100000) {
        console.log(`[${requestId}] 步数参数无效: ${steps}`);
        return res.status(400).json({
          success: false,
          message: '步数必须是0-100000之间的有效数字'
        });
      }
    } else {
      // 生成合理范围内的随机步数
      targetSteps = Math.floor(Math.random() * 10000) + 20000;
    }

    console.log(`[${requestId}] 处理参数: 账号=${account}, 目标步数=${targetSteps}`);

    // 第一步：尝试调用api.3x.ink API
    try {
      const makuoResult = await callMakuoAPI(requestId, account, password, targetSteps);
      
      if (makuoResult.success) {
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] api.3x.ink API调用成功，耗时: ${duration}ms`);
        
        // 转换为原有格式
        const response = {
          success: true,
          message: `步数修改成功: ${targetSteps}`,
          data: makuoResult.data
        };
        
        return res.status(200).json(response);
      }

      // api.3x.ink API失败，检查是否应该回退
      console.log(`[${requestId}] api.3x.ink API失败: ${makuoResult.message}`);
      
      // 如果是明确的业务错误（如账号密码错误），不进行回退
      if (makuoResult.shouldNotFallback) {
        console.log(`[${requestId}] 不进行回退，直接返回错误`);
        return res.status(500).json({
          success: false,
          message: makuoResult.message
        });
      }

    } catch (makuoError) {
      console.log(`[${requestId}] api.3x.ink API异常: ${makuoError.message}`);
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

      // 返回结果 - 保持原有格式
      const response = {
        success: true,
        message: `步数修改成功: ${targetSteps}`,
        data: result
      };
      
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] ZeppLife API调用成功，总耗时: ${duration}ms`);
      console.log(`[${requestId}] 返回响应:`, response);
      
      return res.status(200).json(response);
      
    } catch (zeppError) {
      console.error(`[${requestId}] ZeppLife API调用失败:`, zeppError.message);
      
      // 返回错误 - 保持原有格式
      const response = {
        success: false,
        message: zeppError.message || '服务器内部错误'
      };
      
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] 所有API均失败，总耗时: ${duration}ms`);
      console.log(`[${requestId}] 返回错误响应:`, response);
      
      return res.status(500).json(response);
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] 请求处理失败，耗时: ${duration}ms`, error);
    
    return res.status(500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  }
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
        token: token,
        user: account,
        pass: password,
        steps: targetSteps.toString()
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Referer': 'https://api.3x.ink/'
      },
      timeout: 15000, // 15秒超时
      validateStatus: function (status) {
        return status >= 200 && status < 600; // 接受所有状态码,由业务逻辑判断成功失败
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

    // 成功响应 - 转换为原有数据格式
    return {
      success: true,
      message: `步数修改成功: ${targetSteps}`,
      data: {
        // 保持与ZeppLife API相似的数据结构
        user: account,
        steps: targetSteps,
        update_time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        api_source: 'api.3x.ink API',
        userid: response.data.data?.userid,
        // 保留原始响应数据
        makuo_response: response.data
      }
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

// 导出函数供其他模块使用
module.exports = {
  callMakuoAPI,
  isBusinessError
};
