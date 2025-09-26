const axios = require('axios');

export default async function handler(req, res) {
  // 支持GET和POST两种方式
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 根据请求方法获取参数
    const { user, pass, steps } = req.method === 'POST' ? req.body : req.query;

    if (!user || !pass || !steps) {
      return res.status(400).json({ success: false, message: '账号、密码和步数不能为空' });
    }

    // 按照API文档要求，使用GET请求，参数作为查询字符串
    const url = `https://api.makuo.cc/api/get.sport.xiaomi?user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}&steps=${steps}`;
    const token = 'LUvOOl2x8II1POI9KfnFeQ';

    console.log('请求URL:', url);
    console.log('使用Token:', token);

    // 严格按照文档要求：GET请求，Authorization头部包含token
    const response = await axios.get(url, {
      headers: {
        'Authorization': token,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log('API响应:', response.data);
    
    // 包装返回结果，保持与原API一致的格式
    const result = {
      success: response.data.code === 200,
      message: response.data.msg,
      data: response.data
    };
    
    res.status(200).json(result);
  } catch (error) {
    console.error('API处理失败:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.msg || error.message || '服务器内部错误',
      details: error.response?.data
    });
  }
}

