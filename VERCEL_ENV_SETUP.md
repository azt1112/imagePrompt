# Vercel 环境变量配置指南

## 🚨 重要提示
`MIDDLEWARE_INVOCATION_FAILED` 错误通常是由于 Vercel 中缺少必需的环境变量导致的。请确保在 Vercel 项目设置中配置以下所有环境变量。

## 📋 必需的环境变量列表

### 🔐 认证相关 (Clerk)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### 🌐 应用配置
```
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
NEXTAUTH_URL=https://your-app-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 📧 邮件服务 (Resend)
```
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM=noreply@yourdomain.com
```

### 💳 支付服务 (Stripe)
```
STRIPE_API_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 🤖 AI 服务 (Coze)
```
COZE_API_TOKEN=pat_your_coze_access_token_here
COZE_WORKFLOW_ID=your_workflow_id_here
```

### 👨‍💼 管理员配置 (可选)
```
ADMIN_EMAIL=admin@yourdomain.com,root@yourdomain.com
IS_DEBUG=false
```

### 🔍 分析服务 (可选)
```
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 💰 Stripe 产品配置 (可选)
```
NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID=prod_your_product_id
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_your_monthly_price_id
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_your_yearly_price_id
NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID=prod_your_business_product_id
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_your_business_monthly_price_id
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID=price_your_business_yearly_price_id
```

## 🛠️ 如何在 Vercel 中配置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目
3. 进入 **Settings** 标签页
4. 点击左侧菜单中的 **Environment Variables**
5. 逐一添加上述环境变量

## ⚠️ 常见问题

### 问题 1: MIDDLEWARE_INVOCATION_FAILED
**原因**: 缺少必需的环境变量，特别是 Clerk 相关的变量
**解决方案**: 确保 `CLERK_SECRET_KEY` 和 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 已正确配置

### 问题 2: 环境变量不生效
**原因**: 添加环境变量后需要重新部署
**解决方案**: 在 Vercel Dashboard 中触发重新部署，或推送新的代码提交

### 问题 3: 本地开发正常，Vercel 部署失败
**原因**: 本地 `.env.local` 文件中的环境变量未同步到 Vercel
**解决方案**: 将本地环境变量逐一复制到 Vercel 环境变量设置中

## 🔧 最小化配置 (仅启用基本功能)

如果您只想快速测试应用，可以只配置以下最基本的环境变量：

```
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
NEXTAUTH_URL=https://your-app-domain.vercel.app
NEXTAUTH_SECRET=any_random_string_32_chars_long
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
RESEND_API_KEY=re_dummy_key_for_testing
RESEND_FROM=test@example.com
STRIPE_API_KEY=sk_test_dummy_key
STRIPE_WEBHOOK_SECRET=whsec_dummy_secret
COZE_API_TOKEN=pat_dummy_token
COZE_WORKFLOW_ID=dummy_workflow_id
```

## 📝 注意事项

1. **安全性**: 永远不要在代码中硬编码敏感信息
2. **环境区分**: 生产环境和测试环境使用不同的 API 密钥
3. **定期更新**: 定期轮换 API 密钥和秘钥
4. **权限控制**: 确保 API 密钥具有适当的权限范围

配置完成后，重新部署您的应用，错误应该会得到解决。