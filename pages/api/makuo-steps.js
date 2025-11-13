// 优化版本：使用api.3x.ink API的小米运动步数更新接口，支持自动回退到ZeppLife
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

    // 使用api.3x.ink API - 严格按照API文档实现
    const apiUrl = 'https://api.3x.ink/api/get.sport.update';
    const token = 'xbAbPHInyLaesR6PKG6MZg'; // 用户提供的token
    
    console.log('调用api.3x.ink API...');
    console.log('请求参数:', { user: account, pass: password, steps: targetSteps });

    try {
      // 按照API文档使用GET请求，参数通过query传递
      const response = await axios.get(apiUrl, {
        params: {
          token: token,
          user: account,
          pass: password,
          steps: targetSteps.toString() // 确保步数为字符串格式
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        },
        timeout: 20000, // 20秒超时
        validateStatus: function (status) {
          return status >= 200 && status < 600; // 接受所有状态码,避免axios自动抛出错误
        }
      });

      console.log('api.3x.ink API响应:', response.data);

      // 严格按照API文档检查响应 - 只有code为200才算成功
      if (response.data && response.data.code === 200) {
        // 成功响应
        const result = {
          success: true,
          message: `步数修改成功: ${targetSteps}`,
          data: {
            user: account,
            steps: targetSteps,
            update_time: new Date().toLocaleString('zh-CN'),
            api_source: 'api.3x.ink API',
            response_data: response.data
          }
        };
        console.log('api.3x.ink API调用成功，返回响应:', result);
        return res.status(200).json(result);
      } else {
        // API返回非成功状态，抛出错误以触发回退
        const errorMsg = response.data?.msg || response.data?.message || '未知错误';
        console.log(`api.3x.ink API返回错误状态: code=${response.data?.code}, msg=${errorMsg}`);
        throw new Error(`api.3x.ink API返回错误: ${errorMsg}`);
      }
      
    } catch (error) {
      console.error('api.3x.ink API调用失败:', error.message);
      
      // 如果是明确的业务错误（如账号密码错误），直接返回错误，不进行回退
      if (error.response && error.response.status === 400) {
        const errorMsg = error.response.data?.msg || error.response.data?.message || '请求参数错误';
        return res.status(400).json({
          success: false,
          message: errorMsg,
          data: error.response.data
        });
      }
      
      // 对于网络错误、超时、服务器错误等，进行回退
      console.log('api.3x.ink API失败，尝试回退到ZeppLife API...');
      throw error; // 重新抛出错误以触发回退逻辑
    }
    
  } catch (makuoError) {
    // api.3x.ink API失败，尝试使用ZeppLife API作为回退
    console.log('开始执行回退逻辑，使用ZeppLife API...');
    
    try {
      // 重新获取参数（防止作用域问题）
      const { account, password, steps } = req.method === 'POST' ? req.body : req.query;
      const targetSteps = steps ? 
        (req.method === 'GET' ? parseInt(steps) : steps) : 
        Math.floor(Math.random() * 10000) + 20000;

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
      console.log('ZeppLife API调用成功，返回响应:', response);
      return res.status(200).json(response);
      
    } catch (zeppError) {
      console.error('ZeppLife API也失败了:', zeppError.message);
      
      // 如果ZeppLife也失败，返回最终错误
      let errorMessage = '所有接口均调用失败';
      
      // 尝试从ZeppLife错误中提取有用信息
      if (zeppError.message.includes('账号或密码错误')) {
        errorMessage = '账号或密码错误，请检查后重试';
      } else if (zeppError.message.includes('网络')) {
        errorMessage = '网络连接失败，请检查网络后重试';
      } else if (zeppError.message.includes('登录')) {
        errorMessage = '登录失败，请检查账号密码';
      }

      const response = {
        success: false,
        message: errorMessage,
        error: {
          makuo_error: makuoError.message,
          zepplife_error: zeppError.message
        }
      };
      console.log('所有API均失败，返回错误响应:', response);
      return res.status(500).json(response);
    }
  }
}
