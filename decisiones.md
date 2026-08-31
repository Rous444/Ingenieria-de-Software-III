# Decisiones

## TP1 — Git colaborativo

### Por qué Git no pudo resolver el conflicto solo

Las ramas `feature/titulo-a` y `feature/titulo-b` salieron las dos de `main` y
modificaron **la misma línea** del `README.md`. Git fusiona automáticamente
cuando los cambios tocan partes distintas del archivo, pero acá no tiene forma
de saber cuál de las dos versiones es la correcta: es una decisión de
**contenido**, no de mecánica, y por eso la delega marcando el archivo.

Para que nunca hubiera aparecido, tendría que haber pasado una de dos cosas: que
las ramas tocaran líneas distintas, o que la B se hubiera integrado con `main`
antes de divergir. Es el argumento a favor de ramas cortas e integración
frecuente: no eliminan los conflictos, los mantienen chicos.

Resolví tomando una síntesis de las dos versiones y dejando un solo título,
porque las dos ramas habían **agregado** una línea arriba en vez de reemplazar
la existente, y el README quedaba con dos H1.

### Problemas encontrados

- **`gh` no estaba instalado.** La terminal contestaba que el comando no se
  reconocía. Lo instalé con `winget install --id GitHub.cli` y seguía fallando,
  hasta que entendí que el PATH no se refresca en una terminal que ya estaba
  abierta: había que cerrarla y volver a abrirla. El mensaje de error es
  idéntico para "no está instalado" y para "está instalado pero esta terminal
  no lo ve", que es lo que lo hace confuso.

- **`fatal: not a git repository`.** Me pasó al correr `git log` estando parado
  en la carpeta padre en vez de adentro del repositorio clonado. Los comandos de
  git sólo funcionan dentro del árbol de trabajo; el `clone` crea una carpeta
  nueva y hay que entrar en ella.

- **El nombre del repositorio tenía un typo** (`Softare` en vez de `Software`).
  Lo renombré desde *Settings → General* y actualicé mi copia local con
  `git remote set-url origin <url nueva>`. Lo corregí apenas lo detecté a
  propósito: la URL del repositorio es lo que se entrega en el formulario de la
  cátedra, y renombrarlo más tarde obliga a volver a cargarla.

- **La primera rama la bautizó GitHub.** Al commitear desde la web no completé
  el campo del nombre y quedó como `Rous444-patch-1`. La renombré a
  `feature/seccion-instalacion` desde la pestaña *Branches*, para respetar la
  convención de la materia (`feature/<descripcion>` y `fix/<descripcion>`). El
  nombre de la rama queda en el historial y en el PR, así que no es cosmético.

- **Al resolver el conflicto el README quedaba con dos títulos H1.** Los links
  de *Accept current / incoming change* del editor web sacan los marcadores pero
  no arreglan eso, así que edité el archivo a mano y borré el título duplicado.

### Declaración de uso de IA

Usé Claude como asistente durante todo el trabajo práctico.

**Qué hizo la IA:** ordenarme el trabajo, explicarme qué pedía cada punto de la
consigna, indicarme dónde estaba cada opción en la interfaz de GitHub,
advertirme sobre trampas concretas (que al activar *Require a pull request*
GitHub tilda solo *Require approvals* en 1 y hay que dejarlo en 0, o que la rama
B tiene que nacer de `main` o no hay conflicto), y proponer una primera
redacción de este archivo y de `evidencias.md`.

**Qué hice yo:** ejecutar cada comando y cada clic, y tomar las decisiones — el
nombre del repositorio, cómo resolver el conflicto, y qué escribir acá. Los
problemas de arriba son los que efectivamente me pasaron a mí.

**Cómo lo verifiqué:** contrastando cada afirmación contra lo que vi en
pantalla. Que el rechazo del push viene del servidor y no de mi git local lo
confirmé leyendo el error `GH006` y notando que las líneas venían prefijadas con
`remote:`. Que la protección quedó en cero aprobaciones lo verifiqué en el
propio Pull Request, donde GitHub dice *"at least 0 approving reviews are
required"*. El conflicto lo comprobé provocándolo y viendo los marcadores antes
de resolverlos. Y el resultado final del README lo revisé renderizado en GitHub,
no sólo en el editor.
## TP2 — Contenedores

