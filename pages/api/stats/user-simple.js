// 用户统计API - 简化版
import { userOps, DEFAULT_ACCOUNT } from "../../../lib/database-simple";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { account = DEFAULT_ACCOUNT } = req.query;

    // 获取或创建用户
    let user = await userOps.getStats(account);
    if (!user) {
      user = await userOps.getOrCreate(account);
    }

    // 计算成功率
    const success_rate = user.total_calls > 0 
      ? (user.success_calls / user.total_calls * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...user,
        success_rate: parseFloat(success_rate)
      }
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户统计失败: ' + error.message
    });
  }
}

