# 🏺 瓷板画数字确权与交易平台

一个基于区块链技术的瓷板画非遗数字确权与交易平台，致力于将传统瓷板画艺术与现代区块链技术相结合，为每件作品提供唯一的数字身份认证。通过数字化确权，确保艺术品的真实性和所有权，让传统艺术在数字时代焕发新生。

## ✨ 平台特色

### 🔒 数字确权
- **唯一数字身份**：为每件瓷板画作品提供唯一数字身份认证
- **链上存证**：基于区块链技术，确保作品信息不可篡改
- **所有权验证**：通过智能合约确保艺术品的真实性和所有权
- **版权保护**：支持 EIP-2981 版税标准，保障创作者权益

### 💎 价值保障
- **安全交易**：通过智能合约确保艺术品交易的安全性和透明度
- **价值链接**：将传统艺术价值与数字资产价值相结合
- **版税机制**：自动分配创作者版税，保障艺术家持续收益
- **交易历史**：完整记录艺术品的交易历史和价格变动

### 🎨 艺术传承
- **大师连接**：连接传统工艺大师与数字艺术收藏家
- **文化传播**：促进中国传统瓷板画文化的传承与创新
- **艺术教育**：提供瓷板画工艺知识和历史背景
- **创作支持**：为艺术家提供数字创作和发布平台

### 🌐 全球市场
- **跨境交易**：打造全球化的瓷板画数字艺术交易平台
- **多语言支持**：支持多种语言，服务全球用户
- **文化输出**：将中国瓷板画艺术推向世界
- **社区构建**：建立全球瓷板画艺术爱好者社区

## 🛠️ 技术架构

### 前端技术
- **框架**：Next.js 13 (App Router)
- **样式**：TailwindCSS + DaisyUI
- **动画**：Framer Motion
- **Web3 集成**：wagmi + viem
- **响应式设计**：支持各种设备的最佳浏览体验

### 区块链技术
- **智能合约**：基于 Solidity 开发的 NFT 合约
- **合约标准**：支持 ERC-721、ERC-1155、ERC-2981 等标准
- **链下存储**：使用 IPFS 存储元数据和媒体文件
- **多链支持**：兼容以太坊、Polygon 等多条区块链

### 安全保障
- **合约审计**：经过专业安全团队审计的智能合约
- **权限控制**：严格的角色权限控制机制
- **交易验证**：多重签名和交易确认机制
- **数据加密**：敏感信息加密保存

## 🚀 快速开始

### 环境准备
- Node.js >= 18.17
- Yarn >= 1.22
- Git

### 1. 克隆项目
```bash
git clone https://github.com/huahuahua1223/Porcelain-painting.git
cd Porcelain-painting
```

### 2. 安装依赖
```bash
yarn install
```

### 3. 环境配置
复制并配置环境变量:
```bash
cp packages/hardhat/.env.example packages/hardhat/.env
cp packages/nextjs/.env.example packages/nextjs/.env.local
```

### 4. 启动开发环境
```bash
# 终端 1: 启动本地区块链
yarn chain

# 终端 2: 部署合约
yarn deploy

# 终端 3: 启动前端
yarn start
```

## 📦 项目结构

```
packages/
├── hardhat/                # 智能合约开发
│   ├── contracts/         # 合约源码
│   ├── deploy/           # 部署脚本
│   └── test/            # 测试文件
│
└── nextjs/                # 前端应用
    ├── app/              # 页面组件
    │   ├── create/       # 创建NFT页面
    │   ├── market/       # 市场交易页面
    │   └── page.tsx      # 首页
    ├── components/       # 通用组件
    ├── hooks/           # 自定义 Hooks
    └── utils/           # 工具函数
```

## 🖥️ 主要功能

### 首页
- 展示平台介绍、特色和最新艺术品
- 动态浮动图片和精美动画效果
- 平台简介和特色功能展示

### 艺术品浏览
- 按类别、艺术家、价格等多维度筛选
- 详细的艺术品信息和历史背景
- 高清图片展示和3D模型查看

### 创作与铸造
- 支持上传图片、视频、3D模型等多种媒体
- 自定义元数据和属性设置
- 批量铸造和版税设置
## 📚 更多文档

- [合约文档](./docs/contracts.md)
- [API 文档](./docs/api.md)
- [部署指南](./docs/deployment.md)

## 🤝 如何贡献

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)
- [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [wagmi](https://wagmi.sh/)
- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
