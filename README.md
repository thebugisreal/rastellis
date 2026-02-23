# Getting Started

## Prerequisites

- [Node.js (latest LTS version)](https://nodejs.org/en/)
- [pnpm](https://pnpm.io/)
- [Shopify CLI v2.17+](https://shopify.dev/themes/tools/cli)

## Directory Structure

```bash
└── project
    ├── config
    ├── frontend
    │   └── entrypoints
    │       └── # only Vite entry files here
    │   └── public
    │       └── # static assets
    ├── layout
    ├── locales
    ├── sections
    ├── snippets
    └── templates
        └── customers
```

Look at [vite-plugin-shopify](https://github.com/barrel/vite-plugin-shopify) to learn more.

## Setup

```bash
# Make sure to install the dependencies
pnpm install
```

## Development Server

```bash
# Authenticate with Shopify CLI
shopify login --store <store-name>
```

```bash
# Start the development server on http://localhost:9292 (Shopify CLI 3)
pnpm start

# Start the development server on http://localhost:9292 (Shopify CLI 2)
pnpm start2
```

## Production

```bash
# Build your CSS and JavaScript assets for production
pnpm build
```

```bash
# Push your local theme files to Shopify
pnpm push
```

```bash
# Push your local theme files to Shopify as a new theme
pnpm push:new
```

```bash
# Build and push your local theme files to Shopify
pnpm run deploy
```

```bash
# Or build and push your local theme files to Shopify as a new theme
pnpm deploy:new
```

Checkout the [Theme commands](https://shopify.dev/docs/themes/tools/cli/commands) for more information.
