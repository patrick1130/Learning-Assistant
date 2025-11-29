# 阶段 1：安装依赖
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./ 
RUN npm ci

# 阶段 2：构建应用
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 开始构建 Next.js 应用
RUN npm run build

# 阶段 3：生产环境运行
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# 创建用户以提高安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物 (Standalone 模式)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非 root 用户
USER nextjs

# 暴露端口 3000
EXPOSE 3000
ENV PORT 3000

# 启动命令
CMD ["node", "server.js"]