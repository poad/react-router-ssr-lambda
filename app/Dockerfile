# Multi-stage buildでアプリをビルド
FROM --platform=linux/arm64 node:lts-slim AS builder
WORKDIR /build
COPY package*.json ./
RUN npm i
COPY . ./
RUN npm run build

# ベースイメージの変更
FROM --platform=linux/arm64 amazon/aws-lambda-nodejs:22-arm64

# Lambda Web Adapterのインストール
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0-aarch64 /lambda-adapter /opt/extensions/lambda-adapter
ENV PORT=3000

COPY server/server.js ./
COPY --from=builder /build/package.json ./
COPY --from=builder /build/build ./build
COPY --from=builder /build/node_modules ./node_modules

# ベースイメージ変更に伴う調整
ENTRYPOINT ["npm"]
CMD ["run", "start"]