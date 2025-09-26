const axios = require('axios');
const zeppLifeSteps = require('./ZeppLifeSteps');

export default async function handler(req, res) {
  // 支持GET和POST两种方式
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 根据请求方法获取参数，兼容多种参数格式
    const params = req.method === 'POST' ? req.body : req.query;
    const { user, pass, steps, account, password, method = 'makuo' } = params;
    
    // 兼容两种参数格式
    const finalUser = user || account;
    const finalPass = pass || password;
    const finalSteps = steps || 20000;

    if (!finalUser || !finalPass) {
      return res.status(400).json({ success: false, message: '账号和密码不能为空' });
    }

    console.log('请求参数:', { user: finalUser, steps: finalSteps, method });

    // 方法1：尝试使用makuo API（按照文档要求）
    if (method === 'makuo') {
      try {
        const url = `https://api.makuo.cc/api/get.sport.xiaomi?user=${encodeURIComponent(finalUser)}&pass=${encodeURIComponent(finalPass)}&steps=${finalSteps}`;
        const token = 'LUvOOl2x8II1POI9KfnFeQ';

        console.log('使用makuo API，请求URL:', url);

        const response = await axios.get(url, {
          headers: {
            'Authorization': token,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 10000
        });

        console.log('makuo API响应:', response.data);

        if (response.data.code === 200) {
          return res.status(200).json({
            success: true,
            message: response.data.msg,
            data: response.data,
            method: 'makuo'
          });
        } else {
          console.log('makuo API返回错误，尝试备选方案');
        }
      } catch (error) {
        console.log('makuo API调用失败，尝试备选方案:', error.message);
      }
    }

    // 方法2：使用原有的ZeppLife API作为备选
    if (method === 'zepplife' || method === 'makuo') {
      try {
        console.log('使用ZeppLife API作为备选方案');
        
        // 登录获取token
        const { loginToken, userId } = await zeppLifeSteps.login(finalUser, finalPass);
        
        // 获取app token
        const appToken = await zeppLifeSteps.getAppToken(loginToken);
        
        // 修改步数
        const result = await zeppLifeSteps.updateSteps(loginToken, appToken, finalSteps);
        
        return res.status(200).json({
          success: true,
          message: `步数修改成功: ${finalSteps}`,
          data: result,
          method: 'zepplife'
        });
      } catch (error) {
        console.log('ZeppLife API也失败了:', error.message);
        
        if (method === 'zepplife') {
          return res.status(500).json({
            success: false,
            message: error.message || 'ZeppLife API调用失败'
          });
        }
      }
    }

    // 方法3：模拟成功响应（用于演示）
    if (method === 'demo') {
      const mockResponse = {
        success: true,
        message: `步数修改成功: ${finalSteps}（演示模式）`,
        data: {
          code: 200,
          msg: "刷步成功（演示）",
          time: new Date().toISOString().replace('T', ' ').substring(0, 19),
          api_source: "演示API",
          data: {
            user: finalUser,
            steps: parseInt(finalSteps),
            update_time: new Date().toISOString().replace('T', ' ').substring(0, 19)
          }
        },
        method: 'demo'
      };
      
      return res.status(200).json(mockResponse);
    }

    // 如果所有方法都失败了
    return res.status(500).json({
      success: false,
      message: '所有API方法都失败了，请检查账号密码或稍后重试',
      details: {
        makuo_api: '返回500错误或token无效',
        zepplife_api: '请求频率限制或服务不可用'
      }
    });

  } catch (error) {
    console.error('API处理失败:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || '服务器内部错误'
    });
  }
}
