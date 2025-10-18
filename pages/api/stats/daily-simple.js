// 每日统计API - 简化版
const { logOps, DEFAULT_ACCOUNT } = require('../../../lib/database-simple');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { account = DEFAULT_ACCOUNT, days = 7 } = req.query;
    const stats = logOps.getDailyStats(account, parseInt(days));

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取每日统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取每日统计失败: ' + error.message
    });
  }
}