### Qué app elegí y por qué

**Libreta del Rodeo**: registro de un rodeo de tambo (animales por caravana,
pesadas, partos, lotes y estados). La construí para esta materia, partiendo de
una maqueta en HTML que ya tenía hecha.

Contra los cinco criterios de la guía:

- **Corre hoy**: la levanté y la usé antes de contenerizarla.
- **Conozco los comandos de build y arranque**, en sus dos versiones: `npm run dev`
  para desarrollo y `npm ci` + `node src/index.js` para producción. Es exactamente
  lo que después escribí en el Dockerfile.
- **La configuración de la base es parametrizable**: entra por `DATABASE_URL` y no
  está escrita en el código, así que el mismo artefacto sirve local, en compose y
  (TP6) en QA y producción.
- **Tiene reglas para testear**: seis, en `backend/src/reglas.js`. Alcanzan para
  los 8 tests de backend del TP5 con casos válidos, inválidos y de borde.
- **La entiendo lo suficiente para modificarla**, que es condición del Integrador.

Descarté usar un CRM de un proyecto de equipo: el enunciado pide una aplicación
individual y distinta a la de los demás, y una app grupal no cumple ninguna de
las dos cosas.

### Decisiones de contenerización

**Imágenes base.** `node:22-alpine` para el backend y para la etapa de build del
frontend; `nginx:alpine` para la etapa final del frontend. Alpine porque la app no
necesita nada del sistema operativo más allá del runtime, y una base chica es
menos superficie de ataque y menos que transferir.

**Por qué multi-stage.** En el backend, la etapa de build instala dependencias y
la final sólo copia `node_modules`, el código y el `package.json`: no viajan el
cache de npm ni herramientas de compilación. En el frontend el contraste es mucho
mayor: el build necesita Node entero para compilar la SPA, pero la imagen final es
nginx con los estáticos encima — **no lleva ni Node ni una sola dependencia de
desarrollo**. Sin multi-stage, la imagen de producción cargaría todo el toolchain,
sería varias veces más grande y le daría a un atacante herramientas que no
necesita.

**Orden de las instrucciones.** En los dos Dockerfiles se copia primero
`package*.json` y se instala, y recién después el código. Como al cambiar una capa
Docker invalida esa y todas las siguientes, así tocar una línea de código no
vuelve a descargar las dependencias.

**Cómo se encuentran los servicios.** Compose crea una red interna con DNS, y cada
contenedor es alcanzable por su **nombre de servicio**: el backend se conecta a
`db:5432` y nginx reenvía `/api` a `backend:8080`. No hay una sola IP escrita en
ninguna parte.

El caso que no es obvio es el frontend: su JavaScript **se ejecuta en el navegador**,
que vive en mi máquina y no dentro de la red de compose, así que `http://backend:8080`
no resolvería. Por eso la SPA llama a `/api/...` con ruta relativa y quien traduce
es nginx, que sí corre dentro de la red. Efecto colateral: como para el navegador
todo sale del mismo origen, no hay que configurar CORS.

**`healthcheck` vs `depends_on`.** `depends_on` sólo garantiza el orden de
*arranque*, no que el servicio esté *listo*: que el contenedor de PostgreSQL haya
arrancado no significa que acepte conexiones. Por eso el servicio `db` tiene un
`healthcheck` con `pg_isready` y el backend declara `condition: service_healthy`.
Sin eso, el backend intenta conectarse a una base que todavía está inicializando y
muere en el arranque.

**Qué persiste y qué no.** Los contenedores son efímeros por diseño: su capa de
escritura muere con ellos. Por eso el estado vive en el volumen nombrado `db_data`,
montado en `/var/lib/postgresql/data`. Lo verifiqué en las dos direcciones:
`docker compose down` + `up` conserva los animales cargados, y `down -v` los borra.

