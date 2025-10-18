const { logOps } = require('../../../lib/database');

/**
 * 获取API调用记录
 * GET /api/stats/logs?account={account}&page={page}&pageSize={pageSize}
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
    const { account, page = 1, pageSize = 20 } = req.query;

    if (!account) {
      return res.status(400).json({ success: false, message: '缺少账号参数' });
    }

    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ success: false, message: '页码参数无效' });
    }

    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      return res.status(400).json({ success: false, message: '每页数量参数无效（1-100）' });
    }

    // 获取调用记录
    const logs = logOps.getList(account, pageNum, pageSizeNum);
    const total = logOps.getCount(account);

    return res.status(200).json({
      success: true,
      data: {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
        records: logs.map(log => ({
          id: log.request_id,
          api_name: log.api_name,
          ip: log.ip,
          created_at: log.created_at,
          status: log.status,
          steps: log.steps,
          cost: log.cost,
          balance_after: log.balance_after,
          error_message: log.error_message
        }))
      }
    });
  } catch (error) {
    console.error('获取调用记录失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
}

