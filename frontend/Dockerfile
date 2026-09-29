FROM node:20-alpine AS build
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .

# Production build calls the API on the same origin (nginx proxies /api, /oauth2,
# /login to the backend below), so VITE_API_BASE_URL is left empty on purpose.
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm build

FROM nginx:1.27-alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# nginx image runs envsubst on every file in /etc/nginx/templates/*.template
# using $NGINX_PROXY (backend origin) at container start, output goes to
# /etc/nginx/conf.d/default.conf
ENV NGINX_PROXY=http://backend:8080

EXPOSE 6000
