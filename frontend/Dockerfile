# ---- Etapa 1: build (compila la SPA con Vite) ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci                 # completo: trae también vitest para la etapa de tests

COPY . .
RUN npm run build          # deja los estáticos en /app/dist

# ---- Etapa 2: tests (TP5; parte del build: ya tiene Node y las dependencias) ----
FROM build AS test
ENTRYPOINT ["npm", "run", "test:ci"]

# ---- Etapa 3: nginx sirve los estáticos (queda ÚLTIMA: es la imagen que se despliega) ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
