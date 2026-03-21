.PHONY: install dev build test test-ui lint clean

# Install all npm dependencies
install:
	npm install

# Run the development server
dev:
	npm run dev

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
