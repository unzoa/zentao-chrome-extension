#!/bin/bash

# 下载禅道 favicon 图标脚本

ICON_URL="https://zentao.tigermed.net/pro/favicon.ico"
OUTPUT_FILE="favicon.ico"

echo "正在下载禅道 favicon 图标..."

# 使用 curl 下载图标
if command -v curl &> /dev/null; then
    curl -o "$OUTPUT_FILE" "$ICON_URL"
    if [ $? -eq 0 ]; then
        echo "图标下载成功！"
        echo "文件保存为: $OUTPUT_FILE"

        # 检查文件大小
        FILE_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
        if [ "$FILE_SIZE" -gt 0 ]; then
            echo "文件大小: $FILE_SIZE 字节"
        else
            echo "警告: 下载的文件可能为空"
        fi
    else
        echo "下载失败，请检查网络连接或手动下载"
    fi
elif command -v wget &> /dev/null; then
    wget -O "$OUTPUT_FILE" "$ICON_URL"
    if [ $? -eq 0 ]; then
        echo "图标下载成功！"
        echo "文件保存为: $OUTPUT_FILE"
    else
        echo "下载失败，请检查网络连接或手动下载"
    fi
else
    echo "未找到 curl 或 wget，请手动下载图标"
    echo "访问: $ICON_URL"
    echo "保存为: $OUTPUT_FILE"
fi

# 如果下载成功，创建不同尺寸的图标
if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
    echo ""
    echo "正在创建不同尺寸的图标..."

    if command -v convert &> /dev/null; then
        convert "$OUTPUT_FILE" -resize 16x16 icon16.png
        convert "$OUTPUT_FILE" -resize 48x48 icon48.png
        convert "$OUTPUT_FILE" -resize 128x128 icon128.png
        echo "图标创建完成！"
    else
        echo "未检测到 ImageMagick，无法创建 PNG 图标"
        echo "请安装 ImageMagick: brew install imagemagick"
        echo "或者使用在线工具转换: https://cloudconvert.com/ico-to-png"
    fi
fi