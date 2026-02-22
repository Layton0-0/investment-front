# Frontend (Vite build). Image name: investment-frontend (ghcr.io)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# SPA 라우팅: 존재하지 않는 경로는 index.html로 fallback (새로고침 404 방지)
COPY nginx-default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
