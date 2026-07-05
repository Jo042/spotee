provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "spotee"
      ManagedBy = "opentofu"
      Component = "bootstrap"
    }
  }
}
