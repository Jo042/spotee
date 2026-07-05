locals {
  subnet_kind = lower(trimspace(var.ec2_subnet_kind))

  # subnet_name が空なら、kindの先頭subnetを採用（以前の挙動）
  effective_subnet_name = (
    trimspace(var.ec2_subnet_name) != "" ? var.ec2_subnet_name :
    (
      local.subnet_kind == "public"
      ? try(var.public_subnet_names[0], "")
      : try(var.private_subnet_names[0], "")
    )
  )

  effective_subnet_id = lookup(var.subnet_ids_by_name, local.effective_subnet_name, null)

  # 規定：ec2_<マシン名>（小文字）
  required_sg_name = "ec2_${var.ec2_name_tag}"

  # SG IDsの決定：
  # 1) 明示の ec2_security_group_ids があればそれを優先
  # 2) なければ required_sg_name を map から引く
  effective_sg_ids = (
    var.ec2_security_group_ids != null && length(var.ec2_security_group_ids) > 0
    ? var.ec2_security_group_ids
    : (
      try(var.security_group_ids_by_name[local.required_sg_name], null) != null
      ? [var.security_group_ids_by_name[local.required_sg_name]]
      : []
    )
  )

  # keypair：空なら name_tag を採用（旧「マシン名と同じでOK」）
  effective_key_name = trimspace(var.ec2_key_name) != "" ? var.ec2_key_name : var.ec2_name_tag

  # profile：空文字はnullに落として “未指定” 扱い
  effective_iam_profile = (
    var.ec2_iam_instance_profile != null && trimspace(var.ec2_iam_instance_profile) != ""
    ? var.ec2_iam_instance_profile
    : null
  )

  ami_id_from_var = trimspace(var.ec2_ami_id) != "" ? var.ec2_ami_id : null

  ami_id_from_ssm = try(data.aws_ssm_parameter.al2023[0].value, null)

  effective_ami_id = coalesce(local.ami_id_from_var, local.ami_id_from_ssm)
}

data "aws_ssm_parameter" "al2023" {
  count = trimspace(var.ec2_ami_id) == "" ? 1 : 0
  name  = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_instance" "main" {
  ami           = local.effective_ami_id
  instance_type = var.ec2_instance_type

  subnet_id                   = local.effective_subnet_id
  vpc_security_group_ids      = local.effective_sg_ids
  associate_public_ip_address = var.ec2_associate_public_ip_address

  key_name             = local.effective_key_name
  iam_instance_profile = local.effective_iam_profile

  user_data                   = var.ec2_user_data
  user_data_replace_on_change = var.ec2_user_data != null

  disable_api_termination              = var.ec2_disable_api_termination
  instance_initiated_shutdown_behavior = var.ec2_shutdown_behavior

  root_block_device {
    volume_size           = var.ec2_root_volume_size_gb
    volume_type           = var.ec2_root_volume_type
    delete_on_termination = var.ec2_enable_delete_on_termination
  }

  tags = merge(
    var.ec2_tags,
    {
      Name = var.ec2_name_tag
    }
  )

  dynamic "credit_specification" {
    for_each = (var.ec2_cpu_credits != null && trimspace(var.ec2_cpu_credits) != "") ? [1] : []
    content {
      cpu_credits = var.ec2_cpu_credits
    }
  }

  lifecycle {
    precondition {
      condition     = local.effective_subnet_id != null
      error_message = "EC2 subnet の解決に失敗しました。subnet_kind=${var.ec2_subnet_kind}, subnet_name='${var.ec2_subnet_name}', effective='${local.effective_subnet_name}' が subnet_ids_by_name に存在しません。"
    }
    precondition {
      condition     = length(local.effective_sg_ids) > 0
      error_message = "EC2に付与するSGが解決できません。規定名 '${local.required_sg_name}' が security_group_ids_by_name に存在しないか、ec2_security_group_ids が未指定です。"
    }
    precondition {
      condition     = local.effective_ami_id != null && local.effective_ami_id != ""
      error_message = "AMI ID が未指定です。ec2_ami_id を明示指定するか、空のままSSMからの自動解決に任せてください。"
    }
  }
}
