// 简化的测试API接口，专门用于测试api.3x.ink API
const axios = require('axios');

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

    console.log(`[测试API] 处理参数: 账号=${account}, 目标步数=${targetSteps}`);

    // 调用api.3x.ink API
    const apiUrl = 'https://api.3x.ink/api/get.sport.update';
    const token = 'xbAbPHInyLaesR6PKG6MZg';

    console.log('[测试API] 正在调用api.3x.ink API...');
    
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

    console.log('[测试API] api.3x.ink API响应状态:', response.status);
    console.log('[测试API] api.3x.ink API响应数据:', response.data);

    // 返回详细的测试结果
    const result = {
      success: response.data && response.data.code === 200,
      message: response.data && response.data.code === 200 ? 
        `步数修改成功: ${targetSteps}` : 
        `API调用失败: ${response.data?.msg || '未知错误'}`,
      test_info: {
        request_method: req.method,
        api_url: apiUrl,
        request_params: {
          user: account,
          pass: '***', // 隐藏密码
          steps: targetSteps.toString()
        },
        response_status: response.status,
        response_code: response.data?.code,
        response_msg: response.data?.msg
      },
      data: {
        user: account,
        steps: targetSteps,
        update_time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        api_source: 'api.3x.ink API (测试)',
        response_data: response.data
      }
    };

    return res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    console.error('[测试API] 调用失败:', error.message);
    
    let errorMessage = '服务器内部错误';
    let errorDetails = {};

    if (error.response) {
      errorMessage = `HTTP错误: ${error.response.status}`;
      errorDetails = {
        status: error.response.status,
        data: error.response.data
      };
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = '无法连接到API服务';
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      test_info: {
        error_type: error.code || 'unknown',
        error_message: error.message,
        error_details: errorDetails
      }
    });
  }
}
