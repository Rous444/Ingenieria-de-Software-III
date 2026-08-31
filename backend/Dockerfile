# ---- Etapa 1: build (instala dependencias) ----
FROM node:22-alpine AS build
WORKDIR /app

# El package.json y el lockfile PRIMERO, y el código después. Así, mientras
# no cambien las dependencias, Docker reutiliza la capa del npm ci y no vuelve
# a descargar nada aunque toques el código.
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Etapa 2: runtime (imagen final, sin herramientas de build) ----
FROM node:22-alpine AS final
WORKDIR /app
ENV NODE_ENV=production

# Sólo viajan las dependencias ya instaladas y el código: nada del toolchain.
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

# Node corre como root por defecto; la imagen trae un usuario sin privilegios.
USER node

EXPOSE 8080
CMD ["node", "src/index.js"]
