# 发布流程文档

本文档介绍如何使用 GitHub Actions 自动构建并发布 PHP 版本的 Zepp Life 步数修改工具。

## 发布新版本

要发布新版本，按照以下步骤操作：

1. 确保你的更改已经提交并推送到 GitHub

2. 添加新版本标签并推送：
   ```bash
   git tag v1.0.0  # 更改版本号，格式必须是 v 开头
   git push origin v1.0.0
   ```

3. 推送标签后，GitHub Actions 将自动触发构建流程：
   - 检出代码
   - 构建 Next.js 项目
   - 创建 PHP 兼容的目录结构
   - 打包整个项目为 ZIP 文件
   - 自动创建 GitHub Release
   - 上传打包好的 ZIP 文件到 Release

4. 构建完成后，你可以在 GitHub 仓库的 "Releases" 页面找到发布的版本

## 发布内容说明

自动发布的 PHP 包含以下内容：

- 已构建的 Next.js 前端应用
- PHP 版的 API 接口
- 入口文件和部署说明

## 部署说明

1. 下载 Release 页面中的 `zepp-life-steps-php.zip` 文件
2. 解压缩到支持 PHP 的网站目录
3. 访问网站的 `index.php` 文件即可使用

## 自定义构建配置

如需修改构建配置，请编辑 `.github/workflows/release.yml` 文件。 