// 模拟makuo.cc API响应的测试接口
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

  try {
    // 提取请求参数
    const { account, password, steps } = req.method === 'POST' ? req.body : req.query;

    // 参数验证
    if (!account || !password) {
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
        return res.status(400).json({
          success: false,
          message: '步数必须是0-100000之间的有效数字'
        });
      }
    } else {
      // 生成合理范围内的随机步数
      targetSteps = Math.floor(Math.random() * 10000) + 20000;
    }

    console.log(`[模拟API] 处理参数: 账号=${account}, 目标步数=${targetSteps}`);

    // 模拟不同的响应场景
    const scenario = getTestScenario(account, password);
    
    if (scenario === 'success') {
      // 模拟成功响应
      const mockResponse = {
        code: 200,
        msg: "刷步成功",
        time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        api_source: "官方API网:https://api.makuo.cc/",
        data: {
          user: account,
          steps: targetSteps,
          update_time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        }
      };

      const result = {
        success: true,
        message: `步数修改成功: ${targetSteps}`,
        data: {
          user: account,
          steps: targetSteps,
          update_time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
          api_source: 'makuo.cc API (模拟成功)',
          response_data: mockResponse
        }
      };

      console.log('[模拟API] 返回成功响应');
      return res.status(200).json(result);

    } else if (scenario === 'auth_error') {
      // 模拟认证错误
      const mockResponse = {
        code: 500,
        msg: "账号或密码错误",
        time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        api_source: "官方API网:https://api.makuo.cc/"
      };

      const result = {
        success: false,
        message: 'API调用失败: 账号或密码错误',
        data: {
          user: account,
          steps: targetSteps,
          update_time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
          api_source: 'makuo.cc API (模拟认证错误)',
          response_data: mockResponse
        }
      };

      console.log('[模拟API] 返回认证错误响应');
      return res.status(400).json(result);

    } else {
      // 模拟服务器错误
      const mockResponse = {
        code: 500,
        msg: "服务器返回数据格式错误",
        time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        api_source: "官方API网:https://api.makuo.cc/"
      };

      const result = {
        success: false,
        message: 'API调用失败: 服务器返回数据格式错误',
        data: {
          user: account,
          steps: targetSteps,
          update_time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
          api_source: 'makuo.cc API (模拟服务器错误)',
          response_data: mockResponse
        }
      };

      console.log('[模拟API] 返回服务器错误响应');
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('[模拟API] 处理失败:', error.message);
    
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
}

/**
 * 根据账号密码确定测试场景
 */
function getTestScenario(account, password) {
  // 成功场景
  if (account === 'success@test.com' && password === 'success123') {
    return 'success';
  }
  
  // 认证错误场景
  if (account === 'error@test.com' && password === 'error123') {
    return 'auth_error';
  }
  
  // 默认为服务器错误场景
  return 'server_error';
}
