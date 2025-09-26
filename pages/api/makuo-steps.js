// 使用makuo.cc API的小米运动步数更新接口，支持自动回退到ZeppLife
const axios = require('axios');
const zeppLifeSteps = require('./ZeppLifeSteps');

export default async function handler(req, res) {
  // 支持POST和GET两种请求方式
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 根据请求方法从不同地方获取参数
    const { account, password, steps } = req.method === 'POST' ? req.body : req.query;

    if (!account || !password) {
      return res.status(400).json({ success: false, message: '账号和密码不能为空' });
    }

    // 设置默认步数，对于GET请求，需要将steps参数转为整数
    const targetSteps = steps ? 
      (req.method === 'GET' ? parseInt(steps) : steps) : 
      Math.floor(Math.random() * 10000) + 20000;
      
    console.log('目标步数:', targetSteps);

    // 使用makuo.cc API
    const apiUrl = 'https://api.makuo.cc/api/get.sport.xiaomi';
    const token = 'LUvOOl2x8II1POI9KfnFeQ'; // 用户提供的token
    
    console.log('调用makuo.cc API...');
    console.log('请求参数:', { user: account, pass: password, steps: targetSteps });

    // 添加重试机制
    let lastError;
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`第${attempt}次尝试调用API...`);
        
        const response = await axios.get(apiUrl, {
          params: {
            user: account,
            pass: password,
            steps: targetSteps.toString(),
            token: token
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
          },
          timeout: 30000 // 30秒超时
        });

        console.log('makuo.cc API响应:', response.data);

        // 检查API响应
        if (response.data && (response.data.code === 200 || response.data.code === '200' || response.data.success)) {
          // 成功
          const result = {
            success: true,
            message: `步数修改成功: ${targetSteps}`,
            data: {
              user: account,
              steps: targetSteps,
              update_time: new Date().toLocaleString('zh-CN'),
              api_source: 'makuo.cc API',
              response_data: response.data
            }
          };
          console.log('返回成功响应:', result);
          return res.status(200).json(result);
        } else {
          // API返回错误，如果是500错误，可以尝试回退
          if (response.data && response.data.code === 500) {
            console.log('makuo.cc API返回500错误，将尝试回退到ZeppLife');
            throw new Error('makuo.cc API服务错误，尝试回退');
          } else {
            // 其他错误（如账号密码错误等）直接返回
            const errorResult = {
              success: false,
              message: response.data.msg || response.data.message || '步数修改失败',
              data: response.data
            };
            console.log('API返回错误:', errorResult);
            return res.status(400).json(errorResult);
          }
        }
        
      } catch (error) {
        lastError = error;
        console.error(`第${attempt}次尝试失败:`, error.message);
        
        // 如果是网络错误或超时，可以重试
        if ((error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.response?.status >= 500) && attempt < maxRetries) {
          console.log(`等待3秒后进行第${attempt + 1}次尝试...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          // 其他错误（如401, 400等）不需要重试
          break;
        }
      }
    }
    
    // makuo.cc API失败，尝试使用ZeppLife API作为回退
    console.log('makuo.cc API失败，尝试使用ZeppLife API作为回退...');
    
    try {
      // 登录获取token
      const { loginToken, userId } = await zeppLifeSteps.login(account, password);
      console.log('ZeppLife登录成功');

      // 获取app token
      const appToken = await zeppLifeSteps.getAppToken(loginToken);
      console.log('ZeppLife获取appToken成功');

      // 修改步数
      const result = await zeppLifeSteps.updateSteps(loginToken, appToken, targetSteps);
      console.log('ZeppLife步数更新成功:', result);

      // 返回结果
      const response = {
        success: true,
        message: `步数修改成功: ${targetSteps} (使用备用接口)`,
        data: {
          ...result,
          user: account,
          steps: targetSteps,
          update_time: new Date().toLocaleString('zh-CN'),
          api_source: 'ZeppLife API (备用)'
        }
      };
      console.log('返回ZeppLife成功响应:', response);
      return res.status(200).json(response);
      
    } catch (zeppError) {
      console.error('ZeppLife API也失败了:', zeppError.message);
      // 如果ZeppLife也失败，抛出原始的makuo错误
      throw lastError;
    }
    
  } catch (error) {
    console.error('API处理失败:', error);
    
    let errorMessage = '服务器内部错误';
    
    if (error.response) {
      console.error('错误响应状态码:', error.response.status);
      console.error('错误响应数据:', error.response.data);
      
      if (error.response.status === 401) {
        errorMessage = 'API token无效或已过期';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.msg || error.response.data?.message || '请求参数错误';
      } else if (error.response.status === 429) {
        errorMessage = '请求过于频繁，请稍后重试';
      } else if (error.response.status >= 500) {
        errorMessage = 'API服务暂时不可用，请稍后重试';
      } else if (error.response.data && error.response.data.msg) {
        errorMessage = error.response.data.msg;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请稍后重试';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = '无法连接到API服务，请检查网络';
    }

    const response = {
      success: false,
      message: errorMessage,
      error: error.message
    };
    console.log('返回错误响应:', response);
    res.status(500).json(response);
  }
}
