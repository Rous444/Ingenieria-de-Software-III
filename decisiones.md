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
