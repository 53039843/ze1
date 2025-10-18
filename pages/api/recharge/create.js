const { orderOps } = require('../../../lib/database');
const { createPayment } = require('../../../lib/epay');

/**
 * 创建充值订单
 * POST /api/recharge/create
 */
export default function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { account, amount, type = 'alipay' } = req.body;

    // 参数验证
    if (!account) {
      return res.status(400).json({ success: false, message: '缺少账号参数' });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 1 || amountNum > 10000) {
      return res.status(400).json({ success: false, message: '充值金额无效（1-10000元）' });
    }

    if (!['alipay', 'wxpay'].includes(type)) {
      return res.status(400).json({ success: false, message: '支付方式无效' });
    }

    // 生成订单号
    const order_id = 'R' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();

    // 创建订单记录
    orderOps.create({
      order_id,
      account,
      amount: amountNum,
      payment_type: type
    });

    // 获取网站基础URL
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // 创建支付订单
    const payment = createPayment({
      order_id,
      amount: amountNum,
      name: `账户充值-${amountNum}元`,
      type
    }, baseUrl);

    console.log(`创建充值订单: ${order_id}, 账号: ${account}, 金额: ${amountNum}, 支付方式: ${type}`);

    return res.status(200).json({
      success: true,
      data: {
        order_id,
        pay_url: payment.payUrl,
        amount: amountNum,
        type
      }
    });
  } catch (error) {
    console.error('创建充值订单失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
}

