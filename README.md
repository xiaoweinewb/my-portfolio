# 个人创作展示网站

一个展示摄影、视频、音乐和文字作品的个人网站。

## 项目结构

```
my-portfolio/
├── index.html          # 主页面
├── css/
│   └── styles.css      # 样式文件
├── js/
│   └── script.js       # 交互脚本
├── data/               # 内容配置文件
│   ├── photos.json     # 摄影作品配置
│   ├── videos.json     # 视频作品配置
│   ├── music.json      # 音乐作品配置
│   └── writings.json   # 文字记录配置
└── assets/             # 本地资源文件夹（可选）
    ├── photos/         # 本地图片
    ├── videos/         # 本地视频
    └── music/          # 本地音频
```

## 功能特点

- **摄影作品** - 瀑布流展示，灯箱浏览
- **视频创作** - 视频卡片，模态框播放
- **音乐创作** - 自定义音频播放器
- **文字记录** - 博客文章列表
- **响应式设计** - 适配桌面和移动设备
- **可扩展内容** - 通过 JSON 配置管理作品

## 使用方法

1. 由于网站通过 JavaScript 动态加载 JSON 数据，**需要通过本地服务器运行**：

```bash
# 使用 Python（Python 3）
cd my-portfolio
python -m http.server 8000

# 或使用 Node.js
npx serve .
```

2. 打开浏览器访问 `http://localhost:8000`

## 自定义内容

所有内容通过 `data/` 文件夹下的 JSON 文件管理，修改后刷新页面即可更新。

### 摄影作品 (data/photos.json)

```json
[
  {
    "src": "https://example.com/photo-large.jpg",
    "thumb": "https://example.com/photo-thumb.jpg",
    "title": "作品标题",
    "meta": "2024年 · 地点"
  }
]
```

字段说明：
- `src` - 大图 URL（灯箱查看时使用）
- `thumb` - 缩略图 URL（列表显示用，可与 src 相同）
- `title` - 作品标题
- `meta` - 附加信息（如时间、地点）

### 视频作品 (data/videos.json)

```json
[
  {
    "video": "https://example.com/video.mp4",
    "poster": "https://example.com/poster.jpg",
    "title": "视频标题",
    "meta": "2024年纪录片"
  }
]
```

字段说明：
- `video` - 视频文件 URL
- `poster` - 视频封面图 URL
- `title` - 视频标题
- `meta` - 视频描述

### 音乐作品 (data/music.json)

```json
[
  {
    "src": "https://example.com/song.mp3",
    "cover": "https://example.com/cover.jpg",
    "title": "歌曲名称",
    "meta": "专辑信息 · 2024"
  }
]
```

字段说明：
- `src` - 音频文件 URL
- `cover` - 封面图 URL
- `title` - 歌曲名称
- `meta` - 专辑/艺人信息

### 文字记录 (data/writings.json)

```json
[
  {
    "image": "https://example.com/article.jpg",
    "date": "2024年3月15日",
    "title": "文章标题",
    "excerpt": "文章摘要..."
  }
]
```

字段说明：
- `image` - 文章配图 URL
- `date` - 发布日期
- `title` - 文章标题
- `excerpt` - 文章摘要

## 本地资源

如需使用本地资源，将文件放入 `assets/` 对应文件夹，然后在 JSON 中引用：

```json
{
  "src": "assets/photos/my-photo.jpg",
  "thumb": "assets/photos/thumb-my-photo.jpg"
}
```

## 技术栈

- HTML5
- CSS3 (CSS Variables, Flexbox, Grid, Animations)
- Vanilla JavaScript (ES6+, Fetch API)
- Google Fonts
- 外部图片/媒体（可替换为本地资源）

## License

MIT
