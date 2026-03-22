.PHONY: install dev build test test-ui lint clean podman-build podman-run

# Install all npm dependencies
install:
	npm install

# Run the development server (Frontend and Backend concurrently)
dev:
	npx concurrently "npm run dev:client" "npm run dev:server"

# Build the project for production
build:
	npm run build

# Run all unit and integration tests
test:
	npx vitest run

# Run tests in UI mode (opens browser)
test-ui:
	npx vitest --ui

# Run linter
lint:
	npm run lint

# Clean build artifacts and node_modules
clean:
	rm -rf dist
	rm -rf node_modules
	rm -rf data

# --- Podman Commands ---

# Build the container image
podman-build:
	podman build -t dreamtracker .

# Run the container (maps port 3000 and mounts the database to ./data locally)
podman-run:
	mkdir -p data
	podman run -d -p 3000:3000 -v $(PWD)/data:/app/data:Z --name dreamtracker_app dreamtracker
