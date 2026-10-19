# Decisiones

## Enlaces del TP7

Lo que vive afuera del repositorio, y las corridas que importan entre todas:

**(a) Los dos paquetes públicos del registry** (`docker pull` sin credenciales; cada merge a `main` publica una imagen con la etiqueta `sha-<commit completo>`, y es la que ejecutan QA y PROD):
- Backend: https://github.com/Rous444/Ingenieria-de-Software-III/pkgs/container/ingenieria-de-software-iii-backend
  (`docker pull ghcr.io/rous444/ingenieria-de-software-iii-backend:sha-95294ff03b33154ae917325f8204694d416f5966`)
- Frontend: https://github.com/Rous444/Ingenieria-de-Software-III/pkgs/container/ingenieria-de-software-iii-frontend
  (`docker pull ghcr.io/rous444/ingenieria-de-software-iii-frontend:sha-95294ff03b33154ae917325f8204694d416f5966`)

**(b) La corrida donde la integración quedó VERDE y la e2e ROJA, y la promoción no se pidió:**
- El commit que rompió la app (sólo `frontend/src/api.js`, nada de `e2e/`): https://github.com/Rous444/Ingenieria-de-Software-III/commit/12cb76455a9dfb0c2b16f4bb39fc7826ae7e40d5 (PR #40)
- La corrida: https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/38842299907
- Reporte de integración, en verde: https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/38842299907/artifacts/12020799707 (`playwright-report-integracion`)
- Reporte e2e, en rojo, con capturas y traza: https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/38842299907/artifacts/12021539784 (`playwright-report-e2e`)

