locals {
  # 参照手順書に基づき、DB種別ごとの設定差分を定義
  db_params = {
    mysql = [
      { name = "character_set_client", value = "utf8mb4" },
      { name = "character_set_connection", value = "utf8mb4" },
      { name = "character_set_database", value = "utf8mb4" },
      { name = "character_set_results", value = "utf8mb4" },
      { name = "character_set_server", value = "utf8mb4" },
      { name = "collation_server", value = "utf8mb4_general_ci" },
      { name = "time_zone", value = "Asia/Tokyo" },
      { name = "log_timestamps", value = "SYSTEM" },
      { name = "table_definition_cache", value = "400" }
    ],
    mariadb = [
      { name = "character_set_client", value = "utf8mb4" },
      { name = "character_set_connection", value = "utf8mb4" },
      { name = "character_set_database", value = "utf8mb4" },
      { name = "character_set_results", value = "utf8mb4" },
      { name = "character_set_server", value = "utf8mb4" },
      { name = "collation_server", value = "utf8mb4_general_ci" },
      { name = "time_zone", value = "Asia/Tokyo" },
      { name = "table_definition_cache", value = "400" }
    ],
    postgres = [
      { name = "timezone", value = "Asia/Tokyo" }
    ]
  }

  version_parts    = split(".", var.engine_version)
  postgres_family  = "postgres${local.version_parts[0]}"
  other_family     = "${var.engine}${local.version_parts[0]}.${try(local.version_parts[1], "0")}"
  parameter_family = var.engine == "postgres" ? local.postgres_family : local.other_family
}

resource "aws_db_parameter_group" "this" {
  name        = "${var.identifier}-pg"
  family      = local.parameter_family
  description = "Parameter group for ${var.identifier}"

  dynamic "parameter" {
    for_each = lookup(local.db_params, var.engine, [])
    content {
      name  = parameter.value.name
      value = parameter.value.value
    }
  }

  tags = {
    Name = "${var.identifier}-pg"
  }
}
