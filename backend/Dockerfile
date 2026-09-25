# ---- Etapa 1: build (dependencias completas + código) ----
FROM node:22-alpine AS build
WORKDIR /app

# El package.json y el lockfile PRIMERO, y el código después. Así, mientras
# no cambien las dependencias, Docker reutiliza la capa del npm ci y no vuelve
# a descargar nada aunque toques el código.
COPY package*.json ./
# TP5: acá ya NO va --omit=dev. La etapa de tests necesita vitest, que es una
# dependencia de desarrollo; la imagen final instala las suyas aparte (etapa 3)
# y no se lleva nada de esto.
RUN npm ci
COPY . .

# ---- Etapa 2: tests (parte del build: ya tiene Node, vitest y el código) ----
# El ENTRYPOINT no corre en el `docker build`: corre en el `docker run` del
# pipeline, que monta una carpeta para sacar el reporte de cobertura.
FROM build AS test
ENTRYPOINT ["npm", "run", "test:ci"]

# ---- Etapa 3: runtime (imagen final, sin herramientas de build ni tests) ----
FROM node:22-alpine AS final
WORKDIR /app
ENV NODE_ENV=production

# Sólo las dependencias de producción, y sólo el código de la app: ni vitest,
# ni la carpeta test/, ni la configuración de los tests.
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src

# Node corre como root por defecto; la imagen trae un usuario sin privilegios.
USER node

EXPOSE 8080
CMD ["node", "src/index.js"]
