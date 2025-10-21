// 全新优化版本：专门针对api.3x.ink API的小米运动步数更新接口
const axios = require('axios');
const zeppLifeSteps = require('./ZeppLifeSteps');

/**
 * 小米运动步数更新API处理器
 * 优先使用api.3x.ink API，失败时自动回退到ZeppLife API
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
      message: '不支持的请求方法，仅支持GET和POST' 
    });
  }

  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 开始处理${req.method}请求`);

  try {
    // 提取请求参数
    const { account, password, steps } = req.method === 'POST' ? req.body : req.query;

    // 参数验证
    if (!account || !password) {
      console.log('参数验证失败: 缺少账号或密码');
      return res.status(400).json({ 
        success: false, 
        message: '账号和密码不能为空' 
      });
    }

    // 处理步数参数
    let targetSteps;
    if (steps) {
      targetSteps = req.method === 'GET' ? parseInt(steps, 10) : parseInt(steps, 10);
      if (isNaN(targetSteps) || targetSteps < 0 || targetSteps > 100000) {
        return res.status(400).json({
          success: false,
          message: '步数必须是0-100000之间的有效数字'
        });
      }
    } else {
      // 生成合理范围内的随机步数
      targetSteps = Math.floor(Math.random() * 10000) + 20000;
    }

    console.log(`处理参数: 账号=${account}, 目标步数=${targetSteps}`);

    // 尝试调用api.3x.ink API
    const makuoResult = await callMakuoAPI(account, password, targetSteps);
    if (makuoResult.success) {
      const duration = Date.now() - startTime;
      console.log(`api.3x.ink API调用成功，耗时: ${duration}ms`);
      return res.status(200).json(makuoResult);
    }

    // api.3x.ink API失败，尝试回退到ZeppLife API
    console.log('api.3x.ink API失败，开始回退到ZeppLife API...');
    const zeppResult = await callZeppLifeAPI(account, password, targetSteps);
    
    const duration = Date.now() - startTime;
    console.log(`ZeppLife API调用完成，耗时: ${duration}ms`);
    return res.status(zeppResult.success ? 200 : 500).json(zeppResult);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`请求处理失败，耗时: ${duration}ms`, error);
    
    return res.status(500).json({
      success: false,
      message: '服务器内部错误，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * 调用api.3x.ink API
 */
async function callMakuoAPI(account, password, targetSteps) {
  const apiUrl = 'https://api.3x.ink/api/get.sport.update';
  const token = 'xbAbPHInyLaesR6PKG6MZg';

  try {
    console.log('正在调用api.3x.ink API...');
    
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
        'Cache-Control': 'no-cache'
      },
      timeout: 15000, // 15秒超时
      validateStatus: function (status) {
        return status < 500; // 只有5xx错误才会被reject
      }
    });

    console.log('api.3x.ink API响应状态:', response.status);
    console.log('api.3x.ink API响应数据:', response.data);

    // 检查响应状态
    if (response.status !== 200) {
      throw new Error(`HTTP状态码错误: ${response.status}`);
    }

    // 检查业务状态码
    if (!response.data || response.data.code !== 200) {
      const errorMsg = response.data?.msg || '未知错误';
      throw new Error(`业务错误: ${errorMsg}`);
    }

    // 成功响应
    return {
      success: true,
      message: `步数修改成功: ${targetSteps}`,
      data: {
        user: account,
        steps: targetSteps,
        update_time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        api_source: 'api.3x.ink API',
        response_data: response.data
      }
    };

  } catch (error) {
    console.error('api.3x.ink API调用失败:', error.message);
    
    // 返回失败结果，但不抛出异常
    return {
      success: false,
      message: `api.3x.ink API调用失败: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * 调用ZeppLife API作为备用方案
 */
async function callZeppLifeAPI(account, password, targetSteps) {
  try {
    console.log('正在调用ZeppLife API...');

    // 登录获取token
    const { loginToken, userId } = await zeppLifeSteps.login(account, password);
    console.log('ZeppLife登录成功');

    // 获取app token
    const appToken = await zeppLifeSteps.getAppToken(loginToken);
    console.log('ZeppLife获取appToken成功');

    // 修改步数
    const result = await zeppLifeSteps.updateSteps(loginToken, appToken, targetSteps);
    console.log('ZeppLife步数更新成功');

    // 返回成功结果
    return {
      success: true,
      message: `步数修改成功: ${targetSteps} (使用备用接口)`,
      data: {
        ...result,
        user: account,
        steps: targetSteps,
        update_time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        api_source: 'ZeppLife API (备用)'
      }
    };

  } catch (error) {
    console.error('ZeppLife API调用失败:', error.message);

    // 分析错误类型并返回友好的错误信息
    let errorMessage = '备用接口调用失败';
    
    if (error.message.includes('账号或密码')) {
      errorMessage = '账号或密码错误，请检查后重试';
    } else if (error.message.includes('网络') || error.message.includes('timeout')) {
      errorMessage = '网络连接超时，请稍后重试';
    } else if (error.message.includes('登录')) {
      errorMessage = '登录验证失败，请检查账号信息';
    }

    return {
      success: false,
      message: errorMessage,
      error: error.message
    };
  }
}

/**
 * 工具函数：验证账号格式
 */
function validateAccount(account) {
  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // 手机号格式验证（支持+86前缀）
  const phoneRegex = /^(\+86)?1[3-9]\d{9}$/;
  
  return emailRegex.test(account) || phoneRegex.test(account);
}
