# Beyond the Prompt — Home, Blind Guess, Prompt Comparison, Findings & What's Next

## 本地打开

将整个文件夹拖进 WebStorm，打开 `index.html`，使用浏览器预览即可。也可以直接双击 `index.html`。不需要安装依赖或运行构建命令。

第一屏为 Queer by Prompt 首页。向下滚动或点击玻璃提示进入 Blind Guess；继续往下滚动依次进入 Prompt Comparison、Findings 和 What's Next。

## 文件结构

- `index.html`：Home、Blind Guess 及最终结果、Prompt Comparison、Findings 和 What's Next。
- `styles.css`：字体、颜色、环绕关键词位置、桌面和手机排版。
- `home.css`：居中超大标题、银灰底色的三色极光和玻璃胶囊。
- `titles.js`：四个主要章节标题的重复逐字入场和退场动画。
- `home.js`：极光画布动画、离屏暂停和减少动态效果支持。
- `rounds.js`：三轮图片、关键词、分类、反馈及评分规则。
- `app.js`：选择上限、轮次切换、结果与展开详情。
- `comparison-data.js`：四种身份词、三个年龄段、三种关系及36种图片配对。
- `comparison.js`：下拉选择、两张图片一起加载、重复生成与滚动入场。
- `findings.js`：Findings 卡片的滚动横移、屏幕尺寸更新和键盘聚焦定位。
- `whats-next.css`：三张资料卡片和展开面板的独立样式。
- `whats-next.js`：点击/键盘聚焦展开资料、关闭和政策平台标签切换。
- `next-carousel.js`：三张资料卡片的透视排布、左右拖动循环、圆点和方向键切换。
- `assets/images/`：三张原始肖像。
- `assets/comparison/`：45张原始横向4:3图片，保留文件夹和文件名。
- `assets/fonts/`：本地 Open Sans、Archivo Black 字体和许可证。

所有图片、字体、脚本均使用相对路径，不依赖外部字体服务。完整复制项目文件夹即可迁移。

## 上传至 GitHub Pages

1. 将本文件夹里的文件及 `assets` 文件夹上传到 GitHub 仓库根目录，确保根目录直接包含 `index.html`。
2. 在仓库的 Settings → Pages 中选择 Deploy from a branch。
3. 选择存放这些文件的分支，并选择 `/ (root)`，保存。
4. 部署完成后使用 GitHub 提供的网站地址。

不要只上传 HTML，CSS、JS、图片和字体都必须保留。此项目没有自动上传或发布到 GitHub。

## 当前体验

- 首页标题上方显示白色口号 Examine your judgements / Identify recurring visual patterns。
- 首页中央显示深灰色 Archivo Black 超大标题 Queer by Prompt；下方为写着 scroll to begin 的磨砂玻璃胶囊。
- 银灰色背景上叠加 #5299ff、#3427ff、#F43F5E 三色流动极光，上部光幕向下柔和消散；自然向下滚动进入 Blind Guess。
- 玻璃提示可点击或通过键盘进入 Blind Guess。手机端标题换行，胶囊保持居中。
- 极光使用原生 WebGL，不需要安装依赖。无 WebGL 或无 JavaScript 时显示静态三色光幕；减少动态效果时暂停极光。首页离开视口或切换浏览器标签时暂停动画。
- Blind Guess 标题使用 Archivo Black，顶部居中；交互区没有顶部说明、图片编号和上下分割线。
- Blind Guess、Prompt Comparison、Findings、What's Next? 的标题统一使用滚动触发的逐字淡入：从左侧20px移动到原位，每字持续0.5秒，依次延迟0.04秒。向上滚回时反向淡出；再次进入可重播。系统开启减少动态效果时直接显示。
- 三轮最多各选五词，至少一词才可进入下一轮。
- 前两轮使用 Next；第三轮使用 See results。
- Next / See results 使用 Interactive Hover Button 样式：白色胶囊、黑色小圆点，悬停或键盘聚焦后变为深色背景、白色文字与右箭头。未选择关键词时按钮仍禁用。
- 三轮结束前不显示分数或反馈。
- 照片已放大。首次进入时从右下逆时针旋转、放大并由模糊变清晰；点击 Next 时，旧照片缩小、模糊并逆时针向左下离场，新照片从右下逆时针旋转入场并回到中央。关键词和轮次文字同时淡出、淡入。动画期间暂时锁定操作，避免重复提交；系统开启减少动态效果时立即切换。
- 最终结果替换第二屏；两组详情默认收起，展开后正常向下滚动。
- 没有 Try again 按钮；刷新网页后重新开始，答案不保存。
- 手机端采用图片上方、关键词下方的基础适配。

