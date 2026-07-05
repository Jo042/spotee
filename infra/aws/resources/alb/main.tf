# -----------------------------
# ALB本体
# -----------------------------
resource "aws_lb" "this" {
  name               = var.alb_name
  load_balancer_type = "application"

  subnets         = var.public_subnet_ids
  security_groups = [var.alb_sg_id]

  tags = {
    Name = var.alb_name
  }
}

# -----------------------------
# Target Group
# -----------------------------
resource "aws_lb_target_group" "this" {
  for_each = {
    for tg in var.target_groups : tg.name => tg
  }

  name     = each.value.name
  port     = each.value.port
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path    = var.health_check_path
    matcher = var.health_check_matcher
  }

  tags = {
    Name = each.value.name
  }
}

# -----------------------------
# Target Group Attachment（EC2登録）
# -----------------------------
resource "aws_lb_target_group_attachment" "this" {
  for_each = merge([
    for tg in var.target_groups : {
      for idx, instance_id in var.target_ids :
      "${tg.name}-${idx}" => {
        tg_name     = tg.name
        port        = tg.port
        instance_id = instance_id
      }
    }
  ]...)

  target_group_arn = aws_lb_target_group.this[each.value.tg_name].arn

  target_id = each.value.instance_id
  port      = each.value.port
}

# -----------------------------
# HTTP Listener
# -----------------------------
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "forward"

    target_group_arn = aws_lb_target_group.this[var.default_target_group].arn
  }
}

# -----------------------------
# HTTPS Listener（証明書ある時だけ）
# -----------------------------
resource "aws_lb_listener" "https" {
  count = var.enable_https && var.certificate_arn != "" ? 1 : 0

  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"

  ssl_policy      = var.ssl_policy
  certificate_arn = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this[var.default_target_group].arn
  }
}

# -----------------------------
# Listener Rules
# -----------------------------
resource "aws_lb_listener_rule" "this" {
  for_each = {
    for rule in var.listener_rules :
    "${rule.priority}-${rule.path_pattern}" => rule
  }

  listener_arn = (
    var.enable_https && var.certificate_arn != ""
    ? aws_lb_listener.https[0].arn
    : aws_lb_listener.http.arn
  )

  priority = each.value.priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this[each.value.target_group_name].arn
  }

  condition {
    path_pattern {
      values = [each.value.path_pattern]
    }
  }
}
