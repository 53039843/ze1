const crypto = require('crypto');

// 易支付配置
const EPAY_CONFIG = {
  apiUrl: 'https://912pay.com/submit.php',
  mchId: '1129',
  mchKey: 'tlyayFFWFlyH3aH8Ya5wZ5Hq55l3yS53',
  notifyUrl: '', // 将在运行时设置
  returnUrl: ''  // 将在运行时设置
};

/**
 * 生成MD5签名
 */
function generateSign(params, key) {
  // 过滤空值并排序
  const sortedParams = Object.keys(params)
    .filter(k => params[k] !== '' && params[k] !== null && params[k] !== undefined)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  
  const signStr = sortedParams + key;
  return crypto.createHash('md5').update(signStr).digest('hex');
}

/**
 * 验证签名
 */
function verifySign(params, sign, key) {
  const calculatedSign = generateSign(params, key);
  return calculatedSign === sign;
}

/**
 * 创建支付订单
 * @param {Object} orderData - 订单数据
 * @param {string} orderData.order_id - 商户订单号
 * @param {number} orderData.amount - 订单金额
 * @param {string} orderData.name - 商品名称
 * @param {string} orderData.type - 支付方式：alipay/wxpay
 * @param {string} baseUrl - 网站基础URL
 */
function createPayment(orderData, baseUrl) {
  // 设置回调URL
  EPAY_CONFIG.notifyUrl = `${baseUrl}/api/recharge/notify`;
  EPAY_CONFIG.returnUrl = `${baseUrl}/dashboard?payment=success`;

  const params = {
    pid: EPAY_CONFIG.mchId,
    type: orderData.type || 'alipay',
    out_trade_no: orderData.order_id,
    notify_url: EPAY_CONFIG.notifyUrl,
    return_url: EPAY_CONFIG.returnUrl,
    name: orderData.name || '账户充值',
    money: orderData.amount.toFixed(2)
  };

  // 生成签名
  params.sign = generateSign(params, EPAY_CONFIG.mchKey);
  params.sign_type = 'MD5';

  // 构建支付URL
  const queryString = Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');

  return {
    payUrl: `${EPAY_CONFIG.apiUrl}?${queryString}`,
    params
  };
}

/**
 * 处理异步通知
 * @param {Object} notifyData - 通知数据
 */
function handleNotify(notifyData) {
  const { sign, sign_type, ...params } = notifyData;

  // 验证签名
  if (!verifySign(params, sign, EPAY_CONFIG.mchKey)) {
    return {
      success: false,
      message: '签名验证失败'
    };
  }

  // 验证商户ID
  if (params.pid !== EPAY_CONFIG.mchId) {
    return {
      success: false,
      message: '商户ID不匹配'
    };
  }

  // 验证支付状态
  if (params.trade_status !== 'TRADE_SUCCESS') {
    return {
      success: false,
      message: '支付未成功'
    };
  }

  return {
    success: true,
    data: {
      order_id: params.out_trade_no,
      trade_no: params.trade_no,
      amount: parseFloat(params.money),
      type: params.type
    }
  };
}

module.exports = {
  createPayment,
  handleNotify,
  verifySign
};

