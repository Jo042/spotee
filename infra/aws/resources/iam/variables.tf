variable "role_name" {
  description = "IAMロール・instance profileの名前"
  type        = string
}

variable "ecr_repository_arn" {
  description = "pullを許可するECRリポジトリのARN"
  type        = string
}

variable "ssm_parameter_arns" {
  description = "読み取りを許可するSSMパラメータのARN一覧"
  type        = list(string)
}
