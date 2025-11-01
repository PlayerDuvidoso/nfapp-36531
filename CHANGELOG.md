# 1.0.0 (2025-11-01)

### Features

- Implement multi-shop functionality ([b926b47](https://github.com/PlayerDuvidoso/nfapp-36531/commit/b926b4722086924ab25d5b27395da42c7739385a))
- Prepare for production deployment ([47cc7a6](https://github.com/PlayerDuvidoso/nfapp-36531/commit/47cc7a6bcfa0de1e5aac838c9a7d29a5dc53fc3d))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Production-ready infrastructure and tooling
- Environment variable validation with Zod
- Health check endpoint at `/health`
- Comprehensive CI/CD with GitHub Actions
- Automated dependency updates with Renovate
- Testing infrastructure (Vitest + Playwright)
- Code quality tools (ESLint, Prettier, TypeScript strict mode)
- Contributing guidelines and Code of Conduct
- MIT License
- Deployment documentation for DigitalOcean App Platform

### Changed

- Updated README with production deployment instructions
- Enhanced build configuration for production optimization

### Security

- Added security audit in CI pipeline
- Implemented environment variable validation
- Documented secure deployment practices