**Dónde viven los secretos.** La contraseña de la base está en un `.env` que el
`.gitignore` excluye; lo que sí se commitea es `.env.example`, que dice qué
variables hacen falta sin sus valores. Por eso levantar el sistema son dos comandos
y no uno: `cp .env.example .env` y después `docker compose up -d`. Eso no es un
defecto del arranque — es la consecuencia de que el secreto sea lo único que no
puede viajar en el repositorio. En el TP4 esos secretos migran a los secrets de la
plataforma de CI.

**Arquitectura.** Construí las imágenes en una PC con procesador Intel/AMD, así que
son para `linux/amd64`. Alguien con un procesador ARM (una Mac con chip M) recibiría
`no matching manifest`. Para este TP alcanza con saberlo; en el TP7 se resuelve con
`docker buildx`, que construye para las dos arquitecturas a la vez.

### Problemas encontrados

- **El backend no leía `DATABASE_URL` y moría con `SASL: client password must be a
  string`.** El error hablaba de la contraseña, pero la causa era otra: **Node no
  lee el archivo `.env` por su cuenta**. Lo resolví separando los dos scripts:
  `dev` usa `node --env-file=.env` porque corre en mi máquina, y `start` no lo usa
  porque en contenedor las variables las inyecta el compose. Le agregué además a
  `db.js` un chequeo que falla con un mensaje claro si la variable no está.

- **La contraseña del `.env` no coincidía con la del contenedor.** La plantilla
  trae un valor de ejemplo y hay que editarla después de copiarla. Anoto el gotcha
  asociado: PostgreSQL fija la contraseña la primera vez que inicializa su volumen
  y después ignora la variable, así que cambiarla obliga a borrar el volumen.

- **`Cannot find module './browsers'` al levantar Vite.** Un `npm install`
  interrumpido dejó `node_modules` a medio instalar, y el error apuntaba a un
  paquete interno que yo nunca nombré. Se resolvió borrando `node_modules` y el
  lockfile e instalando de nuevo. Es exactamente el motivo por el que en el
  Dockerfile va `npm ci` (que respeta el lockfile) y por el que `node_modules/`
  está en el `.dockerignore`: para que la imagen nunca herede el estado de mi
  máquina.

- **El compose levantaba sólo la base.** `docker compose ps` mostraba únicamente
  `db`, y sin embargo `curl localhost:8080/health` contestaba. Quien contestaba era
  el backend viejo, el del `npm run dev`, que había quedado corriendo y ocupaba el
  puerto 8080 — por eso el backend del compose no podía arrancar, y como el
  frontend depende de él, tampoco. Fue el problema más instructivo: **el sistema
  parecía andar y no era el sistema**. Desde entonces verifico con `docker compose ps`
  y no sólo con que el puerto responda.

- **Creí que la prueba de persistencia había fallado.** Los animales que había
  cargado estaban en el PostgreSQL suelto que levanté con `docker run` para probar
  sin Docker, no en la base del compose, que es otra y tiene su propio volumen.
  Rehice la prueba cargando datos en la base correcta.

### Declaración de uso de IA

Usé Claude durante todo el práctico.

**Qué hizo la IA:** escribir el código de la aplicación siguiendo el modelo de datos
y las reglas que definí a partir de mi maqueta, redactar los Dockerfiles, el
compose y el `nginx.conf`, y diagnosticar los errores de arriba.

**Qué hice yo:** definir el dominio y las reglas de negocio, ejecutar todos los
comandos, y tomar las decisiones de qué construir y qué dejar afuera.

**Cómo lo verifiqué:** no di nada por bueno hasta verlo funcionar. La API la
comprobé con `curl` contra `/health` y `/api/animales`; las reglas las probé desde
la interfaz intentando romperlas a propósito (caravana repetida, fecha futura,
pesada absurda para la categoría, parto en un macho); la persistencia con el par
`down` / `down -v`; y que las imágenes fueran realmente públicas haciendo
`docker logout` antes del `pull`, porque que la página diga "Public" no prueba nada.
Los cinco problemas de arriba salieron justamente de que las cosas no funcionaron a
la primera.
