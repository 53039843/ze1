const { userOps } = require('../../../lib/database');

/**
 * 获取用户统计信息
 * GET /api/stats/user?account={account}
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
    const { account } = req.query;

    if (!account) {
      return res.status(400).json({ success: false, message: '缺少账号参数' });
    }

    // 获取或创建用户
    const user = userOps.getOrCreate(account);

    // 计算成功率
    const successRate = user.total_calls > 0 
      ? ((user.success_calls / user.total_calls) * 100).toFixed(2)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        account: user.account,
        balance: parseFloat(user.balance.toFixed(4)),
        total_calls: user.total_calls,
        success_calls: user.success_calls,
        failed_calls: user.failed_calls,
        success_rate: parseFloat(successRate),
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
}

