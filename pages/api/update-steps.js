// 标准格式API接口:返回美观的一行一个值格式
// 官网:api.ydb7.com
const axios = require('axios');
const zeppLifeSteps = require('./ZeppLifeSteps');
const { callXiaotuoAPI } = require('../../lib/xiaotuo-api-util');
const { logOps, userOps } = require("../../lib/database-simple");

/**
 * 标准格式的步数更新API处理器
 * 返回格式:一行一个值,美观易读
 */
export default async function handler(req, res) {
  // 设置CORS头部和Content-Type
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只支持POST和GET请求
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json(createStandardResponse(500, '方法不允许', '', 0));
  }

  const startTime = Date.now();
  const requestId = generateRequestId();
  // 统一处理优先级，避免后续变量冲突
  console.log(`[${requestId}] 开始处理${req.method}请求`);

  try {
    // 提取请求参数
    const { account, password, steps } = req.method === 'POST' ? req.body : req.query;
    const priority = req.method === 'POST' ? req.body?.priority : req.query?.priority;

    // 设置最终优先级,默认为1
    const finalRequestPriority = priority || 1;
    console.log(`[${requestId}] 请求优先级: ${finalRequestPriority}`);

    // 参数验证
    if (!account || !password) {
      console.log(`[${requestId}] 参数验证失败: 缺少账号或密码`);
      return res.status(400).json(createStandardResponse(500, '账号和密码不能为空', account || '', 0));
    }

    // 处理步数参数
    let targetSteps;
    if (steps) {
      targetSteps = parseInt(steps, 10);
      if (isNaN(targetSteps) || targetSteps < 0) {
        console.log(`[${requestId}] 步数参数无效: ${steps}`);
        return res.status(400).json(createStandardResponse(500, '步数参数无效', account, 0));
      }
    } else {
      // 生成合理范围内的随机步数
      targetSteps = Math.floor(Math.random() * 100000) + 10000;
    }

    console.log(`[${requestId}] 处理参数: 账号=${account}, 目标步数=${targetSteps}`);

    // 第一步:尝试调用小驼API (api.xiaotuo.net)
    try {
      const xiaotuoResult = await callXiaotuoAPI(requestId, account, password, targetSteps);
      
      if (xiaotuoResult.success) {
        const duration = Date.now() - startTime;
        console.log(`[${requestId}] 小驼API调用成功,耗时: ${duration}ms`);
        
        // 返回标准格式
        try {
          await logOps.add({
            account,
            api_name: 'update-steps',
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            status: 'success',
            steps: targetSteps,
            cost: 0.006,
            balance_after: userOps.getStats(account)?.balance
          });
        } catch (dbError) {
          console.log(`[${requestId}] 数据库记录失败:`, dbError.message);
        }
        return res.status(200).json(createStandardResponse(200, '刷步成功', account, targetSteps));
      }

      // 小驼API失败,检查是否应该回退
      console.log(`[${requestId}] 小驼API失败: ${xiaotuoResult.message}`);
      
      // 如果是明确的业务错误(如账号密码错误),不进行回退
      if (xiaotuoResult.shouldNotFallback) {
        console.log(`[${requestId}] 不进行回退,直接返回错误`);
        try {
          await logOps.add({
            account,
            api_name: 'update-steps',
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            status: 'failed',
            steps: targetSteps,
            cost: 0,
            balance_after: userOps.getStats(account)?.balance
          });
        } catch (dbError) {
          console.log(`[${requestId}] 数据库记录失败:`, dbError.message);
        }
        return res.status(500).json(createStandardResponse(500, '刷步失败', account, 0));
      }

    } catch (xiaotuoError) {
      console.log(`[${requestId}] 小驼API异常: ${xiaotuoError.message}`);
    }

    // 第二步:回退到ZeppLife API
    console.log(`[${requestId}] 开始回退到ZeppLife API...`);
    
    try {
      // 登录获取token
      console.log(`[${requestId}] 开始登录流程...`);
      const { loginToken, userId } = await zeppLifeSteps.login(account, password);
      console.log(`[${requestId}] 登录成功,获取到loginToken和userId`);

      // 获取app token
      console.log(`[${requestId}] 开始获取appToken...`);
      const appToken = await zeppLifeSteps.getAppToken(loginToken);
      console.log(`[${requestId}] 获取appToken成功`);

      // 修改步数
      console.log(`[${requestId}] 开始更新步数...`);
      const result = await zeppLifeSteps.updateSteps(loginToken, appToken, targetSteps);
      console.log(`[${requestId}] 步数更新结果:`, result);

      // 返回标准格式
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] ZeppLife API调用成功,总耗时: ${duration}ms`);
      
      try {
        await logOps.add({
          account,
          api_name: 'update-steps',
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          status: 'success',
          steps: targetSteps,
          cost: 0.006,
          balance_after: userOps.getStats(account)?.balance
        });
      } catch (dbError) {
        console.log(`[${requestId}] 数据库记录失败:`, dbError.message);
      }
      return res.status(200).json(createStandardResponse(200, '刷步成功', account, targetSteps));
      
    } catch (zeppError) {
      console.error(`[${requestId}] ZeppLife API调用失败:`, zeppError.message);
      
      // 返回错误 - 标准格式
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] 所有API均失败,总耗时: ${duration}ms`);
      
      try {
        await logOps.add({
          account,
          api_name: 'update-steps',
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          status: 'failed',
          steps: targetSteps,
          cost: 0,
          balance_after: userOps.getStats(account)?.balance
        });
      } catch (dbError) {
        console.log(`[${requestId}] 数据库记录失败:`, dbError.message);
      }
      return res.status(500).json(createStandardResponse(500, '服务器内部错误', account, 0));
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] 请求处理失败,耗时: ${duration}ms`, error);
    
    const account = req.method === 'POST' ? req.body?.account || '' : req.query?.account || '';
    const finalRequestPriority = req.method === 'POST' ? req.body?.priority || 1 : req.query?.priority || 1;
    
    return res.status(500).json(createStandardResponse(500, '服务器内部错误', account, 0));
  }
}

/**
 * 创建标准格式的响应 - JSON格式
 * 参考：https://api.makuo.cc/doc/get.sport.update
 */
function createStandardResponse(code, msg, account, steps) {
  const currentTime = new Date().toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');

  return {
    code: code,
    msg: msg,
    time: currentTime,
    api_source: "官方API网:https://api.ydb7.com/",
    data: {
      user: account,
      steps: steps,
      update_time: currentTime
    }
  };
}


function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
