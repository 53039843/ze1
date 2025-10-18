const { orderOps } = require('../../../lib/database');

/**
 * 查询充值订单状态
 * GET /api/recharge/status?order_id={order_id}
 */
export default function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.status(400).json({ success: false, message: '缺少订单号参数' });
    }

    // 查询订单
    const order = orderOps.get(order_id);

    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }

    return res.status(200).json({
      success: true,
      data: {
        order_id: order.order_id,
        account: order.account,
        amount: order.amount,
        status: order.status,
        payment_type: order.payment_type,
        trade_no: order.trade_no,
        created_at: order.created_at,
        notify_time: order.notify_time
      }
    });
  } catch (error) {
    console.error('查询订单状态失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
}

