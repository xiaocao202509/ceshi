# ceshi

该仓库包含一个用于 Chrome 插件弹出页的前端界面示例，位于 [`extension-ui/`](extension-ui/) 目录。

## 预览方式

直接在浏览器中打开 `extension-ui/index.html` 文件即可查看界面效果。若需作为插件弹出页使用，可在 Chrome 扩展程序的 `manifest.json` 中将该文件配置为 `action.default_popup`。

## 主要特性

- 💡 主题切换：支持亮色与暗色两种主题，并通过 `localStorage` 记忆用户选择。
- ⏱️ 番茄钟：内置 25 分钟倒计时，支持开始、暂停与重置。
- 📝 速记功能：允许添加、删除速记内容，并持久化到本地存储。
- ⚙️ 设置开关：自定义常用插件偏好，同样支持本地存储记忆。

所有交互逻辑位于 `extension-ui/script.js` 中，视觉样式定义在 `extension-ui/styles.css`。
