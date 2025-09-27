// 测试简洁格式API的脚本

async function testSimpleAPI() {
  console.log('开始测试简洁格式API...');
  
  try {
    // 测试参数
    const testParams = {
      account: 'tr00042@163.com',
      password: 'aEqNzMqDeT.',
      steps: 75383
    };
    
    console.log('测试参数:', testParams);
    
    // 模拟API调用
    const mockResponse = {
      success: true,
      account: testParams.account,
      time: new Date().toLocaleString('zh-CN', { 
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      steps: testParams.steps,
      website: 'www.ydb7.com'
    };
    
    console.log('期望的简洁格式返回:');
    console.log(JSON.stringify(mockResponse, null, 2));
    
    // 对比原有格式
    const originalFormat = {
      "success": true,
      "message": "步数修改成功: 75383",
      "data": {
        "user": "tr00042@163.com",
        "steps": 75383,
        "update_time": "2025/9/27 09:41:23",
        "api_source": "makuo.cc API",
        "userid": "1196198107",
        "makuo_response": {"code": 200, "msg": "请求成功"},
        "time": "2025-09-27 09:41:23",
        "api_source": "API官网:api.makuo.cc",
        "data": {"user": "tr00042@163.com", "steps": 75383, "userid": "1196198107"},
        "cached_time": "2025-09-27 09:41:23"
      }
    };
    
    console.log('\n原有复杂格式:');
    console.log(JSON.stringify(originalFormat, null, 2));
    
    console.log('\n格式对比:');
    console.log('原有格式字段数:', Object.keys(originalFormat).length + Object.keys(originalFormat.data).length);
    console.log('简洁格式字段数:', Object.keys(mockResponse).length);
    console.log('简化程度:', Math.round((1 - Object.keys(mockResponse).length / (Object.keys(originalFormat).length + Object.keys(originalFormat.data).length)) * 100) + '%');
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

// 运行测试
testSimpleAPI();
