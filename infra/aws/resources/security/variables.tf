variable "vpc_id" {
  description = "Security Groupを作成するVPC ID"
  type        = string
}

variable "security_groups" {
  description = "Security Group設定"
  type = list(object({
    name        = string
    description = string
    rules = list(object({
      type            = string
      protocol        = string
      from_port       = number
      to_port         = number
      description     = string
      cidr_blocks     = optional(list(string), [])
      prefix_list_ids = optional(list(string), [])
      source_sg_name  = optional(string)
    }))
  }))

  validation {
    condition     = length(var.security_groups) > 0
    error_message = "security_groups には1件以上のSecurity Groupが必要です。"
  }

  validation {
    condition = alltrue(flatten([
      for sg in var.security_groups : [
        for r in sg.rules : (
          r.type != "ingress" ? true : (
            (
              (length(try(r.cidr_blocks, [])) > 0 ? 1 : 0) +
              (length(try(r.prefix_list_ids, [])) > 0 ? 1 : 0) +
              ((try(r.source_sg_name, null) != null && try(r.source_sg_name, "") != "") ? 1 : 0)
            ) == 1
          )
        )
      ]
    ]))
    error_message = "ingressルールでは cidr_blocks / prefix_list_ids / source_sg_name のいずれか1種類だけを指定してください。"
  }

  validation {
    condition = alltrue(flatten([
      for sg in var.security_groups : [
        for r in sg.rules : (
          r.type != "egress" ? true : (
            try(r.source_sg_name, null) == null || try(r.source_sg_name, "") == ""
          )
        )
      ]
    ]))
    error_message = "egressルールでは source_sg_name は使えません。"
  }
}
