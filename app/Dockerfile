# Multi-stage buildでアプリをビルド
FROM --platform=linux/amd64 node:lts-slim AS builder
WORKDIR /build
COPY package*.json ./
RUN npm i
COPY . ./
RUN npm run build

# ベースイメージの変更
FROM --platform=linux/amd64 amazon/aws-lambda-nodejs:22-x86_64

# Lambda Web Adapterのインストール
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
ENV PORT=3000

RUN npm -g install pnpm
COPY server/server.js ./
COPY --from=builder /build/package.json ./
COPY --from=builder /build/build ./build
COPY --from=builder /build/node_modules ./node_modules

# ベースイメージ変更に伴う調整
ENTRYPOINT ["pnpm", "start"]
