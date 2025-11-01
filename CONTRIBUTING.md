# Contributing to Sistema Nota Fiscal

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 22.x LTS (use `.nvmrc` for version management)
- pnpm (install with `npm install -g pnpm`)
- Git

### Local Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/sistema-nota-fiscal.git
   cd sistema-nota-fiscal
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local Supabase credentials
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Run tests**
   ```bash
   pnpm test        # Unit tests
   pnpm test:e2e    # End-to-end tests
   ```

## Development Workflow

### Branch Naming Convention

- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates
- `chore/description` - Maintenance tasks

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(nfe): add bulk import functionality

- Implemented CSV import for multiple NFes
- Added validation and error handling
- Updated UI with import progress indicator

Closes #123
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write clean, maintainable code
   - Follow existing code style
   - Add/update tests as needed
   - Update documentation

3. **Run quality checks**
   ```bash
   pnpm lint          # ESLint
   pnpm typecheck     # TypeScript
   pnpm test          # All tests
   pnpm format        # Prettier
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feat/your-feature-name
   ```
   - Go to GitHub and create a Pull Request
   - Fill out the PR template
   - Link any related issues

6. **Address review feedback**
   - Make requested changes
   - Push additional commits
   - Re-request review when ready

### Code Style Guidelines

- **TypeScript**: Use strict mode, prefer interfaces over types for object shapes
- **React**: Functional components with hooks, avoid class components
- **Naming**: 
  - Components: PascalCase (`NFeForm.tsx`)
  - Files: camelCase for utilities, PascalCase for components
  - Variables/Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
- **Imports**: Group by external, internal, types; use absolute paths with `@/`
- **Comments**: JSDoc for public functions, inline comments for complex logic

### Testing Guidelines

- **Unit tests**: Test individual functions and components
- **Integration tests**: Test feature workflows
- **E2E tests**: Test critical user journeys
- **Coverage**: Aim for ≥80% on core business logic

```typescript
// Good test example
describe("NFeForm", () => {
  it("validates required fields before submission", () => {
    // Arrange
    render(<NFeForm />);
    
    // Act
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    
    // Assert
    expect(screen.getByText(/campo obrigatório/i)).toBeInTheDocument();
  });
});
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── integrations/    # Third-party integrations (Supabase)
├── lib/             # Utilities and helpers
├── pages/           # Page components (routes)
└── main.tsx         # Application entry point
```

## Release Process

Releases are automated using semantic-release:

1. Merge PRs to `main` branch
2. CI runs tests and builds
3. semantic-release analyzes commits
4. Version bump, changelog, and GitHub release created automatically
5. DigitalOcean auto-deploys from `main`

## Getting Help

- **Documentation**: Check the [README](README.md)
- **Issues**: Search existing [issues](https://github.com/your-org/sistema-nota-fiscal/issues)
- **Discussions**: Start a [discussion](https://github.com/your-org/sistema-nota-fiscal/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
