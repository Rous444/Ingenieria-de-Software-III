# TP8 · El entorno PREPROD, escrito.
#
# No toca QA ni producción (los clickeé en el TP6 y siguen así): crea un TERCER
# entorno que no existe hasta que se aplica esto, y que desaparece con un destroy.
#   base: un proyecto de Neon propio (se puede destruir entero sin rozar nada más)
#   api y front: dos servicios de Render que ejecutan la imagen del TP7
#
# Las credenciales NO están acá: los providers las leen del entorno
# (NEON_API_KEY, RENDER_API_KEY, RENDER_OWNER_ID).

terraform {
  required_version = ">= 1.5"

  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "0.18.0" # fijada: repo archivado, el oficial va a salir con otro source
    }
    render = {
      source  = "render-oss/render"
      version = "1.9.1"
    }
  }
}

provider "neon" {}   # lee NEON_API_KEY
provider "render" {} # lee RENDER_API_KEY y RENDER_OWNER_ID

# ── La base ─────────────────────────────────────────────────────────────────────

resource "neon_project" "preprod" {
  name = "rodeo-preprod"

  # Sin esto el primer apply falla: el provider pide un día de historial y el
  # plan gratuito permite seis horas.
  history_retention_seconds = 21600
}

resource "neon_role" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id # default_branch_id, no branch_id
  name       = "app_preprod_owner"
}

resource "neon_database" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod"
  owner_name = neon_role.preprod.name
}

# ── Los servicios ───────────────────────────────────────────────────────────────

locals {
  # La cadena de conexión se ARMA con lo que devolvió Neon: nadie la copia y pega.
  # En el TP6 se pegaba a mano, y así es como un entorno termina hablando con la
  # base de otro. La contraseña la genera Neon y va codificada por si trae
  # caracteres especiales. Es el mismo formato que DATABASE_URL en QA y PROD.
  database_url = "postgresql://${neon_role.preprod.name}:${urlencode(neon_role.preprod.password)}@${neon_project.preprod.database_host}/${neon_database.preprod.name}?sslmode=require"
}

resource "render_web_service" "api" {
  name   = "rodeo-api-preprod"
  plan   = "free"
  region = var.region

  runtime_source = {
    image = {
      image_url = var.image_repo_api # SIN la etiqueta: va en su propio campo
      tag       = var.image_tag
    }
  }

  env_vars = {
    DATABASE_URL = { value = local.database_url }
    # GIT_SHA NO va acá: viene horneado en la imagen (TP7). Una variable del
    # servicio lo pisaría y /health diría un commit que no es el de la imagen.
  }
}

resource "render_web_service" "front" {
  name   = "rodeo-front-preprod"
  plan   = "free"
  region = var.region

  runtime_source = {
    image = {
      image_url = var.image_repo_front
      tag       = var.image_tag # la MISMA etiqueta que la api: salen de la misma corrida
    }
  }

  env_vars = {
    # La dirección de la api sale del atributo url de SU api, no de un copy-paste.
    # trimsuffix por las dudas: con una barra al final nginx mandaría todo a / (TP6).
    BACKEND_URL  = { value = trimsuffix(render_web_service.api.url, "/") }
    DNS_RESOLVER = { value = "8.8.8.8" } # en Render no existe el DNS de compose (127.0.0.11)
  }
}
