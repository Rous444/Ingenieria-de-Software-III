# Libreta del Rodeo

Registro de un rodeo de tambo: alta de animales por caravana, ficha individual
con pesadas y partos, y control del estado de cada animal. Es la aplicación del
semestre para **Ingeniería del Software 3** (UCC, 2026): sobre ella se construye
el pipeline de entrega, TP a TP.

**Stack:** Node/Express + PostgreSQL en el backend · React/Vite servido por nginx
en el frontend.

## Levantarlo en una máquina limpia

Único requisito: **Docker** ([instalación](https://docs.docker.com/get-docker/)).
No hace falta tener instalados Node ni PostgreSQL.

### Opción A — desde las imágenes publicadas (no necesita el código)

```bash
cp .env.example .env      # en Windows: copy .env.example .env
docker compose -f docker-compose.registry.yml up -d
```

### Opción B — construyendo desde el código

```bash
cp .env.example .env      # en Windows: copy .env.example .env
docker compose up -d --build
```

**Son dos comandos, no uno, y eso no es un defecto.** El `.env` lleva la
contraseña de la base y por eso no está en el repositorio: el secreto es lo único
que no puede viajar con el código. El `.env.example` que sí está commiteado dice
qué variables hacen falta, sin sus valores.

> Editá el `.env` antes de levantar y poné una contraseña propia en
> `DB_PASSWORD`. PostgreSQL la fija la primera vez que inicializa su volumen y
> después ignora la variable: cambiarla más tarde obliga a borrar el volumen con
> `docker compose down -v`, con la pérdida de datos que eso implica.

Cuando termine:

| | |
|---|---|
| Aplicación | http://localhost:3000 |
| API | http://localhost:8080 |
| Estado de la API | http://localhost:8080/health |

La base arranca **vacía**, a propósito: no hay datos de ejemplo. El primer animal
lo cargás vos desde la aplicación.

Para apagar: `docker compose down` (los datos quedan en el volumen) o
`docker compose down -v` (borra también los datos).

## Imágenes publicadas

- `ghcr.io/rous444/rodeo-backend:v0.1.0`
- `ghcr.io/rous444/rodeo-frontend:v0.1.0`

Las dos son públicas: se pueden descargar sin credenciales.

## Cómo está armado

Tres servicios en la red interna que crea compose, donde cada uno alcanza a los
otros **por su nombre de servicio**:

```
navegador ──▶ frontend (nginx :80) ──/api──▶ backend (:8080) ──▶ db (:5432)
                    │                                              │
              sirve la SPA                                   volumen db_data
```

Dos decisiones que explican el diseño:

- **El frontend llama a `/api/...` con ruta relativa**, sin host ni puerto en el
  código. En desarrollo lo traduce el proxy de Vite; en contenedor lo traduce
  nginx, que sí corre dentro de la red. Así la misma imagen sirve en cualquier
  entorno, y como para el navegador todo sale del mismo origen, no hay CORS.
- **La configuración entra por variables de entorno**, no por el código. El
  backend recibe `DATABASE_URL`; hoy apunta al servicio `db`, mañana puede
  apuntar a otra base sin reconstruir la imagen.

## Desarrollo sin Docker

```bash
docker run -d --name pg-rodeo -e POSTGRES_PASSWORD=rodeo -e POSTGRES_DB=rodeo -p 5432:5432 postgres:16-alpine

cd backend  && npm install && cp .env.example .env && npm run dev   # :8080
cd frontend && npm install && npm run dev                           # :5173
```

## Reglas de negocio

Viven en `backend/src/reglas.js` como funciones puras, sin dependencias de la
base ni de Express:

1. La caravana es única.
2. La categoría se calcula (no se carga) a partir del sexo y la edad: ternero/a,
   vaquillona, novillito, novillo, vaca.
3. La fecha de nacimiento no puede ser futura.
4. El peso debe ser positivo y coherente con la categoría del animal.
5. Transiciones de estado: `activo → vendido` o `activo → muerto`, sin vuelta atrás.
6. Sólo se registra un parto de una hembra que tuviera al menos 24 meses a esa fecha.
