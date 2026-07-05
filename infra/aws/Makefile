BOOTSTRAP_DIR := bootstrap
TF_DIR        := .

.PHONY: help \
        bootstrap-init bootstrap-plan bootstrap-apply bootstrap-destroy bootstrap-output bootstrap-fmt bootstrap-validate \
        init plan apply apply-auto destroy destroy-auto fmt validate output \
        module-plan module-apply module-destroy check-module

help:
	@echo "Bootstrap (S3 state bucket / local state):"
	@echo "  make bootstrap-init"
	@echo "  make bootstrap-plan"
	@echo "  make bootstrap-apply"
	@echo "  make bootstrap-destroy     # 注意: mainのstate置き場ごと消える。mainをdestroyし終わってから最後に"
	@echo "  make bootstrap-output"
	@echo ""
	@echo "Main env (infra/aws, S3 backend):"
	@echo "  make init"
	@echo "  make plan"
	@echo "  make apply"
	@echo "  make apply-auto"
	@echo "  make destroy"
	@echo "  make destroy-auto"
	@echo "  make fmt"
	@echo "  make validate"
	@echo "  make output"
	@echo ""
	@echo "Module-targeted (main env):"
	@echo "  make module-plan MODULE=vpc"
	@echo "  make module-apply MODULE=vpc"
	@echo "  make module-destroy MODULE=vpc"

# ---- bootstrap（ローカルstate） ----
bootstrap-init:
	tofu -chdir=$(BOOTSTRAP_DIR) init
	@$(MAKE) bootstrap-fmt
	@$(MAKE) bootstrap-validate

bootstrap-plan:
	tofu -chdir=$(BOOTSTRAP_DIR) plan

bootstrap-apply:
	tofu -chdir=$(BOOTSTRAP_DIR) apply

bootstrap-destroy:
	tofu -chdir=$(BOOTSTRAP_DIR) destroy

bootstrap-output:
	tofu -chdir=$(BOOTSTRAP_DIR) output

bootstrap-fmt:
	tofu -chdir=$(BOOTSTRAP_DIR) fmt -recursive

bootstrap-validate:
	tofu -chdir=$(BOOTSTRAP_DIR) validate

# ---- main env（S3 backend） ----
init:
	tofu -chdir=$(TF_DIR) init
	@$(MAKE) fmt
	@$(MAKE) validate

plan:
	tofu -chdir=$(TF_DIR) plan

apply:
	tofu -chdir=$(TF_DIR) apply

apply-auto:
	tofu -chdir=$(TF_DIR) apply -auto-approve

destroy:
	tofu -chdir=$(TF_DIR) destroy

destroy-auto:
	tofu -chdir=$(TF_DIR) destroy -auto-approve

fmt:
	tofu -chdir=$(TF_DIR) fmt -recursive

validate:
	tofu -chdir=$(TF_DIR) validate

output:
	tofu -chdir=$(TF_DIR) output

# ---- module-targeted（main envのみ） ----
check-module:
	@if [ -z "$(MODULE)" ]; then \
		echo "MODULE is required. Example: make module-plan MODULE=vpc"; \
		exit 1; \
	fi

module-plan: check-module
	tofu -chdir=$(TF_DIR) plan -target=module.$(MODULE)

module-apply: check-module
	tofu -chdir=$(TF_DIR) apply -target=module.$(MODULE)

module-destroy: check-module
	tofu -chdir=$(TF_DIR) destroy -target=module.$(MODULE)
