variable "path_prefix" {
  description = "パラメータ名のprefix（例: /spotee/backend）。先頭にスラッシュを含める"
  type        = string
}

variable "parameter_names" {
  description = "作成するパラメータ名の一覧（非機微。for_eachのキーに使うためsensitiveにしない）"
  type        = list(string)
}

variable "parameter_values" {
  description = "パラメータ名 => 値。機微情報を含み得るためsensitive"
  type        = map(string)
  sensitive   = true
}

variable "secure_parameter_names" {
  description = "この一覧に含まれる名前はSecureStringとして作成する（含まれなければString）"
  type        = list(string)
  default     = []
}
