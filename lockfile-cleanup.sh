git apply lockfile-cleanup.patch
git add -A
git commit -m "chore: keep pnpm; remove bun.lockb and package-lock.json; update .gitignore and package.json"
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: refresh pnpm-lock.yaml" || true
git push