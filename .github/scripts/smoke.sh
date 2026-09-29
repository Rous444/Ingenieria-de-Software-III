#!/usr/bin/env bash
# Smoke test post-deploy: ¿el entorno que acabamos de desplegar está vivo, y es
# el commit que el pipeline verificó?
#
# Lo usan deploy-qa y deploy-prod (una receta, no dos). Recibe por entorno:
#   ENTORNO       qa | production (sólo para los mensajes)
#   URL_API       https://<api-del-entorno>.onrender.com   (sin barra final)
#   URL_FRONT     https://<front-del-entorno>.onrender.com (sin barra final)
#   COMMIT        el commit que se mandó a desplegar ($GITHUB_SHA)
#
# Reintenta porque el contrato del free tier de Render incluye el build (2 a 5
# min por servicio) y el cold start de un servicio dormido (hasta ~1 min). Un
# curl seco daría falsos rojos. El --max-time de cada curl es lo que evita que
# un servicio que acepta la conexión y no contesta cuelgue el job entero.
set -u
INTENTOS=${INTENTOS:-36}
ESPERA=${ESPERA:-20}

if [ -z "${URL_API:-}" ] || [ -z "${URL_FRONT:-}" ]; then
  echo "❌ Faltan URL_API / URL_FRONT: cargalas como variables del environment '$ENTORNO' en GitHub."
  exit 1
fi

echo "Smoke de $ENTORNO · esperando el commit ${COMMIT:0:7}"
for i in $(seq 1 "$INTENTOS"); do
  # 1) El proceso vive y la base contesta (/health hace un SELECT 1)
  if salud=$(curl -fsS --max-time 10 "$URL_API/health"); then
    version=$(echo "$salud" | jq -r '.version // "desconocida"')

    # 2) ¿Es el commit que mandamos? Mientras Render construye, sigue sirviendo
    #    la versión anterior: sin esta comparación el smoke daría verde contra
    #    la vieja. Si la api no informa versión, se avisa y no se compara.
    if [ "$version" != "desconocida" ] && [ "$version" != "$COMMIT" ]; then
      echo "[$i/$INTENTOS] la api contesta, pero todavía corre ${version:0:7}"
    elif curl -fsS --max-time 10 "$URL_API/api/animales" > /dev/null \
      && curl -fsS --max-time 10 "$URL_FRONT/" > /dev/null \
      && curl -fsS --max-time 10 "$URL_FRONT/api/animales" > /dev/null; then
      # 3) La api lista datos (toca las tablas, no sólo la conexión), el front
      #    sirve la página, y el front llega a SU api a través de nginx.
      [ "$version" = "desconocida" ] && echo "⚠️  la api no informa qué commit corre: no se pudo comparar"
      echo "✅ $ENTORNO responde (api + base + front + front→api) con el commit ${version:0:7}"
      exit 0
    else
      echo "[$i/$INTENTOS] la api corre el commit correcto, pero algo más no contesta todavía"
    fi
  else
    echo "[$i/$INTENTOS] la api no contesta (build en curso o cold start)"
  fi
  sleep "$ESPERA"
done

echo "❌ $ENTORNO no respondió con el commit ${COMMIT:0:7} a tiempo"
exit 1
