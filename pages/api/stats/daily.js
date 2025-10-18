const { logOps } = require('../../../lib/database');

/**
 * 获取按日期统计的API调用数据
 * GET /api/stats/daily?account={account}&days={days}
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
    const { account, days = 7 } = req.query;

    if (!account) {
      return res.status(400).json({ success: false, message: '缺少账号参数' });
    }

    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 90) {
      return res.status(400).json({ success: false, message: '天数参数无效（1-90）' });
    }

    // 获取每日统计数据
    const stats = logOps.getDailyStats(account, daysNum);

    return res.status(200).json({
      success: true,
      data: stats.map(item => ({
        date: item.date,
        total: item.total,
        success: item.success,
        failed: item.failed
      }))
    });
  } catch (error) {
    console.error('获取每日统计失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
}

