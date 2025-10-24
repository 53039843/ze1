// ze1/lib/xiaotuo-api-util.js
const axios = require('axios');

/**
 * 调用小驼API (api.xiaotuo.net)
 */
async function callXiaotuoAPI(requestId, account, password, targetSteps) {
  const apiUrl = 'https://api.xiaotuo.net/api/zepp';
  // 用户提供的API Key
  const apiKey = 'd2e075b0-15c2-6d00-744d-76fd689b17a190f303b6';

  try {
    console.log(`[${requestId}] 正在调用小驼API...`);
    
    const response = await axios.get(apiUrl, {
      params: {
        apikey: apiKey,
        username: account,
        password: password,
        step: targetSteps.toString()
      },
      timeout: 15000, // 15秒超时
      validateStatus: function (status) {
        return status < 500; // 只有5xx错误才会被reject
      }
    });

    console.log(`[${requestId}] 小驼API响应状态: ${response.status}`);
    console.log(`[${requestId}] 小驼API响应数据:`, response.data);

    // 检查HTTP状态码
    if (response.status !== 200) {
      throw new Error(`HTTP状态码错误: ${response.status}`);
    }

    // 检查业务状态码
    // 假设成功的返回结构中有一个明确的成功标记，例如 code: 200 或 success: true
    // 根据用户提供的接口格式，我们假设成功时返回一个包含 success: true 的 JSON
    // 实际接口的返回格式未知，这里先假设成功时 response.data.code === 200 或 response.data.success === true
    if (!response.data || (response.data.code !== 200 && response.data.success !== true)) {
      const errorMsg = response.data?.msg || response.data?.message || '未知错误';
      
      // 对于小驼API，我们默认所有失败都应该继续回退到下一个API
      return {
        success: false,
        message: `小驼API调用失败: ${errorMsg}`,
        shouldNotFallback: false,
        data: response.data
      };
    }

    // 成功响应
    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error(`[${requestId}] 小驼API网络错误:`, error.message);
    
    // 网络错误或超时，应该回退
    return {
      success: false,
      message: `小驼API网络错误: ${error.message}`,
      shouldNotFallback: false,
      error: error.message
    };
  }
}

module.exports = {
  callXiaotuoAPI,
};

