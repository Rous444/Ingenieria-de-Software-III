# Nada de esto es secreto (una imagen pública, una etiqueta, una región): por eso
# va con default en un archivo que se commitea. Los *.tfvars quedan para lo que no.

variable "image_repo_api" {
  description = "Imagen del backend en el registry, SIN etiqueta"
  default     = "ghcr.io/rous444/ingenieria-de-software-iii-backend"
}

variable "image_repo_front" {
  description = "Imagen del frontend en el registry, SIN etiqueta"
  default     = "ghcr.io/rous444/ingenieria-de-software-iii-frontend"
}

variable "image_tag" {
  description = "La imagen que corre preprod: la de v7.0.0, el commit que está en PROD"
  default     = "sha-be3525c32388c11b8b17b6e9f984f29c68eac815"
}

variable "region" {
  description = "Región de Render (la misma que QA y PROD)"
  default     = "oregon"
}
