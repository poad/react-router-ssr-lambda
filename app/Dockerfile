FROM --platform=$BUILDPLATFORM node:lts AS builder-base

RUN npm -g i pnpm

WORKDIR /build
COPY package*.json ./
COPY pnpm*.yaml ./

FROM builder-base AS builder

RUN pnpm i
COPY . ./
RUN pnpm build

FROM --platform=$TARGETPLATFORM builder-base AS installer

RUN pnpm i --prod

# ベースイメージの変更
FROM --platform=$TARGETPLATFORM amazon/aws-lambda-nodejs:20

# Lambda Web Adapterのインストール
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.3 /lambda-adapter /opt/extensions/lambda-adapter
ENV PORT=8000
ENV HOSTNAME=0.0.0.0

COPY --from=installer /build/node_modules ./node_modules
COPY --from=builder /build/build ./build
COPY --from=builder /build/public ./public

# ベースイメージ変更に伴う調整
ENTRYPOINT ["exec"]
CMD ["./node_modules/.bin/remix-serve", "./build/index.js"]
