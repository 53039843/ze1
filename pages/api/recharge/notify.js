const { orderOps, userOps } = require('../../../lib/database');
const { handleNotify } = require('../../../lib/epay');

/**
 * 易支付异步通知接口
 * POST /api/recharge/notify
 */
export default function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).send('fail');
  }

  try {
    // 易支付可能使用POST或GET方式发送通知
    const notifyData = req.method === 'POST' ? req.body : req.query;

    console.log('收到易支付通知:', notifyData);

    // 验证并处理通知
    const result = handleNotify(notifyData);

    if (!result.success) {
      console.error('通知验证失败:', result.message);
      return res.status(200).send('fail');
    }

    const { order_id, trade_no, amount } = result.data;

    // 查询订单
    const order = orderOps.get(order_id);
    if (!order) {
      console.error('订单不存在:', order_id);
      return res.status(200).send('fail');
    }

    // 检查订单是否已处理
    if (order.status === 'success') {
      console.log('订单已处理:', order_id);
      return res.status(200).send('success');
    }

    // 验证金额
    if (Math.abs(order.amount - amount) > 0.01) {
      console.error('订单金额不匹配:', order.amount, amount);
      return res.status(200).send('fail');
    }

    // 更新订单状态
    orderOps.updateStatus(order_id, 'success', trade_no);

    // 增加用户余额
    userOps.updateBalance(order.account, amount);

    console.log(`充值成功: 订单${order_id}, 账号${order.account}, 金额${amount}元`);

    // 返回success给易支付
    return res.status(200).send('success');
  } catch (error) {
    console.error('处理充值通知失败:', error);
    return res.status(200).send('fail');
  }
}

