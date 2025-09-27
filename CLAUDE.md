# Saasfly 项目介绍

## 项目概述

Saasfly 是一个企业级的 Next.js SaaS 应用模板，提供了完整的开源解决方案来快速构建 SaaS 应用程序。该项目采用现代化的技术栈，包含了认证、支付、数据库、UI 组件等完整的功能模块。

## 🚀 技术栈

### 核心框架
- **Next.js 14** - 基于 React 的全栈框架，使用 App Directory
- **TypeScript** - 静态类型检查，提供端到端类型安全
- **React 18** - 用户界面构建库
- **Turbo** - Monorepo 构建系统，提供更好的代码管理

### 认证与授权
- **Clerk** - 综合用户管理平台（默认）
- **NextAuth.js** - Next.js 认证解决方案（可选）

### 数据库与 ORM
- **PostgreSQL** - 世界上最先进的开源数据库
- **Prisma** - 下一代 ORM，用作模式管理工具
- **Kysely** - TypeScript 类型安全的 SQL 查询构建器

### API 与状态管理
- **tRPC** - 端到端类型安全的 API
- **TanStack Query (React Query)** - 数据获取、缓存和更新
- **Zustand** - 轻量级 React 状态管理

### UI 与样式
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Shadcn/ui** - 基于 Radix UI 和 Tailwind CSS 的可重用组件
- **Framer Motion** - React 动画库
- **Lucide** - 精美的图标库

### 支付与邮件
- **Stripe** - 互联网业务支付处理
- **React Email** - 使用 React 组件创建邮件
- **Resend** - 开发者邮件营销平台

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Husky** - Git hooks 管理
- **Bun** - 快速的包管理器和运行时

### 部署与监控
- **Vercel** - 部署平台
- **Vercel Analytics** - 性能监控
- **PostHog** - 产品分析

## 📦 项目结构

```
saasfly/
├── apps/
│   ├── nextjs/          # 主要的 Next.js 应用
│   └── auth-proxy/      # 认证代理服务
├── packages/
│   ├── api/             # API 层
│   ├── auth/            # 认证工具
│   ├── db/              # 数据库模式和工具
│   ├── stripe/          # Stripe 集成
│   ├── ui/              # 共享 UI 组件
│   └── common/          # 通用工具
├── tooling/
│   ├── eslint-config/   # ESLint 配置
│   ├── prettier-config/ # Prettier 配置
│   ├── tailwind-config/ # Tailwind 配置
│   └── typescript-config/ # TypeScript 配置
└── turbo/               # Turbo 生成器配置
```

## ⭐ 主要功能

### 🔐 用户管理
- 用户注册和登录
- 社交登录集成
- 用户资料管理
- 权限控制

### 💳 支付系统
- Stripe 支付集成
- 订阅管理
- 发票生成
- 支付历史

### 🌐 国际化
- 多语言支持
- 本地化配置
- 动态语言切换

### 📊 管理后台
- 管理员仪表板（Alpha 版本）
- 用户管理
- 数据统计
- 系统配置

### 🎨 现代化 UI
- 响应式设计
- 深色/浅色主题切换
- 动画效果
- 移动端优化

### 📧 邮件系统
- 邮件模板
- 自动化邮件发送
- 邮件追踪

## 🛠 环境要求

- **Node.js** >= 18
- **Bun** (推荐) 或 npm/yarn
- **PostgreSQL** 数据库
- **Git**

## 🚀 快速启动

### 1. 克隆项目

```bash
# 使用 bun create（推荐）
bun create saasfly

# 或手动克隆
git clone https://github.com/saasfly/saasfly.git
cd saasfly
bun install
```

### 2. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env.local

# 配置必要的环境变量
# - POSTGRES_URL: 数据库连接字符串
# - NEXTAUTH_SECRET: NextAuth 密钥
# - STRIPE_API_KEY: Stripe API 密钥
# - CLERK_SECRET_KEY: Clerk 密钥（如使用 Clerk）
```

### 3. 数据库设置

```bash
# 推送数据库模式
bun db:push
```

### 4. 启动开发服务器

```bash
# 启动完整开发环境
bun run dev

# 或仅启动 Web 应用（不包含 Stripe）
bun run dev:web
```

### 5. 访问应用

- 主应用: http://localhost:3000
- Tailwind 配置查看器: http://localhost:3333 (可选)

## 📝 可用脚本

```bash
# 开发
bun run dev              # 启动所有服务
bun run dev:web          # 启动 Web 应用（排除 Stripe）

# 构建
bun run build            # 构建所有包

# 代码质量
bun run lint             # 代码检查
bun run lint:fix         # 自动修复代码问题
bun run format           # 代码格式化
bun run format:fix       # 自动格式化代码
bun run typecheck        # 类型检查

# 数据库
bun run db:push          # 推送数据库模式

# 清理
bun run clean            # 清理 node_modules
bun run clean:workspaces # 清理工作区
```

## 🔧 部署

### Vercel 部署（推荐）

1. 点击 "Deploy with Vercel" 按钮
2. 配置环境变量
3. 自动部署完成

### 手动部署

```bash
# 构建项目
bun run build

# 启动生产服务器
bun run start
```

## 📚 文档

- 在线文档: https://document.saasfly.io
- 演示站点: https://show.saasfly.io
- GitHub: https://github.com/saasfly/saasfly

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解贡献指南。

## 📄 许可证

本项目采用 MIT 许可证。详情请查看 [LICENSE](./LICENSE) 文件。

## 💬 支持

- Discord: https://discord.gg/8SwSX43wnD
- 邮箱: contact@nextify.ltd
- GitHub Issues: https://github.com/saasfly/saasfly/issues

---

*Saasfly 由 [Nextify](https://nextify.ltd) 开发维护，致力于为开源项目和慈善事业做出贡献。*