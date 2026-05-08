#!/bin/bash

# 禅道 Chrome 扩展图标生成脚本

echo "正在生成图标文件..."

# 使用 ImageMagick 或其他工具将 SVG 转换为 PNG
# 如果没有安装 ImageMagick，可以使用在线工具或手动创建

# 方法1: 使用 ImageMagick (如果已安装)
if command -v convert &> /dev/null; then
    convert icon.svg -resize 16x16 icon16.png
    convert icon.svg -resize 48x48 icon48.png
    convert icon.svg -resize 128x128 icon128.png
    echo "图标生成完成！"
else
    echo "未检测到 ImageMagick，请使用以下方法之一："
    echo ""
    echo "方法1: 安装 ImageMagick"
    echo "  brew install imagemagick  (macOS)"
    echo "  然后重新运行此脚本"
    echo ""
    echo "方法2: 使用在线工具"
    echo "  访问 https://cloudconvert.com/svg-to-png"
    echo "  上传 icon.svg 文件"
    echo "  分别生成 16x16, 48x48, 128x128 的 PNG 文件"
    echo ""
    echo "方法3: 使用 generate-icons.html"
    echo "  在浏览器中打开 generate-icons.html"
    echo "  会自动下载三个图标文件"
fi