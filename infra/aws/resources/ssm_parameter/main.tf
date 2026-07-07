resource "aws_ssm_parameter" "this" {
  for_each = toset(var.parameter_names)

  name  = "${var.path_prefix}/${each.value}"
  type  = contains(var.secure_parameter_names, each.value) ? "SecureString" : "String"
  value = var.parameter_values[each.value]

  tags = {
    Name = each.value
  }
}
