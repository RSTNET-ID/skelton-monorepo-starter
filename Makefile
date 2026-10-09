SHELL := /bin/sh
.DEFAULT_GOAL := help

ENV_FILE ?= .env
COMPOSE := docker compose --env-file $(ENV_FILE) -f docker-compose.yml
BUILD_COMPOSE := docker compose --env-file $(ENV_FILE) -f docker-compose.yml -f docker-compose.build.yml
HEALTH_HOST ?= 127.0.0.1
HEALTH_PORT ?= $(shell sed -n 's/^APP_PUBLISHED_PORT=//p' $(ENV_FILE) 2>/dev/null | tail -n 1)
HEALTH_PORT := $(if $(HEALTH_PORT),$(HEALTH_PORT),3000)

.PHONY: query-guard hooks-install verify tenants-validate docker-smoke docker-rollback help env-init dev dev-frontend dev-backend build check typecheck lint test \
 docker-config docker-build docker-build-no-cache docker-push \
 docker-dev-up docker-dev-down docker-dev-logs docker-dev-ps \
 docker-prod-pull docker-prod-up docker-prod-down docker-prod-logs docker-prod-ps docker-prod-restart \
 docker-worker-up docker-scheduler-up docker-logs-api docker-logs-worker docker-logs-scheduler docker-health \
 backend-migrate backend-seed backend-test backend-audit backend-typecheck backend-build clean

query-guard:
	bun run query:guard

hooks-install:
	bun run prepare

verify:
	bun run query:guard
	bun run query:guard:test
	bun run check
	bun run lint
	bun run test:unit
	bun run build

# Run from source checkout, pointing at a directory containing tenant subfolders.
tenants-validate:
	bun scripts/validate-tenants.ts $(TENANTS_DIR)

# Requires an already-running app. HTTP aggregate health verifies API and DB readiness.
docker-smoke:
	$(COMPOSE) config --quiet
	$(COMPOSE) ps
	$(MAKE) docker-health ENV_FILE=$(ENV_FILE)

# Requires the previous *existing* image tag to be explicitly supplied.
# This changes the running container only. Also restore IMAGE_TAG in tenant .env
# before the next deploy to keep declared and running versions consistent.
docker-rollback:
	@test -n "$(ROLLBACK_TAG)" || { echo "Set ROLLBACK_TAG=<previous-immutable-tag>"; exit 1; }
	IMAGE_TAG=$(ROLLBACK_TAG) $(COMPOSE) up -d --no-build --pull always app
	IMAGE_TAG=$(ROLLBACK_TAG) $(COMPOSE) ps

help:
	@echo "RSTNET-ID MONOREPO - Bun, SvelteKit, Hono, Turborepo"
	@echo "  make env-init             Create .env from .env.example (never overwrite)"
	@echo "  make dev                  Run web and API via Turborepo"
	@echo "  make dev-frontend         Start web"
	@echo "  make dev-backend          Start API"
	@echo "  make build|check|lint|test|verify|query-guard|hooks-install"
	@echo "  make tenants-validate TENANTS_DIR=/opt/apps"
	@echo "  make docker-config        Validate interpolated Compose"
	@echo "  make docker-smoke         Check running container and readiness"
	@echo "  make docker-rollback ROLLBACK_TAG=1.0.2  Roll back running container"
	@echo "  make docker-build         Build ONE combined image"
	@echo "  make docker-build-no-cache"
	@echo "  make docker-push          Push image to registry"
	@echo "  make docker-dev-up|docker-dev-down|docker-dev-logs|docker-dev-ps"
	@echo "  make docker-prod-pull|docker-prod-up|docker-prod-down|docker-prod-logs|docker-prod-ps|docker-prod-restart"
	@echo "  make docker-worker-up|docker-scheduler-up"
	@echo "  make docker-logs-api|docker-logs-worker|docker-logs-scheduler|docker-health"
	@echo "  make backend-migrate|backend-seed|backend-test|backend-audit|backend-typecheck|backend-build"
	@echo "  Override ENV_FILE=.env.prod for production"

env-init:
	@test ! -e .env || { echo ".env already exists; refusing overwrite"; exit 1; }
	cp .env.example .env
	@echo "Edit .env before running local dev or Docker; connection strings are placeholders."

dev:
	bun run dev
dev-frontend:
	bun run dev:web
dev-backend:
	bun run dev:api
build:
	bun run build
check typecheck:
	bun run check
lint:
	bun run lint
test:
	bun run test

docker-config:
	$(COMPOSE) config --quiet
docker-build:
	$(BUILD_COMPOSE) build app
docker-build-no-cache:
	$(BUILD_COMPOSE) build --no-cache app
docker-push:
	$(COMPOSE) push app
docker-dev-up:
	$(BUILD_COMPOSE) up -d --build app
docker-dev-down:
	$(COMPOSE) down
docker-dev-logs:
	$(COMPOSE) logs -f app
docker-dev-ps:
	$(COMPOSE) ps

docker-prod-pull:
	$(COMPOSE) pull app
docker-prod-up:
	$(COMPOSE) up -d --no-build --pull always app
docker-prod-down:
	$(COMPOSE) down
docker-prod-logs:
	$(COMPOSE) logs -f app
docker-prod-ps:
	$(COMPOSE) ps
docker-prod-restart:
	$(COMPOSE) restart app

docker-worker-up:
	$(COMPOSE) --profile worker up -d --no-build worker
docker-scheduler-up:
	$(COMPOSE) --profile scheduler up -d --no-build scheduler
docker-logs-api:
	$(COMPOSE) logs -f app
docker-logs-worker:
	$(COMPOSE) --profile worker logs -f worker
docker-logs-scheduler:
	$(COMPOSE) --profile scheduler logs -f scheduler
docker-health:
	curl -fsS "http://$(HEALTH_HOST):$(HEALTH_PORT)/health"

# One-shot database tasks reuse the exact application image, not another build.
backend-migrate:
	$(COMPOSE) run --rm --no-deps --entrypoint /app/api/migrate app up
backend-seed:
	$(COMPOSE) run --rm --no-deps --entrypoint /app/api/seed app run
backend-test:
	bun run --cwd apps/api test
backend-audit:
	bun run --cwd apps/api audit:prod
backend-typecheck:
	bun run --cwd apps/api typecheck
backend-build:
	bun run --cwd apps/api build
clean:
	rm -rf .turbo apps/web/.svelte-kit apps/web/build apps/api/dist
