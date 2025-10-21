// API测试脚本
const axios = require('axios');

// 测试配置
const TEST_CONFIG = {
  // 测试用的账号信息（请替换为真实的测试账号）
  account: 'test@example.com',
  password: 'testpassword',
  steps: 25000,
  
  // API配置
  makuoApiUrl: 'https://api.3x.ink/api/get.sport.update',
  token: 'xbAbPHInyLaesR6PKG6MZg',
  
  // 本地API测试地址
  localApiUrl: 'http://localhost:3000/api/makuo-steps'
};

/**
 * 测试api.3x.ink API直接调用
 */
async function testMakuoAPIDirect() {
  console.log('\n=== 测试api.3x.ink API直接调用 ===');
  
  try {
    const response = await axios.get(TEST_CONFIG.makuoApiUrl, {
      params: {
        user: TEST_CONFIG.account,
        pass: TEST_CONFIG.password,
        steps: TEST_CONFIG.steps.toString()
      },
      headers: {
        'Authorization': TEST_CONFIG.token,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ 直接调用成功');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.log('❌ 直接调用失败');
    console.log('错误信息:', error.message);
    
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * 测试本地API接口（POST方式）
 */
async function testLocalAPIPOST() {
  console.log('\n=== 测试本地API接口 (POST) ===');
  
  try {
    const response = await axios.post(TEST_CONFIG.localApiUrl, {
      account: TEST_CONFIG.account,
      password: TEST_CONFIG.password,
      steps: TEST_CONFIG.steps
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ 本地API调用成功');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.log('❌ 本地API调用失败');
    console.log('错误信息:', error.message);
    
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * 测试本地API接口（GET方式）
 */
async function testLocalAPIGET() {
  console.log('\n=== 测试本地API接口 (GET) ===');
  
  try {
    const response = await axios.get(TEST_CONFIG.localApiUrl, {
      params: {
        account: TEST_CONFIG.account,
        password: TEST_CONFIG.password,
        steps: TEST_CONFIG.steps
      },
      timeout: 30000
    });
    
    console.log('✅ 本地API GET调用成功');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.log('❌ 本地API GET调用失败');
    console.log('错误信息:', error.message);
    
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * 测试随机步数生成
 */
async function testRandomSteps() {
  console.log('\n=== 测试随机步数生成 ===');
  
  try {
    const response = await axios.post(TEST_CONFIG.localApiUrl, {
      account: TEST_CONFIG.account,
      password: TEST_CONFIG.password
      // 不提供steps参数，测试随机生成
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ 随机步数测试成功');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.log('❌ 随机步数测试失败');
    console.log('错误信息:', error.message);
    
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始API测试...');
  console.log('测试配置:', {
    account: TEST_CONFIG.account,
    steps: TEST_CONFIG.steps,
    makuoApiUrl: TEST_CONFIG.makuoApiUrl,
    localApiUrl: TEST_CONFIG.localApiUrl
  });
  
  const results = [];
  
  // 测试1: 直接调用api.3x.ink API
  results.push(await testMakuoAPIDirect());
  
  // 测试2: 本地API POST调用
  results.push(await testLocalAPIPOST());
  
  // 测试3: 本地API GET调用
  results.push(await testLocalAPIGET());
  
  // 测试4: 随机步数生成
  results.push(await testRandomSteps());
  
  // 汇总结果
  console.log('\n=== 测试结果汇总 ===');
  const successCount = results.filter(r => r.success).length;
  console.log(`总测试数: ${results.length}`);
  console.log(`成功数: ${successCount}`);
  console.log(`失败数: ${results.length - successCount}`);
  
  if (successCount === results.length) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️  部分测试失败，请检查配置和网络连接');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testMakuoAPIDirect,
  testLocalAPIPOST,
  testLocalAPIGET,
  testRandomSteps,
  runAllTests
};
