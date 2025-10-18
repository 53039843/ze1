// 调用记录API - 简化版
const { logOps, DEFAULT_ACCOUNT } = require('../../../lib/database-simple');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { 
      account = DEFAULT_ACCOUNT, 
      page = 1, 
      pageSize = 20 
    } = req.query;

    const records = logOps.getList(account, parseInt(page), parseInt(pageSize));
    const total = logOps.getCount(account);
    const totalPages = Math.ceil(total / parseInt(pageSize));

    res.status(200).json({
      success: true,
      data: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages,
        records
      }
    });
  } catch (error) {
    console.error('获取调用记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取调用记录失败: ' + error.message
    });
  }
}
