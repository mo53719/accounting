# 智能记账

一个现代化的智能记账应用，帮助用户轻松管理个人财务，追踪收支情况，实现财务目标。

## 📱 主要功能

- 💰 **智能记账** - 快速记录收支信息，支持多种分类和标签
- 📊 **数据分析** - 详细的支出分析和趋势报告
- 📈 **预算管理** - 设定预算目标，实时监控支出情况
- 🏷️ **分类管理** - 自定义收支分类，灵活满足不同需求
- 💾 **数据同步** - 云端同步，多设备无缝切换
- 🔒 **数据安全** - 端到端加密，保护您的隐私

## 🛠️ 技术栈

- **前端框架**: Vue.js (73.6%)
- **编程语言**: TypeScript (19.7%)
- **样式**: CSS (3.9%)
- **后端**: Java (2.2%)
- **其他**: HTML, JavaScript, Batchfile

## 📦 安装

### 前置要求

- Node.js >= 14.0
- npm 或 yarn 包管理器
- Java >= 11 (后端)

### 项目安装

```bash
# 克隆仓库
git clone https://github.com/mo53719/accounting.git
cd accounting

# 安装依赖
npm install
# 或使用 yarn
yarn install
```

## 🚀 快速开始

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 应用将在 http://localhost:5173 打开（具体端口可能有所不同）
```

### 生产构建

```bash
# 构建项目
npm run build

# 预览生产构建
npm run preview
```

## 📁 项目结构

```
accounting/
├── src/                    # 源代码
│   ├── components/        # Vue 组件
│   ├── views/            # 页面视图
│   ├── stores/           # 状态管理
│   ├── api/              # API 接口
│   ├── utils/            # 工具函数
│   ├── styles/           # 全局样式
│   └── App.vue           # 应用根组件
├── public/               # 静态资源
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── README.md            # 本文件
```

## 🔧 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产环境构建 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 代码检查 |
| `npm run type-check` | TypeScript 类型检查 |

## 💻 使用指南

### 基本操作

1. **新建账目** - 点击"+"按钮快速记录收支
2. **分类管理** - 在设置中自定义收支分类
3. **查看统计** - 在数据分析页面查看收支趋势
4. **设置预算** - 为不同分类设置月度预算

### 导入/导出

支持导出账目数据为 CSV 或 Excel 格式，便于数据备份和进一步分析。

## 🔐 数据隐私

- 所有用户数据都经过加密处理
- 支持本地存储和云端备份
- 遵守数据保护相关法规

## 🐛 常见问题

**Q: 如何导出数据？**
A: 在设置菜单中点击"导出数据"，选择导出格式和时间范围。

**Q: 支持哪些货币？**
A: 目前支持常用的国际货币，包括 CNY、USD、EUR 等。

**Q: 数据会丢失吗？**
A: 应用支持自动备份，也可手动导出备份。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交 PR 的步骤

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 Vue 3 编码规范
- 提交前运行 `npm run lint`

## 📝 许可证

该项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 📧 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/mo53719/accounting/issues)
- 发送 Email: 通过 GitHub 联系

## 🙏 致谢

感谢所有为该项目做出贡献的开发者和用户的支持！

---

**最后更新**: 2026年6月20日
