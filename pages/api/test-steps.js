export default async function handler(req, res) {
  // 支持GET和POST两种方式
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    // 根据请求方法获取参数
    const { user, pass, steps, account, password } = req.method === 'POST' ? req.body : req.query;
    
    // 兼容两种参数格式
    const finalUser = user || account;
    const finalPass = pass || password;
    const finalSteps = steps || 20000;

    if (!finalUser || !finalPass) {
      return res.status(400).json({ success: false, message: '账号和密码不能为空' });
    }

    console.log('测试API调用:', { user: finalUser, steps: finalSteps });

    // 模拟成功响应
    const mockResponse = {
      success: true,
      message: `步数修改成功: ${finalSteps}`,
      data: {
        code: 200,
        msg: "刷步成功",
        time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        api_source: "测试API",
        data: {
          user: finalUser,
          steps: parseInt(finalSteps),
          update_time: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      }
    };
    
    res.status(200).json(mockResponse);
  } catch (error) {
    console.error('测试API处理失败:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || '服务器内部错误'
    });
  }
}
