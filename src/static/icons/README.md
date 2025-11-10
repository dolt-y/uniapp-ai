# 图标资源使用指南

本项目中包含以下图标资源，适用于小程序环境：

## 一、SVG图标（推荐使用）

### 基础图标

| 图标名称 | 文件路径 | 用途 |
|---------|---------|------|
| 麦克风 | `/static/icons/mic-outline.svg` | 语音输入 |
| 发送 | `/static/icons/send-outline.svg` | 发送消息 |
| 图片 | `/static/icons/image-outline.svg` | 上传图片 |
| 聊天气泡 | `/static/icons/chatbubble-outline.svg` | 聊天相关 |

### 状态图标

| 图标名称 | 文件路径 | 用途 |
|---------|---------|------|
| 成功 | `/static/icons/checkmark-circle-outline.svg` | 操作成功提示 |
| 错误 | `/static/icons/close-circle-outline.svg` | 操作失败提示 |
| 警告 | `/static/icons/alert-circle-outline.svg` | 警告提示 |
| 信息 | `/static/icons/information-circle-outline.svg` | 信息提示 |

## 二、PNG图标

| 图标名称 | 文件路径 | 用途 |
|---------|---------|------|
| Logo | `/static/logo.png` | 应用Logo和头像 |
| 发送按钮 | `/static/send.png` | 发送按钮图标 |
| 下拉箭头 | `/static/arrow_bottom.png` | 下拉指示 |

## 三、使用方法

### 在模板中使用SVG图标

```html
<!-- 基本用法 -->
<image src="/static/icons/mic-outline.svg" mode="aspectFit"></image>

<!-- 设置大小 -->
<image src="/static/icons/send-outline.svg" mode="aspectFit" style="width: 24px; height: 24px;"></image>

<!-- 切换颜色 -->
<image src="/static/icons/image-outline.svg" mode="aspectFit" style="width: 24px; height: 24px; filter: brightness(0) invert(1);"></image>
```

### 在SCSS中使用

```scss
.icon-button {
  background-image: url('/static/icons/send-outline.svg');
  background-size: 24px 24px;
  background-position: center;
  background-repeat: no-repeat;
}

/* 改变颜色 */
.icon-button.active {
  filter: brightness(0) invert(1);
}
```

## 四、图标规范

1. SVG图标默认颜色为黑色，可通过CSS的filter属性调整颜色
2. 推荐图标尺寸：24px × 24px，可根据需要调整
3. 保持图标风格统一，优先使用outline风格的图标
4. 新图标应添加到本目录并更新此文档

## 五、获取更多图标

可以从以下资源获取更多SVG图标：

- [Ionicons](https://ionicons.com/) - 本项目使用的图标来源
- [UniApp官方图标库](https://hellouniapp.dcloud.net.cn/pages/extUI/icons/icons)
- [阿里巴巴矢量图标库](https://www.iconfont.cn/)