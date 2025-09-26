// 改进版的ZeppLife步数更新接口
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

    // 添加重试机制
    let lastError;
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`第${attempt}次尝试登录...`);
        
        // 登录获取token
        const { loginToken, userId } = await zeppLifeSteps.login(account, password);
        console.log('登录成功,获取到loginToken和userId');

        // 获取app token
        console.log('开始获取appToken...');
        const appToken = await zeppLifeSteps.getAppToken(loginToken);
        console.log('获取appToken成功');

        // 修改步数
        console.log('开始更新步数...');
        const result = await zeppLifeSteps.updateSteps(loginToken, appToken, targetSteps);
        console.log('步数更新结果:', result);

        // 返回结果
        const response = {
          success: true,
          message: `步数修改成功: ${targetSteps}`,
          data: {
            ...result,
            user: account,
            steps: targetSteps,
            update_time: new Date().toLocaleString('zh-CN'),
            api_source: '改进版ZeppLife接口'
          }
        };
        console.log('返回响应:', response);
        return res.status(200).json(response);
        
      } catch (error) {
        lastError = error;
        console.error(`第${attempt}次尝试失败:`, error.message);
        
        // 如果不是最后一次尝试，等待一段时间后重试
        if (attempt < maxRetries) {
          console.log(`等待2秒后进行第${attempt + 1}次尝试...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // 所有重试都失败了
    throw lastError;
    
  } catch (error) {
    console.error('API处理失败:', error);
    
    let errorMessage = '服务器内部错误';
    
    // 根据错误类型提供更友好的错误信息
    if (error.message.includes('登录失败')) {
      errorMessage = '账号或密码错误，请检查后重试';
    } else if (error.message.includes('获取access code失败')) {
      errorMessage = '账号验证失败，请检查账号格式';
    } else if (error.message.includes('获取appToken失败')) {
      errorMessage = '获取授权失败，请稍后重试';
    } else if (error.message.includes('更新步数失败')) {
      errorMessage = '步数更新失败，请稍后重试';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请稍后重试';
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = '网络连接失败，请检查网络后重试';
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
