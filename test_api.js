#!/usr/bin/env node

/**
 * API测试脚本
 * 用于验证update-steps API的各种功能
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';
const TEST_ACCOUNT = 'tr00042@163.com';
const TEST_PASSWORD = 'aEqNzMqDeT.';

// 测试用例
const testCases = [
  {
    name: 'GET请求 - 正常参数',
    method: 'GET',
    url: `${API_BASE_URL}/api/update-steps?account=${TEST_ACCOUNT}&password=${TEST_PASSWORD}&steps=1000`,
    expectedSuccess: true
  },
  {
    name: 'POST请求 - 正常参数',
    method: 'POST',
    url: `${API_BASE_URL}/api/update-steps`,
    data: {
      account: TEST_ACCOUNT,
      password: TEST_PASSWORD,
      steps: 2000
    },
    expectedSuccess: true
  },
  {
    name: 'GET请求 - 缺少账号密码',
    method: 'GET',
    url: `${API_BASE_URL}/api/update-steps?account=&password=&steps=1000`,
    expectedSuccess: false,
    expectedMessage: '账号和密码不能为空'
  },
  {
    name: 'GET请求 - 无效步数',
    method: 'GET',
    url: `${API_BASE_URL}/api/update-steps?account=${TEST_ACCOUNT}&password=${TEST_PASSWORD}&steps=abc`,
    expectedSuccess: false,
    expectedMessage: '步数必须是0-100000之间的有效数字'
  },
  {
    name: 'GET请求 - 步数超出范围',
    method: 'GET',
    url: `${API_BASE_URL}/api/update-steps?account=${TEST_ACCOUNT}&password=${TEST_PASSWORD}&steps=200000`,
    expectedSuccess: false,
    expectedMessage: '步数必须是0-100000之间的有效数字'
  },
  {
    name: 'OPTIONS请求 - CORS预检',
    method: 'OPTIONS',
    url: `${API_BASE_URL}/api/update-steps`,
    headers: {
      'Origin': 'http://example.com',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type'
    },
    expectedSuccess: true
  }
];

/**
 * 执行单个测试用例
 */
async function runTestCase(testCase) {
  console.log(`\n🧪 测试: ${testCase.name}`);
  console.log(`   方法: ${testCase.method}`);
  console.log(`   URL: ${testCase.url}`);
  
  try {
    const config = {
      method: testCase.method,
      url: testCase.url,
      timeout: 30000,
      validateStatus: () => true // 不抛出HTTP错误
    };

    if (testCase.data) {
      config.data = testCase.data;
      config.headers = { 'Content-Type': 'application/json' };
    }

    if (testCase.headers) {
      config.headers = { ...config.headers, ...testCase.headers };
    }

    const response = await axios(config);
    
    console.log(`   状态码: ${response.status}`);
    
    if (testCase.method === 'OPTIONS') {
      // OPTIONS请求检查CORS头
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
      };
      console.log(`   CORS头:`, corsHeaders);
      
      if (corsHeaders['Access-Control-Allow-Origin'] === '*') {
        console.log(`   ✅ CORS测试通过`);
        return true;
      } else {
        console.log(`   ❌ CORS测试失败`);
        return false;
      }
    }

    // 检查响应数据
    if (response.data) {
      console.log(`   响应: ${JSON.stringify(response.data, null, 2)}`);
      
      const success = response.data.success;
      const message = response.data.message;
      
      // 验证期望结果
      if (testCase.expectedSuccess !== undefined) {
        if (success === testCase.expectedSuccess) {
          console.log(`   ✅ 成功状态匹配期望: ${testCase.expectedSuccess}`);
        } else {
          console.log(`   ❌ 成功状态不匹配: 期望 ${testCase.expectedSuccess}, 实际 ${success}`);
          return false;
        }
      }
      
      if (testCase.expectedMessage) {
        if (message && message.includes(testCase.expectedMessage)) {
          console.log(`   ✅ 错误消息匹配期望`);
        } else {
          console.log(`   ❌ 错误消息不匹配: 期望包含 "${testCase.expectedMessage}", 实际 "${message}"`);
          return false;
        }
      }
      
      // 检查成功响应的数据结构
      if (success && response.data.data) {
        const data = response.data.data;
        const requiredFields = ['user', 'steps', 'update_time', 'api_source'];
        
        for (const field of requiredFields) {
          if (data[field] === undefined) {
            console.log(`   ❌ 缺少必需字段: ${field}`);
            return false;
          }
        }
        console.log(`   ✅ 数据结构验证通过`);
      }
      
      console.log(`   ✅ 测试通过`);
      return true;
    } else {
      console.log(`   ❌ 无响应数据`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ 测试失败: ${error.message}`);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始API测试...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    const passed = await runTestCase(testCase);
    if (passed) {
      passedTests++;
    }
    
    // 测试间隔
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 测试结果汇总:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过测试: ${passedTests}`);
  console.log(`   失败测试: ${totalTests - passedTests}`);
  console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！API功能正常。');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分测试失败，请检查API实现。');
    process.exit(1);
  }
}

/**
 * 检查服务器是否运行
 */
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL}/api/update-steps`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

// 主函数
async function main() {
  console.log('🔍 检查服务器状态...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ 服务器未运行，请先启动开发服务器:');
    console.log('   npm run dev');
    process.exit(1);
  }
  
  console.log('✅ 服务器运行正常');
  
  await runAllTests();
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, runTestCase };