**(c) La corrida completa en verde posterior, hasta PROD** (el arreglo, PR #41: build → deploy-qa → integración → e2e → aprobación → deploy-prod): https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/38842991986

Otras dos que cuentan la historia:
- Primer deploy con `imgURL` (los cuatro servicios pasan a ejecutar la imagen, PR #38): https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/38840716088
- Primera corrida con las dos suites como gate, todo en verde (PR #39): https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/38841201731

**(d) Los entornos** (vivos hasta la defensa; el primer pedido puede tardar ~1 minuto por el cold start). `/health` devuelve el commit de la imagen que está corriendo:

| | Front | API |
|---|---|---|
| QA | https://rodeo-front-qa.onrender.com | https://rodeo-api-qa-zzyl.onrender.com/health |
| PROD | https://rodeo-front-prod.onrender.com | https://rodeo-api-prod.onrender.com/health |

Lo único que no se puede linkear son los *Events* de Render: los muestro en vivo en la defensa (cada deploy dice «Triggered via Deploy Hook» y nombra la imagen `sha-<commit>` de su corrida).

## Enlaces del TP6

Lo que no se encuentra navegando el repositorio:

**Los dos paquetes del registry** (públicos; `docker pull` sin credenciales, etiquetados con el commit de un merge a `main`):
- Backend: https://github.com/Rous444/Ingenieria-de-Software-III/pkgs/container/ingenieria-de-software-iii-backend
  (`docker pull ghcr.io/rous444/ingenieria-de-software-iii-backend:sha-3a1c2d14e8611a180cce789babfad4f76f2224cc`)
- Frontend: https://github.com/Rous444/Ingenieria-de-Software-III/pkgs/container/ingenieria-de-software-iii-frontend
  (`docker pull ghcr.io/rous444/ingenieria-de-software-iii-frontend:sha-3a1c2d14e8611a180cce789babfad4f76f2224cc`)

**La cadena que hace confiable al registry:**
1. Un Pull Request con los tests en verde que **no publicó** («Entrar al registry» salteado): https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/36607415840
2. Una corrida de `main` donde «Construir y publicar la imagen» es el **último** de mis pasos, después de los tests: https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/36607788092

**Los entornos** (vivos hasta la defensa; el primer pedido puede tardar ~1 minuto por el cold start):

| | Front | API |
|---|---|---|
| QA | https://rodeo-front-qa.onrender.com | https://rodeo-api-qa-zzyl.onrender.com/health |
| PROD | https://rodeo-front-prod.onrender.com | https://rodeo-api-prod.onrender.com/health |

**El gate hacia PROD:**
- Rechazo con motivo (intento #3): https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/38822485118
- Aprobación con un cambio visible, PROD desplegado y smoke en verde: https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/38823700910
- Primer deploy a QA (con la falla del DNS y su re-ejecución en verde): https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/38814915355

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

## TP3 — Planificación y trazabilidad

### Duración del sprint y por qué

**Una semana.** La elegí alineada con el ritmo real de la materia: se dicta un
práctico por semana y cada uno se cierra con su tag y su release, así que el
sprint coincide con la unidad de trabajo que ya existe. Un sprint de dos o tres
semanas me daría un ciclo de feedback más largo que el propio ritmo de entrega —
me enteraría de que algo no entra recién cuando ya es tarde para renegociarlo.

Y hay una razón de método además de la práctica: lo que se compromete en un sprint
es el **objetivo**, no la lista de ítems, que es un pronóstico. Con una semana, si
el pronóstico falla, la corrección llega a tiempo.

### Límite de trabajo en progreso y por qué ese número

**2.** La regla de arranque es *cantidad de personas + 1*, y trabajo solo. El "más
uno" es la válvula para cuando algo queda esperando —una revisión, una respuesta,
un build corriendo— y necesito avanzar en otra cosa sin dejar de tener una sola
tarea realmente en curso. Pasarme de ahí haría que el límite deje de limitar.

El concepto viene de **Kanban** y es la traducción operativa de *empezar menos,
terminar más*: el trabajo empezado y no terminado no es productividad, es
**inventario**, y el inventario cuesta — más cambio de contexto, más ramas viejas,
más conflictos al integrar. La señal de que el número quedó **alto** sería que
nunca lo alcance; la de que quedó bajo, que quede bloqueado esperando sin poder
avanzar en nada.

Un matiz que conviene tener claro: GitHub pone el contador en rojo cuando la
columna se llena, pero **deja pasar**. El límite es un acuerdo de trabajo, no un
candado de la herramienta.

### Diagnóstico de la historia mal escrita

La historia del ejercicio era: *"Como desarrollador quiero crear la tabla usuarios
para guardar los datos."*

**Por qué está mal:** el usuario de una historia es **quien recibe el valor**, no
quien programa. "Crear una tabla" es trabajo técnico — una **tarea**, no una
historia: nadie *quiere* una tabla. Y el "para" no aporta un beneficio observable,
sino la misma frase técnica dicha de otra forma; si el beneficio no se puede
escribir, probablemente la historia no exista. Tampoco es testeable: no hay ningún
criterio que un tercero pueda verificar sin mirar el esquema de la base.

**Cómo la reescribiría**, en el dominio de mi app: *"Como encargado del tambo
quiero registrar cada animal con su número de caravana para tener el inventario
del rodeo actualizado sin depender de planillas de papel."* La creación de la
tabla pasa a ser una **tarea** colgada de esa historia, que es su lugar.

### Problemas encontrados

- **Los cuerpos multilínea de los issues se truncaron al crearlos con `gh`.** No
  fue culpa de `gh` sino de `cmd`: no admite texto con saltos de línea entre
  comillas, así que tomó la primera línea como cuerpo e intentó ejecutar el resto
  como comandos. La historia quedó sin sus criterios de aceptación y el bug sin el
  "qué esperaba" ni el "cómo reproducirlo". Los completé editando el cuerpo desde
  la web. La alternativa correcta por consola habría sido `--body-file`.

- **El Project nace privado y el entregable es la URL.** Si lo hubiera entregado
  así, quien abriera el link vería un 404 — ni siquiera un "no tenés permiso".
  Lo pasé a Public en `⋯ → Settings → Visibility` y lo verifiqué abriendo la URL
  en una ventana de incógnito, que es la única prueba que vale.

- **La jerarquía tuve que armarla con sub-issues, no con task-lists.** Una
  task-list en el cuerpo del issue se ve parecida, pero no crea la relación
  padre-hijo navegable: no permite subir de la tarea a su historia y de ahí a la
  épica, que es justamente el requisito.

- **Perdí esta sección una vez por un `git reset --hard`.** La tenía escrita sin
  commitear y corrí un `reset --hard origin/main` para sincronizar antes de crear
  la rama; el reset descarta los cambios no commiteados y se la llevó. El síntoma
  fue que GitHub no me ofrecía crear el Pull Request: la rama era idéntica a
  `main` porque no había nada que comparar. Aprendizaje: commitear primero,
  sincronizar después.

### Declaración de uso de IA

Usé Claude para ordenar el trabajo del práctico, explicarme dónde estaba cada
opción de la interfaz de Projects, advertirme de las trampas (que el Project nace
privado, que las task-lists no cumplen el requisito de jerarquía navegable, que
`Closes` va en la descripción del PR y con el número de la tarea y no de la
historia) y redactar el borrador de esta sección.

Las decisiones son mías: la duración del sprint, el número del límite de trabajo
en progreso, y la reescritura de la historia mal escrita en el dominio de mi
aplicación.

**Cómo lo verifiqué:** abriendo la URL del Project en incógnito para confirmar que
es pública; comprobando en el propio tablero que la épica muestra su historia como
sub-issue y la historia sus dos tareas; y navegando la vuelta completa después del
merge — desde la tarea cerrada al Pull Request que la cerró, de ahí al commit, y
subiendo a la historia y a la épica.

## TP4 — CI: Pipelines as Code

### Estructura del pipeline: por qué esos jobs y por qué en paralelo

Dos jobs, `build-backend` y `build-frontend`, uno por cada imagen que compone el
sistema. Están separados porque **son verificaciones independientes**: que el
backend compile no dice nada sobre el frontend, y viceversa. Al separarlos, cuando
algo se rompe el propio nombre del check en rojo ya dice dónde mirar — lo vi en la
demostración del gate, donde `build-frontend` quedó en rojo y `build-backend` en
verde.

Corren **en paralelo** porque cada job arranca en su propia máquina limpia y no
dependen uno del otro: el tiempo total es el del más lento, no la suma. Y por eso
mismo **no comparten filesystem**: si uno necesitara algo que produjo el otro,
habría que pasarlo como artefacto o declarar `needs:`.

### Por qué el pipeline construye con mi Dockerfile en vez de compilar por su cuenta

Para no tener **dos definiciones de build**. Si el workflow instalara dependencias
y compilara con `npm` por su lado, tendría una forma de construir en CI y otra en
el Dockerfile, y tarde o temprano divergen: estaría verificando una compilación
distinta de la que después se despliega.

Usando `docker/build-push-action` con el `context` de cada carpeta, el pipeline
construye **exactamente el mismo artefacto** que corre en mi máquina y que va a
correr en producción. Efecto colateral que se nota leyendo el YAML: no hay una
sola línea de Node ni de npm. El workflow no sabe qué hay adentro del Dockerfile —
por eso el mismo archivo le serviría a un compañero con otro stack.

### Qué cachea el pipeline y qué pasa si el cache desaparece

Cachea las **capas de las imágenes**, no dependencias sueltas. Se guardan en el
almacén de GitHub Actions (`type=gha`), no en el Docker del runner, que nace vacío
en cada corrida.

Cuáles se reutilizan lo decide el orden del Dockerfile: como en los dos se copia
primero `package*.json` y se instala, y recién después el código, mientras no
cambien las dependencias esa capa se reutiliza y sólo se rehace lo posterior. Por
eso el `build-backend` de la demostración tardó 13 segundos y el `build-frontend`
36: el segundo tenía que rehacer el `npm run build` porque el código había
cambiado.

Cada job tiene su **`scope` propio** (`scope=backend` y `scope=frontend`). No es
opcional y su ausencia no da error: sin scope los dos comparten el mismo estante y
se pisan — el último en terminar deja su cache y borra el del otro. El síntoma es
desconcertante porque parece azar: un job muestra `CACHED` y el otro no, y cuál
cambia de una corrida a la otra.

**Si el cache desaparece, el pipeline funciona igual, sólo que más lento.** La
plataforma lo desaloja cuando quiere y tiene límite de tamaño, así que no se puede
depender de él. Si el pipeline *fallara* sin cache, no sería un cache: sería una
dependencia escondida, y eso es un bug.

También hizo falta `docker/setup-buildx-action`: el constructor de fábrica de
Docker guarda las capas en el disco de la máquina y no sabe exportarlas a un
almacén externo. Sin ese paso el build **falla**, con un error que dice que el
driver `docker` no soporta exportar cache.

### El gate

`main` exige ahora **dos** condiciones para aceptar un merge: que el cambio venga
por Pull Request (la protección del TP1) y que `build-backend` y `build-frontend`
estén en verde (required status checks del TP4). La puerta sin verificación no
alcanza, y la verificación sin puerta tampoco.

Activé además `strict` (*require branches to be up to date*), que exige que la
rama esté actualizada con `main` antes de mergear: un verde sacado contra un `main`
viejo no prueba que la mezcla actual funcione.

Las aprobaciones siguen en **0**, igual que en el TP1: el trabajo es individual y
GitHub nunca permite aprobar el propio Pull Request. Lo que bloquea acá no es una
aprobación humana, es el pipeline.

Un detalle que aprendí configurándolo: el nombre del check sale del **id del job**,
no del `name:` del workflow ni del de los steps. Si le pusiera un `name:` al job
después de cablear el gate, el gate quedaría esperando un check que ya no existe y
bloquearía todos los PRs.

### La demostración del gate

Rompí el build a propósito agregando `import noExiste from './no-existe.js'` en
`frontend/src/App.jsx`. Elegí romper el **frontend** y no el backend porque mi
stack no compila en el sentido clásico: Express no tiene paso de compilación, así
que romper su código no cambiaría nada — nadie lo ejecuta durante el `docker
build`. El frontend, en cambio, se empaqueta: Vite resuelve los imports al hacer
`npm run build` y falla ahí. Si hubiera querido romper el backend, habría tenido
que agregar un paquete inexistente al `package.json`.

La secuencia quedó registrada en el Pull Request: `build-frontend` en rojo marcado
como *Required*, el botón de merge deshabilitado, el commit que saca la línea, los
dos checks en verde, y el merge. Alcanza con que **uno** de los dos se ponga en
rojo para bloquear.

Dejé además un segundo Pull Request abierto al mismo tiempo, porque el `strict` no
se puede demostrar con uno solo: al mergear el primero, el segundo mostró el botón
**Update branch** — su verde había quedado viejo.

### Problemas encontrados

- **El primer intento de gate no encontraba los checks.** El buscador de *require
  status checks* sólo ofrece checks que corrieron en los últimos 7 días, así que
  antes de configurarlo hay que dejar correr el workflow al menos una vez. No
  estaba roto: era el orden.

- **Mergeé el PR del pipeline antes de hacer las dos corridas seguidas** que
  muestran el cache reutilizando capas dentro del mismo PR. No lo perdí del todo:
  al correr el workflow sobre `push` a `main`, esa corrida deja el cache disponible
  para la rama base, y los PRs posteriores lo reutilizan desde su primera corrida.
  Pero el orden correcto habría sido hacer las dos corridas en el PR antes de
  mergear.

- **El badge quedó al final del README.** Funcionaba, pero un badge existe para que
  cualquiera que entre al repositorio vea el estado del build sin buscarlo; al
  final del archivo no cumple esa función. Lo moví debajo del título.

### Declaración de uso de IA

Usé Claude para redactar el workflow, explicarme qué hace cada clave del YAML
(sobre todo el mecanismo del cache y por qué el `scope` no es opcional), guiarme en
la configuración del gate y diagnosticar los errores de arriba.

Ejecuté yo cada paso y verifiqué los resultados contra lo que se veía en pantalla:
que los dos jobs aparecieran en paralelo en la corrida, que los checks figuraran
como *Required* en el Pull Request, que el merge quedara efectivamente bloqueado
con el check en rojo, que se destrabara al arreglarlo, que el segundo PR mostrara
el *Update branch*, y que el badge lleve al historial de corridas y no a un SVG
suelto.

## TP5 · Calidad automatizada: tests, cobertura y el umbral que frena un merge

### Qué lógica testeo y por qué ésa

En la Libreta del Rodeo un bug no rompe la pantalla: **ensucia el registro**, y el
registro es lo que el productor usa para decidir. Una vaquillona cargada como vaca,
un parto registrado a una hembra de 20 meses o una pesada de 800 kg en un ternero
no dan ningún error; quedan guardados y después se toman decisiones sobre datos
falsos. Por eso la suite se concentra en las reglas que deciden qué entra a la base:

| Regla | Dónde duele el bug |
|---|---|
| 1. Categoría por sexo y edad (`categoriaDe`) | Los bordes de 12 y 24 meses: un mes de error cambia la categoría y, con ella, el rango de peso válido |
| 2. Alta de animal (`validarAnimal`) | Caravana vacía o fecha futura: un animal que no se puede identificar |
| 3. Pesadas (`validarPesada`) | Un dedo equivocado (800 en vez de 80) arruina la curva de engorde |
| 4. Partos (`validarParto`) | El borde de 24 meses exactos, y partos de machos |
| 5 y 6. Estados (`transicionValida`, `admiteNovedades`) | Un animal vendido o muerto que "revive" o sigue recibiendo pesadas |
| 7. Ganancia diaria (`gananciaDiaria`) | Es EL número del engorde; si da mal, se engorda a ciegas |

Los casos de borde no están de adorno: están puestos para que **invertir una regla
ponga algo en rojo**. Si alguien cambia el `meses < 24` de `categoriaDe` por
`meses <= 24`, falla el test de "24 meses justos es vaca"; si corre el
`kg > rango[1]` a `kg >= rango[1]`, falla el de "250 kg en un ternero se acepta".

### La suite

- **Backend: 35 métodos de test** (`backend/test/`), sobre las 7 reglas y el
  servicio. Parametrizados con `it.each` (por ejemplo, las 8 combinaciones de
  sexo y edad de `categoriaDe`), casos de error (caravana vacía, peso cero o
  negativo, fechas futuras, parto de un macho) y **13 tests con mock** en
  `servicio.test.js`.
- **Frontend: 7 métodos de test** (sin DOM), al lado del código: `validacion.test.js`
  (con un `it.each` de los tres campos obligatorios y los casos de fecha futura e
  inexistente) y `api.test.js` (con el `fetch` reemplazado por un doble, y un
  `it.each` de los tres formatos de error del backend).

Cuento **métodos**, no filas: un `it.each` con 8 datos es un test, no ocho.

### El refactor para poder mockear

**Backend.** Antes, `rutas/animales.js` hacía todo junto: consultaba `pool`
directamente, aplicaba las reglas y armaba la respuesta HTTP. Las reglas puras de
`reglas.js` ya se podían testear, pero la parte que decide **si se guarda o no**
(¿el animal existe?, ¿está activo?, ¿pasa la validación?) estaba pegada al SQL:
para probarla hacía falta PostgreSQL levantado. Lo separé en tres piezas:

- `repositorio.js`: el único archivo con SQL. Pide y guarda filas, sin reglas.
- `servicio.js`: los casos de uso. Recibe el repositorio **por parámetro**
  (`crearServicio(repo)`) en vez de importar `pool`.
- `rutas/animales.js`: pide, delega en el servicio y responde. Es acá donde se le
  pasa el repositorio real.

En los tests, `repoFalso()` arma un objeto con la misma forma que el repositorio,
con cada método hecho con `vi.fn()`. El test que mejor muestra la diferencia entre
stub y mock es **"NO toca la base si el animal está vendido"**: el doble hace de
stub cuando contesta el animal (`mockResolvedValue`), y de mock en el assert
`expect(repo.insertarPesada).not.toHaveBeenCalled()`, que no mira lo que devolvió
el servicio sino **qué le pidió a la base**. Si alguien borra el chequeo de
`admiteNovedades`, ese test se pone en rojo aunque la respuesta siguiera siendo
la misma.

**Frontend.** `api.js` llamaba al `fetch` global adentro de `pedir`, sin forma de
reemplazarlo. Ahora `crearApi(unFetch)` arma el cliente con el fetch que se le
pase, y la app exporta `api = crearApi(fetch del navegador)`, así que los
componentes no cambiaron. El test verifica la **interacción**: que la pesada vaya
por `POST` a `/api/animales/7/pesadas` con el cuerpo en JSON, y que el texto del
buscador se escape en la URL.

El límite de esto: los dobles prueban **mi** código, no la conexión. Si el backend
cambia el formato de sus errores, el test del front sigue verde porque el doble
contesta lo de siempre. Eso lo cubren las pruebas de punta a punta del TP7.

### Herramientas (mi stack no es el de la cátedra)

| Lo que había que lograr | Qué usé (back y front, Node + vitest) |
|---|---|
| Dónde viven los tests | Back: `backend/test/` (afuera de `src/`, así la imagen final, que copia sólo `src`, no se los lleva). Front: al lado del código, `*.test.js` |
| Test parametrizado | `it.each` |
| Dependencia desde afuera | Parámetro: `crearServicio(repo)` y `crearApi(unFetch)` |
| Fabricar el doble | `vi.fn()` con `mockResolvedValue` / `mockRejectedValue` |
| Medir la cobertura | `vitest run --coverage` con `@vitest/coverage-v8` |
| Umbral que rompe el build | `coverage.thresholds` en `vitest.config.js` y `vite.config.js` |
| Qué entra en la cuenta | `coverage.include` / `coverage.exclude` |
| Reporte legible | reporter `html` (artefacto) y `json-summary` (lo lee el paso del Summary) |
| Que las herramientas entren a la etapa de tests | `npm ci` **sin** `--omit=dev` en la etapa `build` |

Usé **vitest también en el backend** (en vez del `node --test` que tenía el
`package.json`) para tener una sola herramienta, una sola forma de declarar el
umbral y el mismo reporte de los dos lados. Versión **3.2.7** en los dos: vitest 4
exige Vite 6 y mi frontend está en Vite 5.

El pipeline sigue sin saber cómo se testea mi app: cada Dockerfile tiene una etapa
`test` en el medio (`FROM build AS test` con `ENTRYPOINT ["npm","run","test:ci"]`),
el job la construye con `target: test` y `load: true`, y la corre con `docker run`
montando una carpeta para sacar el reporte. `test:ci` es el mismo comando que uso
en mi máquina: una receta, no dos.

### Qué dejé afuera de la cuenta de cobertura

**Backend** (`vitest.config.js`): entra `src/**/*.js` **menos** estos cuatro:

- `src/index.js`: el arranque (crea Express, monta rutas, escucha el puerto). Si
  está mal, la app no levanta y me entero en el acto.
- `src/db.js`: la conexión y el `CREATE TABLE`. Infraestructura, sin reglas.
- `src/repositorio.js`: SQL puro. Testearlo con un doble sería testear que
  llamo a `pool.query`; lo que importa (que el SQL sea correcto contra la base
  real) se verifica de punta a punta en el TP7.
- `src/rutas/**`: pegamento HTTP; después del refactor no queda ninguna decisión
  ahí.

Es un `exclude` y no una lista de archivos incluidos a propósito: un archivo nuevo
en `src/` **entra solo** a la medición. Y no excluí nada con lógica: antes de
sacar las rutas de la cuenta, saqué sus decisiones al servicio. Si hubiera
excluido `rutas/` con la lógica adentro, el número habría medido sólo `reglas.js`
y habría dado altísimo.

**Frontend** (`vite.config.js`): entran los `.js` de `src/` (hoy `validacion.js` y
`api.js`). Quedan afuera los componentes `.jsx` y `main.jsx`: son pantalla y
cableado de React, y la interfaz completa se verifica de punta a punta en el TP7.

### El umbral: 90 % de líneas y 85 % de ramas, en los dos lados

Lo medí antes de elegirlo. Con la suite completa, hoy da:

| | Líneas | Ramas |
|---|---|---|
| Backend | 98,78 % | **95,74 %** |
| Frontend | 100 % | **90,9 %** |

Puse **90 de líneas** porque deja margen para un refactor chico (algunas líneas
que se mueven) pero **no** para un archivo nuevo sin tests: lo comprobé en los dos
Pull Requests de abajo, donde una sola función sin tests alcanzó para frenar. Y
puse umbral **también en ramas (85)** porque es la métrica honesta: una línea con
un `if` cuenta como cubierta aunque sólo se haya recorrido uno de sus caminos. Las
ramas quedan en 85 y no en 90 porque el frontend hoy mide 90,9: con 90 cualquier
rama nueva sin probar lo frenaría, y no quiero un gate que se apague el día que
molesta.

Cada lado evalúa su umbral por separado (son dos proyectos de vitest, dos jobs): un
backend muy cubierto no compensa un frontend flojo.

**Para subirlo** a 95 de ramas me faltaría: el camino de la pesada con fecha
inválida (`reglas.js`, línea 86), la respuesta `204` sin cuerpo del cliente
(`api.js`, línea 18), la caravana `null` del formulario (`validacion.js`, línea 12)
y el `listar` del servicio, que hoy no tiene test.

**Si mañana lo subo diez puntos** (100 de líneas), el gate frenaría cualquier
cambio que no esté cubierto al 100 %, incluidos los caminos que no vale la pena
probar. La reacción previsible es escribir tests sin assert para llegar al número
(Goodhart), y el número dejaría de decir algo.

### Por qué cobertura alta no garantiza calidad (con mi ejemplo)

Este test deja `gananciaDiaria` con todas sus líneas cubiertas y no verifica nada:

```js
it('cubre la ganancia diaria', () => {
  gananciaDiaria([{ fecha: '2026-01-01', kg: 200 }, { fecha: '2026-03-01', kg: 250 }]);
});
```

Si alguien invierte la cuenta (`primera.kg - ultima.kg`), la cobertura sigue
igual y el test sigue en verde. El test real (`toBe(0.847)`) se pone en rojo. La
cobertura mide qué se **ejecutó**, no qué se **comprobó**; lo que lo comprueba es
el assert, y eso ningún porcentaje lo ve. Cobertura baja sí es una señal
confiable (hay código que nadie mira); cobertura alta, no.

### El ejercicio del camino sin cubrir

1. **Qué línea**: `reglas.js`, `transicionValida`, en
   `return (TRANSICIONES[actual] ?? []).includes(nuevo);`. En el primer reporte
   aparecía como rama sin cubrir, sin ningún `if` a la vista: la abre el `??`. Todos mis tests usaban estados actuales que existen, así
   que el lado derecho del `??` nunca se recorría.
2. **Qué entrada la recorre**: un animal cuyo estado **actual** no está en la tabla
   de transiciones, por ejemplo `transicionValida('perdido', 'vendido')`. Puede
   pasar con un dato corrupto en la base (la columna `estado` es `TEXT` sin
   restricción).
3. **Qué decidí**: **lo agregué**, como una fila más del `it.each`
   (`['perdido', 'vendido', false]`). No es un test por el número: sin el `??`,
   ese dato corrupto tiraría un `TypeError` (`undefined.includes`) en vez de
   contestar un 409 con el motivo.
   El test protege esa decisión.

La que sigue sin cubrir es la de la línea 86 (una pesada con fecha inválida). Es
alcanzable llamando a la API directo, y es el primer test que agregaría para subir
el umbral de ramas.

### El Pull Request bloqueado

**La suite y el umbral entraron en el Pull Request #28:**
https://github.com/Rous444/Ingenieria-de-Software-III/pull/28. Los dos checks en
verde, con el Summary de cobertura y los artefactos `coverage-backend` y
`coverage-frontend`:
https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/36166686634

**Pull Request 1 de la demostración, la secuencia completa (#29):**
https://github.com/Rous444/Ingenieria-de-Software-III/pull/29

1. El primer commit agrega la **regla 7, la ganancia diaria**, sin tests. Compila,
   el build de las imágenes pasa y los 47 tests existentes pasan todos… y
   `build-backend` queda en **rojo**:
   https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/36604103224
   El log del paso *Correr los tests del backend* dice:
   `ERROR: Coverage for lines (89.02%) does not meet global threshold (90%)`.
   Frenó **por líneas**. Las ramas no se movieron (94,93 %): en vitest 3 una
   función que ningún test llama no suma ramas, sólo líneas sin cubrir. Por eso
   tengo umbral en las dos métricas.
2. Escribí los tests que faltaban, uno por camino de la función: la ganancia
   normal con pesadas desordenadas, la pérdida de peso, menos de dos pesadas,
   pesadas inválidas y dos pesadas el mismo día. Más dos del servicio con mock: la
   ficha que expone el número y el 404 que no consulta novedades. Volvió a
   **98,78 % / 95,74 %**, verde
   (https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/36604354591),
   y merge.

**Pull Request 2, el freno vigente (#30, queda abierto hasta la defensa):**
https://github.com/Rous444/Ingenieria-de-Software-III/pull/30
(corrida en rojo: https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/36605444779)

Agrega `edadLegible` en `frontend/src/formato.js` (la edad como la dice un
productor: "1 año y 3 meses") sin tests. Queda en rojo `build-frontend`:
`ERROR: Coverage for lines (81.7%) does not meet global threshold (90%)`. Compila
y los 11 tests del front pasan. Elegí el frontend a propósito para que cada Pull
Request muestre el freno de un lado distinto.

**Por qué este freno es distinto del del TP4.** El del TP4 frenaba cuando el código
**no se podía construir**: la máquina diciendo "esto no anda". Éste frena código que
anda, con todos los tests en verde, por un criterio que elegí yo. Y lo que deja
pasar igual: un test sin assert que sume cobertura, un requisito mal entendido (el
test congela lo que yo entendí, no lo que el productor quería), y los errores de
conexión entre front y back, que los dobles no ven.

Los checks que frenan son los mismos `build-backend` y `build-frontend` del TP4: la
cobertura corre **adentro** de esos jobs, así que no hubo que tocar la protección de
`main`. Los tres guardianes: Pull Request obligatorio (TP1), build en verde (TP4),
tests con su umbral (TP5).

### Problemas encontrados

- **El `--omit=dev` del Dockerfile del backend.** La etapa `build` del TP2 instalaba
  sólo dependencias de producción, así que la etapa de tests no iba a encontrar
  vitest. Lo saqué de `build`, y la imagen final ahora instala las suyas aparte con
  `npm ci --omit=dev` y copia sólo `src/`: no se lleva ni vitest ni la carpeta
  `test/`.
- **Tests que dependían de la zona horaria.** JavaScript lee una fecha sin hora
  (`'2025-09-25'`) como medianoche UTC; en una máquina con hora argentina eso es
  el día anterior a las 21, y el borde de "24 meses justos" se corría un día.
  Corriendo la suite con `TZ=America/Argentina/Buenos_Aires` y sin el ajuste,
  fallan 2 tests de `categoriaDe`; en el contenedor (UTC) pasan. Fijé
  `TZ=UTC` en la configuración de vitest de los dos lados, que es la zona en la
  que corre el contenedor de producción, y todas las reglas reciben `hoy` por
  parámetro para no depender del reloj.
- **vitest 4 no instala con Vite 5.** Fijé la línea 3 (`3.2.7`) y el
  `@vitest/coverage-v8` de la misma versión exacta.
- **`${COVERAGE_DIR:-coverage}` en Windows.** Esa expansión es de `sh`; en mi
  máquina `npm run test:ci` la ignora. Localmente corro `npm test -- --run
  --coverage`; el script `test:ci` es el del contenedor, que es Linux.

### Declaración de uso de IA

Usé Claude para proponer el refactor del servicio y del cliente de la API, escribir
los tests, armar las etapas de los Dockerfiles y los pasos del `ci.yml`, y
redactar esta sección.

Lo verifiqué así: corrí las dos suites con cobertura antes de subir nada, y
comprobé que el umbral **frena de verdad** (el mismo `npm run test:ci` devolvió
error con la ganancia diaria sin tests y volvió a pasar con sus tests). Para cada
test puedo decir qué verifica el assert y qué regla se rompería si se invierte; lo
que **no** cubren está escrito arriba (el `listar`, la pesada con fecha inválida,
el 204 del cliente, y la conexión real front/back, que es del TP7).

## TP6 · CD: entornos, aprobación y deployment patterns

### Dónde despliego y cómo cumplo el contrato

Usé el riel de la cátedra: **Render** para los contenedores y **Neon** para las bases. Los cinco puntos del contrato:

1. **Dos entornos separados, cada uno con su URL**: cuatro *Web Services* en Render (`Rodeo-api-qa`, `Rodeo-front-qa`, `Rodeo-api-prod`, `Rodeo-front-prod`). Los enlaces están arriba de todo.
2. **Una base por entorno**: un proyecto de Neon con dos bases, `app_qa` y `app_prod`. Cada api recibe la suya por `DATABASE_URL`. El esquema lo crea la propia app al arrancar (`CREATE TABLE IF NOT EXISTS` en `db.js`), así que las dos bases nacieron vacías y las tablas aparecieron con el primer arranque de cada api.
3. **Front y back como contenedores, desde mis Dockerfiles**: los cuatro servicios tienen runtime **Docker** y *Root Directory* `backend` o `frontend`.
4. **El deploy lo dispara el pipeline con el commit verificado**: *Auto-Deploy* en **Off** en los cuatro servicios; los jobs llaman al *deploy hook* de cada servicio con `&ref=<commit>`.
5. **PROD detrás de una aprobación**: environment `production` con required reviewer.

No usé el Postgres de Render porque su plan gratis **vence a los 30 días** de creado; el de Neon es permanente, con límites de uso.

**Cómo comprobé que cada entorno usa su propia base**: inserté un animal con caravana `SOY-PROD` **sólo** en `app_prod` desde el SQL Editor de Neon. En PROD aparece (Registrados: 1); en QA no (Registrados: 0). Si las dos cadenas apuntaran a la misma base, el animal aparecería en los dos.

### El artefacto: se publica sólo lo que pasó la verificación

Cada merge a `main` publica las dos imágenes en `ghcr.io`, etiquetadas con el commit (`sha-<commit>`). Que el registry sólo tenga cosas verificadas no depende de un control nuevo sino de **tres eslabones encadenados**:

1. **Nada entra a `main` sin el pipeline en verde**: `build-backend` y `build-frontend` son required checks (TP4) y adentro corren los tests con su umbral de cobertura (TP5).
2. **Sólo lo que entra a `main` se publica**: «Entrar al registry» y «Construir y publicar la imagen» llevan `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`. Las dos condiciones, no una: si mañana el workflow escucha otra rama, un push ahí no publica.
3. **Publicar es el último paso del mismo job que testea**: los pasos de un job corren en orden y se cortan en el primer error. Si los tests o el umbral fallan, el job muere antes de llegar a publicar. La condición «sólo si pasó la verificación» no está escrita en un `if`: está en el **orden** de los pasos. Por eso moví el build de la imagen final desde arriba (donde lo tenía el TP4) hasta el final.

Si se publicara igual con los tests en rojo, estar en el registry dejaría de significar «esto pasó la verificación» y pasaría a ser un depósito de cosas que alguien construyó alguna vez.

**Lo que esto NO garantiza**: la cadena cubre lo que publica **el pipeline**, no lo que físicamente puede entrar. Con un token con permiso de escritura, cualquiera puede hacer un `docker push` a mano a ese paquete. Y la etiqueta `sha-…` se podría volver a usar para otra imagen; lo que identifica una imagen de forma inmutable es su **digest** (`sha256:7dc82d…` en el backend, el que mostró el `docker pull`).

El permiso `packages: write` está **en cada job que publica**, no a nivel del workflow: a nivel workflow se lo daría a todos los jobs (mínimo privilegio). Las credenciales son el `GITHUB_TOKEN` de cada corrida: no hay ningún secret guardado para publicar.

Los paquetes son públicos para que se puedan bajar sin credenciales; lo comprobé con `docker logout ghcr.io` y después `docker pull` de las dos imágenes.

### Continuous Delivery, no Continuous Deployment

Implementé **Continuous Delivery**: todo cambio verificado llega solo hasta QA y queda listo para PROD, pero el último paso lo autoriza una persona. Para **Continuous Deployment** habría que sacar la aprobación, y no corresponde a mi contexto: la suite son tests unitarios (todavía no hay pruebas de punta a punta contra un entorno, eso es el TP7) y no tengo monitoreo que me avise si PROD se rompe. Automatizar el paso a PROD con esa red de seguridad sería automatizar la propagación de errores.

### El diseño de la cadena

```
build-backend ┐
              ├─ deploy-qa (needs: los dos builds · if: push a main · environment: qa)
build-frontend┘      └─ deploy-prod (needs: deploy-qa · environment: production ⏸)
```

- `needs:` arma la cadena con compuertas: sin los dos builds en verde no hay QA, y sin QA desplegado y con smoke verde no hay PROD.
- `if:` en `deploy-qa`: los Pull Requests verifican pero no despliegan. `deploy-prod` no repite el `if` y no es un olvido: depende de `deploy-qa`, que sí lo tiene, así que en un PR los dos salen salteados (se ve en los checks de cualquier PR).
- `environment:` conecta cada job con su environment de GitHub: hereda sus secrets y variables, suma al historial de *Deployments*, y en `production` aplica la regla de aprobación.
- `concurrency: deploy-prod` en el job de PROD, para que dos deploys a producción nunca corran a la vez. No ordena la cola de aprobaciones: si quedan dos corridas esperando, la vieja se rechaza a mano.

**El `&ref=` del hook es lo que hace que se despliegue el commit verificado.** El hook pelado despliega la punta de `main`. Con dos merges seguidos, la corrida del primero desplegaría el segundo, que todavía no pasó por nada; y en PROD, entre que la corrida queda esperando y que la apruebo pueden pasar horas: sin el `&ref=` aprobaría el commit A y subiría lo último que haya. Lo comprobé en el primer deploy: Render registró `Deploy live for 39fafa4`, el commit de esa corrida.

**El alcance de cada secret:**

| Dónde | Qué | Por qué ahí |
|---|---|---|
| Environment `qa` | `RENDER_HOOK_API_QA`, `RENDER_HOOK_FRONT_QA` (secrets) · `URL_API`, `URL_FRONT` (variables) | Sólo los ve un job con `environment: qa` |
| Environment `production` | `RENDER_HOOK_API_PROD`, `RENDER_HOOK_FRONT_PROD` (secrets) · `URL_API`, `URL_FRONT` (variables) | Sólo los ve un job con `environment: production`, y **ese job no arranca sin aprobación**: sin aprobar, nadie lee los hooks de PROD |
| Ninguno (lo da GitHub) | `GITHUB_TOKEN` | Vive lo que dura el job; publica en `ghcr.io` |

Si los hooks de PROD estuvieran en los secrets **del repo**, cualquier job de cualquier workflow (incluido uno que alguien agregue mañana) podría desplegar a producción sin pasar por la aprobación. Las URLs van como **variables** y no como secrets porque no son secretas, y así se leen en el log.

### Qué quedó por variable y qué quedó adentro de la imagen

| Por variable de entorno (cambia por entorno) | Adentro de la imagen (igual en todos lados) |
|---|---|
| `DATABASE_URL`: la base de cada api | El código de la api y del front |
| `BACKEND_URL`: a qué api le habla cada front | La configuración de nginx como **plantilla** |
| `DNS_RESOLVER`: con qué DNS resuelve nginx esa dirección | Los valores por defecto de compose (`backend:8080`, `127.0.0.11`) |
| `PORT`: lo define Render | |
| `RENDER_GIT_COMMIT`: lo define Render en cada deploy | |

El `nginx.conf` del TP2 tenía escrito `http://backend:8080`, el nombre del servicio en compose. Lo convertí en `default.conf.template`: la imagen oficial de nginx procesa `/etc/nginx/templates/` al arrancar y reemplaza `${BACKEND_URL}` y `${DNS_RESOLVER}` por su valor. Así **la misma imagen** sirve en compose (con los valores por defecto del Dockerfile), en QA y en PROD, y cada una habla con su api. Es lo que va a permitir en el TP7 desplegar la imagen del registry en los dos entornos.

### Qué mira el aprobador antes de aprobar

Antes de apretar *Approve*, miro:

1. **Que QA esté en verde con ESTE commit**: el job `deploy-qa` de esa corrida pasó, y el smoke confirmó que la api de QA corre el mismo commit que voy a aprobar.
2. **Qué cambia**: el PR que se mergeó. No es lo mismo un cambio de texto que uno que toca la cadena de conexión o el esquema de la base.
3. **El cambio, en QA, con mis ojos**: si es visible, lo abro en QA y lo uso.
4. **Que no haya otra corrida más nueva esperando**: si la hay, rechazo la vieja; si no, PROD retrocedería.
5. **El momento**: que tenga tiempo de mirar PROD después del deploy y de volver atrás si algo sale mal.

**Lo que mi aprobador NO puede ver**: si la app anda bien para los usuarios **después** del deploy. No hay métricas de errores ni de latencia, ni logs centralizados con alertas. El smoke dice que contesta, no que contesta bien. Esa observabilidad es lo que me falta para decidir mejor (y para hacer canary, ver abajo).

**Los dos caminos, en el historial:**
- **Aprobación**: el primer deploy a PROD (`f1fa53f`, PR #34) y el del cambio visible (`4f5a8ce`, PR #36). En el segundo, el motivo fue: *«QA verde con el smoke en el commit correcto. Revisé el lema en QA en ancho de celular y no desborda. Este cambio sólo renombra un indicador. Apruebo los dos.»* Después de aprobar, abrí PROD y se ven el lema y el indicador «Animales activos».
- **Rechazo** (PR #35, el lema en el encabezado), con el motivo: *«El lema agrega texto al encabezado y en QA no lo revisé en pantalla chica: en celular el título puede desbordar. No sube a PROD hasta verlo en QA en un ancho angosto.»* El job `deploy-prod` quedó en rojo: la máquina obedeció al humano. Cuento con honestidad cómo llegué a eso: en el primer intento de esa corrida rechacé con un motivo que no decía nada («para testear la función rechazar»), que es exactamente un gate decorativo. Lo volví a correr (*Re-run*) y rechacé con el motivo real, que quedó en el intento #3. Antes de eso, en el PR #34 había apretado *Approve* creyendo que rechazaba: por eso ese deploy terminó siendo la primera aprobación.

### La letra chica del free tier

- **Render duerme cada servicio a los 15 minutos sin tráfico**, y el primer pedido lo despierta con un *cold start* de hasta un minuto (el aviso lo dice en cada servicio: «can delay requests by 50 seconds or more»). Por eso el smoke **reintenta**: hasta 36 vueltas, cada pedido con `--max-time 10` y 20 segundos entre vueltas. Sin el `--max-time`, un servicio que acepta la conexión y no contesta colgaría el job hasta el límite del runner. Y el job tiene `timeout-minutes: 20`.
- **750 horas de instancia por mes, para todo el workspace**, no por servicio. Son cuatro servicios, pero duermen solos; un servicio despierto las 24 horas se comería 720 él solo. No dejé nada haciendo ping para mantenerlos despiertos, justamente por eso.
- **500 minutos de build por mes en el workspace.** Cada promoción reconstruye hasta cuatro servicios (back y front, QA y PROD), de 1 a 5 minutos cada uno. Cuidé ese presupuesto: al cambiar variables en Render usé «Save only» cuando no hacía falta reconstruir, y para corregir el rechazo usé *Re-run* (que no reconstruye nada) en vez de otro PR. Si se acaban, Render deja de construir: el hook contesta igual y, sin la comparación de versión del smoke, el pipeline daría verde contra la versión vieja sin enterarme.
- **Neon** suspende el cómputo a los ~5 minutos sin uso y se despierta solo, mucho más rápido que Render; limita el almacenamiento a 0,5 GB.

### Qué garantía pierdo porque Render reconstruye

El pipeline publica la imagen que verificó, pero Render **no la usa**: con el hook, Render vuelve a construir el contenedor desde el repositorio, a partir del mismo commit. Promuevo **el mismo commit, no la misma imagen**. Puede salir igual o no: una imagen base que se actualizó entre los dos builds (`node:22-alpine`, `nginx:alpine`), una dependencia que se resolvió distinto, una diferencia de plataforma. Si el build de Render falla o sale distinto, lo que corre en QA y PROD no es lo que pasó los tests. Cerrar esa brecha (que Render ejecute la imagen del registry) es el TP7.

### Qué prueba el smoke y qué no

El smoke (`.github/scripts/smoke.sh`, el mismo para QA y PROD) comprueba, en orden:

1. Que la api conteste `/health`, que hace un `SELECT 1` contra la base.
2. **Que la api corra el commit que se mandó a desplegar**: `/health` devuelve `version` (Render define `RENDER_GIT_COMMIT` en cada deploy) y el smoke la compara con `github.sha`. Mientras Render construye, sigue sirviendo la versión anterior: sin esta comparación, el smoke daría verde contra la versión vieja.
3. Que la api liste animales (toca las tablas, no sólo la conexión).
4. Que el front sirva la página.
5. **Que el front llegue a su api a través de nginx** (`<front>/api/animales`).

**Lo que NO prueba**: que la app haga lo que tiene que hacer (que un alta guarde bien, que una regla valide), eso es el TP7 con e2e. La versión sólo se compara en la api: del **front** sabe que contesta y que llega a la api, pero no qué commit corre. Y no dice nada del estado después: si PROD se rompe diez minutos después del deploy, nadie se entera.

El quinto chequeo no estaba en la guía y fue el que atrapó el problema real de este TP (abajo).

### Deployment pattern para una producción real

**Hoy** el despliegue es *recreate*: Render reemplaza el contenedor y, en el plan gratis, hay un instante en que el servicio no responde. Para la Libreta del Rodeo con usuarios reales elegiría **blue-green**:

- **Por qué ése**: el costo de un error es alto y poco visible (un productor carga pesadas o partos en una versión que guarda mal y nadie lo nota hasta mucho después), y el tráfico es bajo. Con dos entornos completos y un switch, el rollback es **instantáneo**: se vuelve a apuntar al entorno anterior, sin reconstruir nada.
- **Costo**: el doble de infraestructura mientras conviven los dos. Para una app chica es aceptable; mi QA actual ya es casi un «verde» en miniatura.
- **Riesgo que no cubre**: la base es compartida entre azul y verde. Un cambio de esquema tiene que ser compatible con las dos versiones (primero agregar columnas, después usarlas, recién al final borrar las viejas).
- **Por qué no canary**: con este tráfico, un 5 % de usuarios son dos o tres personas por día, y no tengo métricas que me digan si «el canario sangra». Sin observabilidad, canary es una ruleta. Lo que me falta para hacerlo en serio: métricas de errores y de latencia por versión y un router que reparta tráfico.
- **Feature flags** los usaría para desacoplar el deploy del release: por ejemplo, la ganancia diaria del TP5 podría desplegarse apagada y prenderse primero para un productor de prueba.

### Plan de rollback (probado y medido)

Como cada deploy se dispara con un commit explícito, volver atrás es **disparar los mismos hooks con el commit del último deploy bueno**:

1. Ver qué commit estaba antes en PROD: *Deployments → production* en GitHub, o la lista de releases.
2. Copiar los dos deploy hooks de PROD desde Render (el secret de GitHub no se puede volver a leer).
3. `curl "<hook-api>&ref=<commit-anterior>"` y lo mismo con el del front.
4. Esperar *Deploy live* en los dos servicios de Render y comprobar PROD.

**Lo hice una vez de verdad**, volviendo PROD de `4f5a8ce` (el deploy aprobado del PR #36) a `f1fa53f`:

| | Hora (15/10/2026) |
|---|---|
| Disparo de los dos hooks | 22:23:51 |
| `Deploy started for f1fa53f` (api y front) | 22:23 |
| `Deploy live for f1fa53f` (api y front) | 22:24 |

**Alrededor de un minuto** hasta tener los dos servicios en la versión anterior (Render muestra las horas en minutos; el rastro está en *Events* de `Rodeo-api-prod` y `Rodeo-front-prod`). Fue tan rápido porque Render ya había construido ese commit y reutilizó su cache; con un commit que nunca construyó, hay que sumar el build completo (2 a 5 minutos por servicio). Es la métrica DORA de **tiempo de recuperación**. Después volví PROD a `4f5a8ce` con el mismo mecanismo.

**Lo que el rollback de código NO deshace: los datos.** Después del rollback, PROD volvió a mostrar «En el rodeo» y sin el lema, pero el animal `SOY-PROD` seguía ahí. Si un deploy hubiera corrido una migración que borra una columna, volver el código no la recuperaría. Para eso harían falta migraciones reversibles (o compatibles hacia atrás, como en blue-green) y backups de la base; Neon tiene *point-in-time restore*, pero sería un paso aparte, con su propio tiempo.

También existe el camino por GitHub (re-correr el job `deploy-prod` de una corrida vieja), pero vuelve a pedir aprobación y sólo sirve para corridas de hasta 30 días. El hook con el commit funciona siempre.

### Release

La entrega se cierra con el tag **`v6.0.0`** sobre el commit del merge de este PR de documentación, que pasó por QA y llegó a PROD con aprobación como cualquier otro cambio. El commit sale de *Deployments → production*, no de la punta de `main`: entre la aprobación y el tag podría haber entrado otro merge que nadie aprobó. La release de GitHub lleva las notas generadas desde los PRs.

### Problemas encontrados

- **El front de QA no llegaba a su api (502), y el primer smoke no lo dijo.** El primer `deploy-qa` quedó en rojo después de agotar los reintentos. El log de nginx en Render tenía la causa: `rodeo-api-qa-zzyl.onrender.com could not be resolved ... resolver: 127.0.0.11`. Al servicio `Rodeo-front-qa` le faltaba la variable `DNS_RESOLVER`, así que nginx usaba el valor por defecto de compose, que en Render no existe. La agregué, redesplegué el front y re-corrí sólo el job fallido (*Re-run failed jobs*): verde. La página principal abría bien todo el tiempo; un smoke que sólo mirara `/` habría dado verde con la app rota.
- **El mensaje del smoke engañaba.** Cuando la api no informaba versión, el script decía «la api corre el commit correcto» aunque no lo supiera, y no decía qué verificación fallaba. Lo corregí en el PR #34: ahora cada vuelta dice cuál falla y con qué URL.
- **Apreté Approve creyendo que rechazaba**, y el primer rechazo tuvo un motivo vacío. Está contado arriba, en el gate.
- **Los deploy hooks de PROD quedaron expuestos** mientras armaba el comando del rollback. Los regeneré en Render y actualicé los dos secrets del environment `production`: como viven ahí, se cambian en un solo lugar.
- **En `cmd` de Windows, `set /p VAR=valor` no guarda el valor**: lo usa como texto de la pregunta. El `curl` del rollback falló con *Bad hostname* hasta que usé `set "VAR=valor"`.
- **Render agregó un sufijo a la URL de una api** (`rodeo-api-qa-zzyl`) porque el nombre ya estaba tomado. Hubo que copiar la URL exacta en el `BACKEND_URL` del front y en las variables del environment.

### Declaración de uso de IA

Usé Claude para escribir los cambios del `ci.yml` (publicar la imagen al final del job, los jobs de deploy), la plantilla de nginx, el reporte de versión en `/health`, el script del smoke, para guiarme en la configuración de Neon, Render y los environments, para diagnosticar las fallas y para redactar esta sección.

Cómo lo verifiqué: la plantilla de nginx y el smoke se probaron en local antes de subirlos (nginx con las dos combinaciones de variables, y el smoke contra una api de prueba con el commit correcto, con uno viejo y sin URLs). El resto lo verifiqué contra lo que pasó de verdad: el orden de los pasos en la corrida de `main`, el registry salteado en el PR, el `docker pull` sin credenciales, el commit de cada deploy en *Events* de Render, el `count(*)` en las dos bases, el `SOY-PROD` en una sola, la aprobación y el rechazo registrados en las corridas, y el rollback cronometrado. Puedo explicar qué pasa entre el merge y PROD: los dos builds con sus tests, el `if` que habilita el deploy sólo en `main`, el hook con el commit, el smoke que espera ese commit, la pausa del environment `production` y el mismo camino hacia PROD con sus propios secrets.

## TP7 · Contenedores en el pipeline + integración y e2e

### Build once, deploy many: qué problema del TP6 cierra

En el TP6 el pipeline publicaba la imagen verificada, pero Render **no la usaba**: con `&ref=<commit>` volvía a construir el contenedor desde el repositorio. Promovía el mismo commit, no la misma imagen. Mi ejemplo concreto: el Dockerfile del front arranca `FROM nginx:alpine` y el del back `FROM node:22-alpine`, etiquetas que se mueven. Si entre el build del pipeline y el de Render salía una versión nueva de cualquiera de las dos (o `npm ci` resolvía distinto algo que el lockfile no fija, como los binarios por plataforma), en PROD corría una combinación que ningún test había visto, con el mismo commit y el mismo código. Encima, el build de QA y el de PROD eran **dos** builds distintos, a horas distintas.

Ahora la imagen es la unidad de release: el pipeline la construye **una vez**, en el mismo job que corre los tests, la publica con la etiqueta de su commit y los dos entornos **la ejecutan tal cual**. Lo que verificó QA es, bit a bit, lo que llega a PROD. Y el rollback deja de ser «reconstruir un commit viejo» (2 a 5 minutos por servicio en el TP6, si el build sale igual) para ser «ejecutar una imagen que sigue en el registry, intacta».

### Los entornos ejecutan la imagen: qué cambié

- **En Render, a los cuatro servicios les cambié la fuente** (*Settings → Source → Existing Image*), no los creé de nuevo. Así conservaron URL, variables, deploy hook e historial: no hubo que tocar ningún secret ni ninguna URL. El runtime pasó de *Docker* a *Image* en los cuatro.
- **Primero uno solo, a mano**: `Rodeo-front-qa`, con `curl --get --data-urlencode "imgURL=…frontend:sha-6ee8efe…" "<hook>"`. Contestó `{"deploy":{"id":…}}` y en *Events* apareció el deploy de esa imagen. Ese deploy fue una prueba, no la entrega: después lo pisó la primera corrida del pipeline.
- **En el pipeline cambió una idea**: el hook dejó de decir qué commit construir y pasó a decir qué imagen ejecutar. `deploy-qa` y `deploy-prod` mandan `imgURL=ghcr.io/rous444/ingenieria-de-software-iii-<lado>:sha-${{ github.sha }}` y el `&ref=` se fue (con una imagen no hay nada que construir; dejarlo haría creer que Render todavía compila). El log de cada deploy imprime el `imgURL`: en una corrida completa se lee **la misma imagen** en QA y en PROD.
- **Las dos imágenes, no una**: si dejaba el front construyéndose desde el repo, la mitad de lo que ve el usuario seguiría siendo una reconstrucción.

### Mi estrategia de etiquetas

| Etiqueta | Dónde | Qué garantiza | Qué no |
|---|---|---|---|
| `sha-<commit completo>` | ghcr.io, la pone el pipeline | De qué commit salió la imagen, y que pasó los tests de ese commit (se publica en el último paso del job que testea, sólo en `main`) | Que el contenido no cambie: un tag de imagen se puede volver a publicar. Si re-corro la corrida de un commit, `sha-<ese commit>` pasa a apuntar a otra construcción |
| `v7.0.0` | git, la pongo yo al cerrar | El **nombre** de una versión que sé que anduvo en PROD | Por sí solo no es una imagen: es un commit. La imagen se encuentra por su `sha-` |
| digest `sha256:…` | ghcr.io, lo calcula el registry | El contenido exacto: si cambia un byte, cambia el digest. Nadie lo puede mover | Se conoce recién después de construir; no lo uso para promover (abajo) |

**Promuevo por `sha-<commit>`** porque se arma solo con el commit de la corrida: QA y PROD reciben exactamente la etiqueta que construyó esa corrida, sin pasar datos entre jobs. La garantía completa sería promover por digest (el hook lo acepta en `imgURL`), a costa de sacarlo del paso de build y pasarlo como salida hasta `deploy-prod`.

**Por qué el pipeline no publica `latest`**: `latest` es un puntero que se mueve con cada merge y no dice qué contenido hay detrás. Un deploy que lo nombrara ejecutaría «lo último que se publicó», haya pasado las e2e o no, y después nadie podría decir qué corrió. Con una sola etiqueta por imagen, la de su commit, no hay forma de desplegar algo sin decir exactamente qué es.

**Qué pasaría si alguien moviera un tag a mano**: si alguien con permiso de escritura publicara otra imagen como `sha-<commit de PROD>`, el próximo deploy de ese tag (un rollback, por ejemplo) ejecutaría algo que nunca pasó por mis tests, con un nombre que dice que sí. Nada en mi cadena lo detectaría, salvo comparar digests. Por eso el único que escribe en el registry es el pipeline, con el `GITHUB_TOKEN` de la corrida y `packages: write` sólo en los dos jobs de build: no hay ningún token mío en el YAML ni en ningún secret.

**Con qué imagen configuré Render, y por qué no es la que corre**: a los cuatro servicios les puse `sha-6ee8efe160d3b8c5e6a31104b9f0f916826f4760` (el último merge del TP6), porque Render pide una imagen que exista para cambiar la fuente. Es sólo el punto de partida: lo que corre lo elige cada deploy del pipeline con su `imgURL`, y Render sólo exige que coincidan registry y nombre de imagen (con `-backend` en las apis y `-frontend` en los fronts; si se cruzan, el hook contesta 400). Por eso *Settings* sigue diciendo `6ee8efe` y en QA corre otra cosa. Y por eso **nunca aprieto *Manual Deploy***: despliega la imagen de *Settings*, no la que está corriendo, y llevaría el entorno para atrás sin avisar. Si alguien lo hiciera, se nota: ese deploy en *Events* no dice «Triggered via Deploy Hook», no hay corrida que lo respalde, y `/health` devolvería `desconocida` (la imagen de `6ee8efe` es anterior a hornear el commit).

### Cómo se comprueba desde afuera que un entorno ejecuta MI imagen

Tres miradas, de la más manual a la más automática:

1. **Events de Render**: cada deploy dice «Triggered via Deploy Hook» y nombra `…:sha-<commit>`, la misma etiqueta que está en el paquete. Es la evidencia que muestro en vivo.
2. **El log de la corrida**: el paso de deploy imprime el `imgURL` que mandó; el de QA y el de PROD tienen la misma imagen.
3. **`/health` devuelve el commit de la imagen, y el smoke lo compara.** En el TP6 ese dato salía de `RENDER_GIT_COMMIT`, que Render define cuando construye desde el repo; un servicio de imagen ya no tiene repo. Así que lo **horneé en la imagen**: el job de build le pasa `build-args: GIT_SHA=${{ github.sha }}`, el Dockerfile del back lo guarda con `ARG GIT_SHA` + `ENV GIT_SHA=$GIT_SHA` (al final, para no invalidar la caché), y `/health` lo devuelve. El smoke compara esa versión con el commit de la corrida y no da verde mientras la api siga sirviendo la imagen anterior. La guía lo deja como concepto (§2.4); lo implementé porque ya tenía la comparación del TP6 y sin esto se iba a quedar mirando `desconocida`.

**Lo que el smoke todavía no prueba**: el commit del **front** (sólo sé que sirve la página y que llega a su api por nginx; que corre la imagen nueva lo veo en *Events*), y que la app **funcione**: responde no es anda. Eso último es lo que agregan la integración y las e2e.

### Las dos suites

Una sola herramienta, Playwright, en `frontend/`, con dos archivos y cada job corriendo el suyo:

**Integración, `e2e/api.spec.js`** (fixture `request`: un cliente HTTP, sin navegador, contra la api de QA y su PostgreSQL de Neon, sin ningún doble):
1. **Alta + verificación + borrado**: `POST` → 201 (y la categoría la calcula la api); `GET ?q=<caravana>` la encuentra; `DELETE` → 204; `GET` ya no la encuentra.
2. **Alta inválida**: sin caravana → 400 con `La caravana es obligatoria`, y una búsqueda por el nombre único que mandé devuelve vacío: de verdad no se guardó. No cuento toda la lista porque QA es compartido.
3. **La que elegí: una pesada vuelve de la base con la fecha y los kilos que se cargaron.** Doy de alta una vaca, le registro `2026-09-01` y `432.5` kg, y la ficha tiene que devolver esa fecha y esos kilos. La elegí porque la pesada es el dato que más se carga en el rodeo y el que más pasa por los tipos de Postgres: la fecha es `DATE` (el driver `pg` la convierte a un `Date` de JS con la zona del proceso, y una zona mal puesta la corre un día) y los kilos `NUMERIC(6,1)` (el driver los devuelve como texto, y un cambio de tipo los redondearía). Exactamente lo que un doble no ve. Al final borra el animal y comprueba el 404: con eso también pasa por el `ON DELETE CASCADE` de la pesada. Si se rompe, me escribe el que está pesando en la manga: sus pesadas se guardan mal y la ganancia diaria sale cualquier cosa.

**E2E, `e2e/animales.spec.js`** (Chromium contra el front de QA, que habla con su api y su base de verdad; nada de `page.route` ni mocks):
1. **Creación**: doy de alta un animal desde el formulario, aparece su tarjeta en el rodeo, lo borro desde su ficha y la tarjeta ya no está.
2. **Error**: doy de alta una caravana y después la **misma** otra vez: la UNIQUE de la base la rechaza, el usuario ve el aviso (`role="alert"`) «Ya existe un animal con la caravana …» y sigue habiendo **una** sola tarjeta. Elegí la caravana repetida y no un campo vacío porque el vacío lo frena el formulario antes de llegar a la api: el error que importa ver de punta a punta es el que viene de la base.
3. **La que elegí: registrar una pesada desde la ficha y verla en el historial.** Es el flujo de todos los días (en la manga se pesa y se carga), toca la base, y si mañana no anda me escribe el que está pesando.

Las tres reglas, en todas: **interactúan** (llenan, clickean), **afirman sobre el dato que el propio test produjo** (una caravana `e2e-<hora>-<azar>` que no se repite entre corridas) y **limpian lo que crean, comprobándolo**. Además, un `afterEach` borra por la api (a través del nginx del front) cualquier animal de ese test que haya quedado si el test se cayó a la mitad: en la corrida roja ningún test llegó a crear nada, pero si la rotura hubiera sido a mitad del flujo, sin eso la décima corrida fallaría por culpa de la primera.

**Para que las e2e busquen como una persona tuve que arreglar la app**, no esquivarla con selectores CSS:
- Los inputs de pesada y parto de la ficha tenían `<label>` sin `htmlFor`: un lector de pantalla no sabía qué era cada campo, y `getByLabel('Kilos')` tampoco. Les agregué `id` y `htmlFor`.
- Los avisos de error no tenían `role="alert"`. Se lo agregué a los de error de la api, **no** al «Falta completar» del formulario, que está a la vista todo el tiempo que el formulario está vacío: como alerta se anunciaría sin parar.
- Faltaba poder borrar. Agregué `DELETE /api/animales/:id` (204, o 404 si no existe; con sus unitarios en `servicio.test.js`) y un botón «Borrar» en la ficha, con confirmación y `aria-label="Borrar caravana <n>"`, porque «Borrar» solo no dice cuál. En el dominio, borrar es para **el animal cargado por error**: el que se vende o se muere no se borra, se marca, y su historia queda. No lo puse en cada tarjeta porque la tarjeta entera ya es un botón y un botón adentro de otro no es HTML válido.

**Qué NO puse en cada suite (pirámide)**:
- En **e2e** no repito reglas: que una vaca de 30 meses sea «vaca», los rangos de peso por categoría, las transiciones de estado, la ganancia diaria. Eso lo cubren los 58 unitarios del back en milisegundos; en un navegador costaría minutos por caso y, cuando fallara, no diría cuál regla. Tampoco puse partos ni cambio de estado: no son el flujo diario, y tres flujos críticos bien hechos valen más que diez frágiles.
- En **integración** no repito validaciones de negocio (ya están en los unitarios con el doble); pruebo **donde mi código se encuentra con la base**: que el INSERT quede, la UNIQUE, los tipos `DATE` y `NUMERIC`, el `DELETE` con su cascada, y el contrato HTTP (201, 204, 400, 404).

### Integración y e2e no son lo mismo: el par verde/rojo de mi rotura

| | Unitario (TP5) | Integración (TP7) | E2E (TP7) |
|---|---|---|---|
| Le habla a | `servicio.js` con un `vi.fn()` como base | La api de QA, por HTTP, con su Postgres | El front de QA, con un Chromium |
| Ve | Una regla, aislada | Que mi api y la base de verdad se entienden | Que una persona puede usar la app |
| No ve | Lo que contesta la base de verdad (el doble contesta lo que yo le dije) | Si la pantalla usa bien ese endpoint | Lo que no recorren mis tres flujos |
| Tarda | 20 ms | 15 a 18 s el job | 47 s en verde, ~4 min en rojo |

**La rotura**: en `frontend/src/api.js`, el alta pasó a llamar a `/api/animal` en vez de `/api/animales`. Un cambio de una línea en la app, sin tocar `e2e/`. La elegí porque es una rotura real (desde ese deploy nadie puede dar de alta un animal desde la pantalla, como en el escenario del TP) y porque **nadie más la ve**: ningún unitario del front cubre esa ruta (el test de `crearApi` afirma la de las pesadas), el smoke le habla a la api con la ruta correcta, y la integración también.

**La cadena, en la corrida 38842299907**: build verde → `deploy-qa` verde con el smoke verde → `integracion` **verde** (18 s) → `e2e` **ROJA** → `deploy-prod` salteado, sin llegar a pedir aprobación. El smoke en verde es parte de la evidencia: el sistema respondía y estaba roto.

**El diagnóstico, con los dos reportes y sin abrir el código**: el de integración dice que la api, contra su base de verdad, dio de alta, encontró y borró: la api y la base están sanas. El de e2e tiene los tres flujos en rojo, los tres en el mismo lugar: después de apretar «Dar de alta», la tarjeta de la caravana nunca aparece. La captura muestra el formulario todavía lleno y el aviso rojo «Error 404». En el *Retry #1*, la traza, pestaña *Network*: el navegador mandó `POST /api/animal` y volvió **404**. Es la **fila 1** de la tabla de §2.5: integración verde y e2e roja quiere decir que el que no usa bien la api es **el front**. El arreglo (PR #41) volvió la ruta a `/api/animales`, y la cadena completa quedó verde hasta PROD.

**Si hubiera roto la api** (por ejemplo, el INSERT del repositorio), la integración se habría puesto roja y la e2e **no habría corrido**: su `needs` no se cumple. Fila 2: la api o la base. No gasto un navegador en confirmar algo que ya sé.

**Un cambio de una línea que sólo atrapa la integración**: en `rutas/animales.js`, que el `POST` deje de pasar por el servicio y guarde directo: `animales.post('/', async (req, res) => res.status(201).json(await repositorio.insertarAnimal(req.body)))`. Los unitarios siguen verdes (prueban `servicio.js`, que no cambió). Las e2e también: el formulario nunca manda una caravana vacía, porque la valida antes. La integración (b) manda `caravana: ''` directo a la api: Postgres la acepta (`''` no es `NULL`), la api contesta 201 en vez de 400 y la prueba se pone roja. Es el caso de cualquiera que llame a la api sin pasar por mi pantalla.

### Por qué la integración es la amplia (contra la api de QA) y no la estrecha

La **estrecha** levantaría la api dentro del job, contra un Postgres descartable como `services:` del job. Gana: llega antes (no necesita deploy), está aislada (nadie más usa esa base) y probaría también los PRs. Pierde: bastante más configuración, y prueba una api armada en el runner, no la que va a promoverse.

Elegí la **amplia** porque ya tengo QA ejecutando **la imagen exacta** de esta corrida, con la misma base (Neon) y la misma configuración que PROD: además de mi código contra Postgres, prueba que el despliegue quedó bien (la variable `DATABASE_URL`, el esquema creado al arrancar, la red). Pierde: corre recién después del deploy, sólo en `main`, y comparte QA con todo lo demás (abajo, el límite conocido).

### El gate

```
build-backend ┐
              ├─ deploy-qa ─ integracion ─ e2e ─ [aprobación] ─ deploy-prod
build-frontend┘   (imgURL)    (sin browser)  (Chromium)    ⏸      (la MISMA imagen)
```

- `integracion` con `needs: deploy-qa`, `e2e` con `needs: [deploy-qa, integracion]` y `deploy-prod` con `needs: e2e`. `deploy-qa` figura en la e2e sólo para leer sus salidas (abajo); la e2e no puede correr sin la integración en verde.
- **Nada lo desarma**: ningún `continue-on-error`, ningún `|| true` después de Playwright, ningún `if: always()`. Los únicos `!cancelled()` son los de los pasos que **publican el reporte** y el resumen, que importan más cuando algo falló.
- Todo en **el mismo workflow**, disparado por el `push` a `main`. En un PR, `deploy-qa` no corre y los tres jobs de abajo salen salteados.
- El environment `production` sigue con su **required reviewer**: en la corrida 38842991986 se ve la pausa y que aprobé yo. Ahora apruebo con mejor evidencia que en el TP6: no «QA responde», sino «la api contestó bien con su base de verdad y un navegador real usó la app».
- **Las URLs de QA no están escritas dos veces**: viven en las variables del environment `qa` (las del TP6), y un job sólo las lee si declara ese environment. Los jobs de prueba no lo declaran, porque no despliegan nada (y si lo declararan, cada uno sumaría un deployment falso al historial de QA). Así que `deploy-qa` se las pasa como **salidas** (`outputs`), y los jobs de prueba las reciben como `API_BASE_URL` y `E2E_BASE_URL`. En el código de los tests no hay ninguna dirección: sin variable, apuntan a `localhost`.
- Cada suite publica **su** reporte con nombre propio (`playwright-report-integracion` y `playwright-report-e2e`: dos artefactos con el mismo nombre rompen la corrida) y escribe en el Summary cuántas pasaron (`3 passed`, cero salteadas), con un JSON del reporter que lee `.github/scripts/resumen-playwright.js`.

**Qué clase de bug mi gate NO ataja**:
- Lo que sólo pasa en PROD: su base tiene otros datos (miles de animales y no diez), otra variable mal cargada en un servicio de PROD, un problema que aparece con la carga real. Las suites corren contra QA, y en PROD sólo corre el smoke.
- Lo que no recorren mis tres flujos: partos, cambio de estado, la búsqueda, la ficha de un animal con muchas pesadas.
- Otros navegadores y pantallas: corro sólo Chromium de escritorio; un problema en Safari o en un celular angosto pasa.
- Lo que pasa después: si PROD se rompe diez minutos más tarde, nadie se entera (no tengo monitoreo).

### Cold start y tests flaky

QA está en el plan gratis de Render: duerme a los 15 minutos sin tráfico y despierta con hasta un minuto de demora. En el pipeline ya lo despertaron el smoke y la integración antes de la e2e, pero por internet un pedido suelto se puede demorar igual. La configuración lo absorbe **con tiempos, no con sleeps ni salteando**:
- `timeout: 60_000` por test y `expect: { timeout: 15_000 }` por aserción (el default es 5 s). Playwright reintenta cada aserción hasta su tope (*auto-waiting*): espera exactamente lo necesario y ni un `sleep`.
- La e2e arranca cada test esperando ver «API conectada» en el encabezado: si QA no despertó, falla ahí, con un mensaje claro, en vez de fallar raro más adelante.
- `retries: 1`: un reintento absorbe una demora suelta. Graba la traza en ese reintento (`trace: 'on-first-retry'`) y la captura de cada fallo (`screenshot: 'only-on-failure'`).

Un **test flaky** es el que a veces pasa y a veces falla con el mismo código. Es peor que no tener test: entrena al equipo a ignorar el rojo («seguro es el flaky, re-corré»), y el día que el rojo es de verdad, nadie lo mira. Con `retries: 1`, un test que pasa recién en el reintento sale en verde **pero marcado flaky** en el reporte y en el Summary (la columna «flaky»). Un flaky aislado lo miro y sigo (puede ser la red); el mismo test flaky dos corridas seguidas ya no es el plan gratis, es el test, y se arregla. Lo que hice para no fabricarlos: nombres únicos por corrida, cada test limpia lo suyo, ningún test depende de otro ni del orden, y ninguna espera fija.

### La misma imagen del front en QA y en PROD

Es lo que dejó preparado el TP6, y acá se usa de verdad: **la misma imagen `…-frontend:sha-<commit>`** corre en `Rodeo-front-qa` y en `Rodeo-front-prod`. Lo que las distingue son dos variables de cada servicio de Render, que no se tocaron al cambiar la fuente:
- `BACKEND_URL`: la api de **su** entorno, sin barra final. nginx la lee de la plantilla `default.conf.template` al arrancar (`proxy_pass` de `/api/`).
- `DNS_RESOLVER`: el DNS con el que nginx resuelve esa dirección (en compose es `127.0.0.11`, que en Render no existe).

Adentro de la imagen quedan el build de la SPA (que siempre llama a `/api` con ruta relativa, sin saber dónde vive la api) y la plantilla. En el back, lo mismo: la imagen es una, y cada servicio recibe su `DATABASE_URL`. Lo único que cambia por **commit** y no por entorno es `GIT_SHA`, que va adentro a propósito: describe la imagen, no el lugar donde corre.

### Límite conocido: QA es uno solo

QA lo comparten todas las corridas, y ahora la usan dos jobs seguidos. Con dos merges seguidos, la corrida B puede redesplegar QA mientras la integración o la e2e de la A lo están usando: las pruebas de A quedan a medio correr contra la imagen de B.
- **Qué vería**: un rojo en la integración o en la e2e de A que no es de mi código, o algo peor porque no avisa: un verde que en parte probó la imagen de B.
- **Cómo lo reconocería**: en *Events* de los servicios de QA, qué imagen está corriendo y a qué hora entró; en *Actions*, si el `deploy-qa` de B corrió mientras la e2e de A estaba corriendo. Si dudo de un rojo, desempata la e2e de B, que trae los dos cambios. `/health` también lo dice: si devuelve el commit de B, QA ya no es de A.
- **Qué haría**: rechazar la corrida A con el motivo (si su e2e quedó roja, ni llega a pedir aprobación) y quedarme con la B. No re-correría los jobs de prueba de A: probarían la imagen de B. El `concurrency` de `deploy-prod` no me salva acá: cancela lo que está en cola, y una corrida esperando aprobación no está en cola.
- **La regla que sigo**: un merge por vez; antes de mergear, miro en *Actions* que la corrida anterior haya terminado `integracion` y `e2e`.
- **Cómo lo resolvería un equipo real**: un entorno efímero **por corrida**, que nace con ella y se destruye al terminar.

### La release que nombra lo que está en PROD

La entrega cierra con el tag **`v7.0.0`** sobre el commit que está en PROD según *Deployments* (`gh api 'repos/{owner}/{repo}/deployments?environment=production' --jq '.[0].sha'`), no sobre la punta de `main`: entre mi última aprobación y el tag podría haber entrado otro merge que nunca llegó a PROD, y entonces `v7.0.0` nombraría algo que nadie vio andar ahí. Va con `gh release create v7.0.0 --generate-notes --verify-tag`, que falla si el tag no existe en vez de crearlo sobre la punta de `main`.

**Del tag a la imagen, en un paso**: `git rev-list -n1 v7.0.0` da el commit, y el pipeline ya publicó las dos imágenes de ese commit con su nombre: `ghcr.io/rous444/ingenieria-de-software-iii-backend:sha-<ese commit>` y su gemela `-frontend`. Ése es mi catálogo de versiones, ahora con binarios. Volver a una es mandarle esa imagen al hook de cada servicio (`imgURL=…:sha-<commit>`), el mismo mecanismo del deploy y sin reconstruir nada; el rollback ya lo practiqué en el TP6.

**Si mañana cambio Render por otro proveedor**, sobrevive casi todo: las imágenes y su registry, la estrategia de etiquetas, los tests (le hablan a una URL, no saben de nubes), el gate y la aprobación. Cambian sólo los dos pasos de deploy (en vez del hook con `imgURL`, lo que use el otro proveedor para decir «ejecutá esta imagen») y dónde viven las variables de cada servicio.

**Tags movidos**: en este cuatrimestre moví dos tags, y lo dejo escrito porque un tag movido es justo lo que §2.2 pide no hacer en silencio. `v5.0.0` lo había creado sobre un commit que no era el de la entrega y lo moví a `63931c7`; `v6.0.0` lo puse primero sobre `4f5a8ce` y lo moví a `6ee8efe` cuando el PR de documentación llegó a PROD. Los dos con `git tag -f` y `git push -f` del tag.

### Problemas encontrados

- **`RENDER_GIT_COMMIT` se iba a perder.** Un servicio de imagen no tiene repo, así que el smoke del TP6 iba a quedar comparando contra `desconocida`. Lo resolví horneando el commit en la imagen (`GIT_SHA`, arriba) y dándole prioridad en `/health`.
- **vitest iba a tomar los specs de Playwright.** vitest matchea todo `*.spec.js` por defecto y explota con los de Playwright, lo que habría puesto rojo `build-frontend` y la cadena entera. Lo excluí en `vite.config.js` (`exclude: [...configDefaults.exclude, 'e2e/**']`).
- **Las e2e no encontraban los campos de la ficha por su label**: los `<label>` no estaban asociados a sus inputs. Era un problema de accesibilidad de la app; lo arreglé en la app.
- **`getByRole('alert')` habría sido ambiguo** si le ponía `role="alert"` también al «Falta completar», que está siempre visible con el formulario vacío. Lo dejé sólo en los errores que vienen de la api.
- **Las URLs de QA no llegaban a los jobs de prueba**: las variables de un environment sólo las lee un job que lo declara. Las pasé como salidas de `deploy-qa` en vez de escribirlas de nuevo en el YAML.
- **Las releases `v5.0.0` y `v6.0.0` habían quedado sin notas.** Lo encontré revisando las entregas anteriores y las completé desde GitHub con *Generate release notes*; la `v7.0.0` las lleva desde el comando (`--generate-notes`).

### Declaración de uso de IA

Usé Claude para escribir los cambios del `ci.yml` (el deploy con `imgURL`, el `GIT_SHA` horneado, los jobs `integracion` y `e2e`, las salidas de `deploy-qa`), el endpoint `DELETE` con sus unitarios, el botón de borrar y los arreglos de accesibilidad, las dos suites de Playwright y su configuración, el script del Summary, para guiarme en el cambio de fuente de Render y para redactar esta sección.

Cómo lo verifiqué: antes de subir nada, las dos suites corrieron contra la app levantada en local (api, Postgres y el front servido con su proxy a `/api`): 6 de 6 en verde, y la base quedó vacía después (cada prueba limpió lo suyo). Después rompí la ruta del alta en local y comprobé que salían la integración verde y la e2e roja antes de hacerlo en el pipeline. En la nube, lo verifiqué contra lo que pasó: el `curl` a mano con `imgURL` y su deploy en *Events*, los cuatro servicios con runtime *Image* y sus deploys «Triggered via Deploy Hook» con el `sha-` de cada corrida, el mismo `imgURL` en el log de QA y de PROD, el `3 passed` de cada suite en el Summary, la corrida roja con `deploy-prod` salteado y los dos reportes, la traza con el `POST /api/animal` y su 404, y *Deployments* para el commit del tag. Puedo explicar qué verifica cada test, contra qué entorno corre (la integración contra la api de QA por `API_BASE_URL`, la e2e contra el front de QA por `E2E_BASE_URL`) y qué pasa si falla (la integración frena la e2e; cualquiera de las dos frena el pedido de aprobación).

## TP8 · Infraestructura como código: preprod

Preprod es un **tercer entorno**, escrito en `infra/` y creado desde cero con `terraform apply`: un proyecto de Neon propio (rol `app_preprod_owner` y base `app_preprod`) y dos servicios de Render (`rodeo-api-preprod` y `rodeo-front-preprod`) que ejecutan la imagen de `v7.0.0` (`sha-be3525c…`). QA y producción no se tocaron: no se importaron ni se migraron, y siguen como los dejé en el TP7.

### Riel y versiones

- **Riel canónico**: Terraform (local, en Windows) contra **Neon** y **Render**, las mismas cuentas del TP6.
- **Providers fijados por versión**: `kislerdm/neon` **0.18.0** y `render-oss/render` **1.9.1**, con `required_version = ">= 1.5"`. El `.terraform.lock.hcl` está commiteado: fija además el hash exacto de cada provider. El de Neon tiene el repositorio archivado y el oficial va a salir con otro `source`: el día que exista, se cambia el `source`, `terraform init -upgrade` y se lee el plan.
- **Credenciales fuera del HCL**: los providers leen `NEON_API_KEY`, `RENDER_API_KEY` y `RENDER_OWNER_ID` del entorno de la terminal. En el repo no hay ninguna.
- **Lo que se deriva y no se copia**: `DATABASE_URL` de la api se arma en un `local` con el host del proyecto, el nombre de la base, el rol y la contraseña que generó Neon (`urlencode` por las dudas). La `BACKEND_URL` del front sale de `render_web_service.api.url` (con `trimsuffix` de la barra). En el TP6 las dos se pegaban a mano.
- **El estado** vive en mi máquina (`infra/terraform.tfstate`), sin backend remoto. El `.gitignore` cubre `*.tfstate`, `*.tfstate.*`, `.terraform/` y `*.tfvars` desde antes del primer apply: el estado tiene la contraseña de la base en texto plano.

### Problemas y cómo los resolví

- **`terraform` no se reconocía después de instalarlo con `winget`**: la ventana de PowerShell seguía con el PATH viejo. Lo resolví recargando el PATH en la misma sesión (o abriendo una ventana nueva).
- **Las variables no se cargaban**: estaba en `cmd` usando la sintaxis de PowerShell (`$env:VAR="…"`). En `cmd` es `set "VAR=…"`; en PowerShell, `$env:VAR="…"`. El `plan` lo dejó claro: `Missing Render API Key` y `authorization key must be provided`.
- **Expuse las API keys de Neon y Render** al pegar la salida de la terminal en un chat. Las revoqué y creé otras: lo creado no se ve afectado, porque las claves sólo se usan para hablar con el proveedor al planear y aplicar.
- **Preprod no volvía idéntico**: en el primer `apply` la base nació en `us-east-1` y, después de `destroy` y `apply`, en `us-east-2`. Las URLs de Render fueron las mismas (sin sufijo), pero el host de la base cambiaba de región, porque Neon elige una por defecto cada vez. Fijé `region_id = "aws-us-west-2"` (Oregon, la misma región que los servicios). Lo apliqué con `destroy` y `apply`, no con un cambio en caliente: cambiar la región recrea el proyecto, eso cambia la `DATABASE_URL` de la api, y Render no deja actualizar un servicio del plan gratuito.
- **Render no actualiza servicios gratuitos** (`maintenance mode can only be configured for non-free tier services`, defecto conocido del provider). Por eso preprod en Render sólo se crea y se destruye: si tiene que cambiar, `destroy` y `apply`, o `apply -replace=…`.

### Declaración de uso de IA

Usé Claude para escribir el HCL de `infra/` (providers fijados, recursos, la cadena de conexión y la URL derivadas, outputs), el `.gitignore` y esta sección, y para diagnosticar los problemas de arriba. Lo verifiqué contra lo que pasó: `validate` en verde; el plan leído antes de aplicar (`5 to add`, qué es cada recurso y por qué tantos valores dicen `known after apply`); el `apply` creando en orden proyecto, rol, base, api y front; `/health` con la base `ok` y el commit de v7.0.0, `/api/animales` devolviendo `[]` contra la base nueva y el front con "API conectada"; el segundo `plan` sin cambios; el `destroy` recorriendo el grafo al revés; y QA y producción intactos en las dos consolas. Puedo leer un plan en voz alta y decir qué haría cada acción.

## TP9 · DevSecOps + observabilidad

Las tres protecciones automáticas de GitHub quedaron activas en el repo (Dependabot con sus alertas y actualizaciones de seguridad, CodeQL con la configuración por defecto, y push protection), producción tiene un monitor externo en UptimeRobot, y la api y el front de producción le cuentan a Sentry qué falla, qué tarda y qué se usa.

### El PR de Dependabot que mergeé, y por qué me animé

`.github/dependabot.yml` vigila tres ecosistemas: npm del backend, npm del frontend y las GitHub Actions (PR #51). A los minutos del merge abrió una tanda de PRs, y el pipeline los separó solo:

- **En rojo, todos los saltos de versión mayor**: vite 5 → 8, vitest 3 → 5 (back y front), @vitest/coverage-v8 3 → 5, react-dom 18 → 19, @vitejs/plugin-react 4 → 6. Un major puede romper la API, y la build o los tests lo confirmaron sin que nadie tuviera que leer un changelog. No los mergeé: cada uno es una migración que se planifica, no un clic.
- **En verde, `pg` 8.23.0 → 8.23.1** (https://github.com/Rous444/Ingenieria-de-Software-III/pull/61). Es un **patch** de SemVer: arreglos, sin cambios de API. Lo mergeé porque el verde de ese PR no es "compiló": es el semestre entero diciendo que sí. Los unitarios del back con su umbral de cobertura (TP5), y después del merge la cadena completa (https://github.com/Rous444/Ingenieria-de-Software-III/actions/runs/39270065369): deploy a QA de la imagen nueva, el smoke, **la integración contra el Postgres de verdad** (la capa que justamente usa `pg`, TP7) y la e2e, antes de la aprobación a PROD.

Las alertas de Dependabot marcaban 17 vulnerabilidades (5 críticas) al prenderlas, y las actualizaciones de seguridad abrieron solas los PRs #44 a #50. Los paquetes que tocan esos PRs son vite, esbuild, vitest, tinypool y source-map-js: herramientas de desarrollo y de tests, que **no entran a las imágenes de producción**: la del back instala con `npm ci --omit=dev` y la del front sólo lleva el `dist/` servido por nginx. No es excusa para dejarlas (vite corre en la máquina de quien desarrolla), pero ordena la prioridad.

### El monitor: cuánto tardó en avisarme

Monitor HTTP(s) de UptimeRobot sobre `https://rodeo-api-prod.onrender.com/health`, cada 5 minutos, con aviso por email. Antes de crearlo comprobé con `curl -I` que el endpoint contesta **HEAD** con 200 (el plan gratis pregunta con HEAD; Express lo contesta solo para cualquier ruta GET).

La caída provocada, el 19/10:

| | Hora |
|---|---|
| Suspendí `Rodeo-api-prod` en Render | 14:07 |
| Mail **DOWN** | 14:10 |
| Reanudé el servicio | 14:14 |
| Mail **UP** | 14:15 |

**Tres minutos** desde la caída hasta el aviso (el intervalo es de 5: depende de en qué parte del ciclo cae). Sin el monitor me habría enterado cuando un usuario escribiera, que en el escenario del TP fueron cuarenta minutos un sábado. El UP llegó rápido porque abrí `/health` en el navegador para despertar el servicio.

Al terminar **pausé el monitor**: uno que le pega a PROD cada 5 minutos la mantiene despierta todo el mes y se come las 750 horas que comparten todos mis servicios gratuitos; si se acaban, Render suspende también producción.

### Sentry: mi operación más usada y la más lenta

Dos proyectos de Sentry, uno por lado. En el back, `@sentry/node` se carga con `node --import ./src/instrument.js` antes que la app, para medir Express y `pg` desde adentro; el DSN entra por la variable `SENTRY_DSN`, cargada **sólo** en el servicio de producción (sin ella la librería queda apagada: local, tests, QA y preprod). En el front, `@sentry/react` con el DSN escrito en `main.jsx`: no es un secreto, sólo sirve para **enviar** datos al proyecto (no para leerlos) y viaja igual en el JavaScript que baja cualquier navegador. Para ver un error llegar subí un `/api/falla` temporal (PR #66), lo llamé desde producción y apareció en *Issues* como "Error: Falla de prueba del TP9", sin manejar, con la ruta. En este PR se saca.

Lo que midió en producción, después de usarla unos minutos:

| Operación | P95 | Pedidos |
|---|---|---|
| `GET /api/animales` (la lista y la búsqueda) | 201 ms | ~6, **la más usada** |
| `POST /api/animales` (el alta) | 1,38 s | ~3 |
| `GET /api/animales/:id` (la ficha) | **1,44 s, la más lenta** | ~2 |
| `PATCH /api/animales/:id/estado` | 367 ms | 1 |

La más usada es la lista: se pide al abrir la app y con cada búsqueda. La más lenta es la ficha, y Sentry dice por qué: la consulta en sí tarda 176 ms, el resto es **abrir la conexión a Neon** (`connect` 1,08 s, `pg-connect` 529 ms), que se suspende sin uso y el primer pedido paga el arranque. Con ese dato abrí la tarjeta https://github.com/Rous444/Ingenieria-de-Software-III/issues/67 en el tablero del TP3, con el número adentro y un criterio de hecho (P95 de la ficha por debajo de 500 ms, medido en Sentry).

**Lo que el monitor no ve y Sentry sí**: el monitor sólo sabe si `/health` contesta. Sentry ve el error de una ruta que el monitor nunca pregunta, y que la ficha tarda 1,4 s aunque todo "esté arriba".

### Problemas y cómo los resolví

- **El primer DSN del front era de otro proyecto.** El número final de un DSN es el id del proyecto, y no coincidía con el del proyecto React (probablemente uno creado y borrado en el onboarding). Lo copié de nuevo desde *Client Keys (DSN)* del proyecto correcto antes de mergear.
- **Cargar `SENTRY_DSN` sin tirar PROD para atrás.** En un servicio de imagen, "Save and deploy" despliega la imagen configurada en *Settings* (la del primer merge del TP7), no la que está corriendo. La guardé con **"Save only"** y la tomó el deploy del pipeline del PR #66.
- **Los majors de Dependabot en rojo**: no es un problema a resolver ahora, es el pipeline haciendo su trabajo. Quedan abiertos como deuda visible.
- **El proyecto del back quedó con el nombre `rodei`** (typo). No afecta nada: el DSN es lo que importa.

### Declaración de uso de IA

Usé Claude para escribir el `dependabot.yml`, la integración de Sentry (el `instrument.js`, el `--import` del Dockerfile, el manejador de errores de Express y el `Sentry.init` del front), el endpoint de prueba, el texto de la tarjeta y esta sección, y para guiarme en las configuraciones de GitHub, Sentry, Render y UptimeRobot. Lo verifiqué así: antes de subirlo, levanté la api local contra un receptor falso de Sentry y vi llegar las transacciones y el evento del error, sin DSN la api arrancó igual, y `curl -I` a `/health` dio 200; los 58 unitarios del back, los 12 del front y las 6 pruebas de integración y e2e siguieron en verde. En la nube, contra lo que pasó: el PR de `pg` con su cadena hasta PROD, el error y la tabla de transacciones en Sentry, los mails de DOWN y UP con sus horas, y el monitor pausado.
