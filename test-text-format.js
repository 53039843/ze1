// 测试纯文本格式API返回
console.log('开始测试纯文本格式API...');

const testParams = {
  account: 'tr00042@163.com',
  password: 'aEqNzMqDeT.',
  steps: 75383
};

console.log('测试参数:', testParams);

// 模拟API调用返回的纯文本格式
function createStandardResponse(status, account, steps) {
  const currentTime = new Date().toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return `刷步状态：${status}
账号：${account}
时间：${currentTime}
步数：${steps}
官网：www.ydb7.com`;
}

console.log('\n期望的纯文本格式返回:');
console.log('---开始---');
console.log(createStandardResponse('成功', testParams.account, testParams.steps));
console.log('---结束---');

console.log('\n失败时的纯文本格式返回:');
console.log('---开始---');
console.log(createStandardResponse('失败', testParams.account, 0));
console.log('---结束---');

console.log('\n格式特点:');
console.log('✅ 每个值独占一行');
console.log('✅ 中文字段名，直观易懂');
console.log('✅ 纯文本格式，自动换行');
console.log('✅ 无需JSON解析，直接显示');
console.log('✅ 在任何环境下都能正确显示');
