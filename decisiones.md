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