## Prompt Comparison

向下滚动进入此区域。蓝色 Archivo Black 标题居中，电脑端两张4:3照片左右排列，手机端上下排列。

- Identity：Gay、Lesbian、Non-binary、Transgender。
- 三个下拉按钮仅显示按钮内文字，不显示上方的小标签；保留辅助阅读名称。
- Age：Young、Middle-aged、Older（文件名分别为young、middle、old）。
- Relationship：Single、Couple、Family。
- 选择三个选项后点击 Generate。Baseline 使用对应年龄和关系的person照片，Modified 使用所选身份词、相同年龄和关系的照片。
- 所有照片已提前制作；Generate 仅切换本地图片，不调用AI服务。
- 初次进入显示空白图片区域。更改选项后，需要再次点击 Generate 才更新图片。刷新后重置。
- 两张图片均加载成功后一起替换；加载失败保留之前的图片，可以重试。

## Findings

Prompt Comparison 后显示蓝色、左对齐的 Archivo Black 标题，以及 Gay、Lesbian、Non-binary、Transgender 四张卡片。每张卡片列出五个简短视觉模式。

- Findings 卡片缩为原尺寸的75%，以原位置的右下角为缩放基点。
- 页面向下滚动时，标题保持在屏幕左上，卡片从右向左移动，直到最后一张完整显示。
- 悬停时，右上角蓝色圆形扩展覆盖卡片，文字变白；移开后恢复。
- 键盘 Tab 可依次聚焦四张卡片，聚焦的卡片会进入可见区域。
- 系统开启减少动态效果时，改用静态网格排列；没有 JavaScript 时也能阅读四张卡片。

## What's Next?

Findings 下方显示蓝色居中的 Archivo Black 标题。三张白色卡片采用透视轮播：中央正面展示，左右倾斜，数字角标的灰色背景为直角。手机端以中央卡片为主，两侧卡片部分露出。

标题下方显示居中的黑色简介，介绍研究方法、酷儿家庭生活及模型政策演变。轮播卡片区域缩小约15%，保留循环切换和资料展开功能。

- 鼠标左右拖动或触屏横向滑动可循环切换；圆点和左右方向键也可切换。
- 点击卡片或键盘聚焦可展开原有资料；拖动不会误打开资料。切换卡片会关闭已展开的资料。
- 不自动播放；减少动态效果时取消过渡，保留切换功能。无 JavaScript 时显示普通卡片排布。

- Our Approach：三种研究方法和对应文献链接。
- Real-life Queer Family Life：五篇家庭生活研究的名称、作者、年份和链接。
- Model Policy Timeline：OpenAI、Google、Adobe Firefly、Doubao、Midjourney 标签，每次只显示一个平台。
- 键盘聚焦可预览资料面板，Tab 可继续进入资料。
- 点击卡片可固定展开；点击关闭按钮、外部区域或按 Escape 关闭。手机端通过点击打开。
- Tab 可从卡片进入面板，访问文献链接；政策标签支持左右方向键、Home 和 End。
- 面板内容过长时内部滚动；所有来源链接在新标签页打开。
- 内容来自所提供规格。Adobe 的官方当前页面仅能核实2026版本，因此只列这一条；暴力条目使用官方原文的范围，即禁止美化血腥暴力。

## 后续扩展

在 `index.html` 的 `whats-next` 区域之后添加后续屏幕。

`styles.css` 中的 `.keyword:nth-child(...)` 控制桌面关键词的位置与大小；三个轮次使用相同位置，避免布局无规则地跳动。`rounds.js` 中的顺序混合类别，不按评分类型分组。

## 评分说明

Visible +2，Assumption 0，Interpretation 0，Not supported −1；每轮下限0、上限10，总分30。性取向、性别认同和个人背景不会作为可见身份奖励。表达与气质的部分词仍带有主观性，详情中已说明。

## 浏览器检查

已使用 Microsoft Edge 检查三轮选择、取消选择、五词上限、键盘操作、满分与混合分数、最终详情、刷新重置、图片与字体路径，以及 1366×768、1440×900、1920×1080、1024×768、390×844 和 320×568 布局。
