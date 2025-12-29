FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  libc6-compat

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ---- NGINX STAGE ----
FROM nginx:latest

COPY ./nginx-conf/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
