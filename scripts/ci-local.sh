#!/usr/bin/env bash
# Local CI: install, lint, test, build and a Docker smoke test.
# Usage: bash scripts/ci-local.sh   (CI_SKIP_DOCKER=1 skips the Docker job)
set -euo pipefail

cd "$(dirname "$0")/.."

results=()
failed=0

run_job() {
  local name=$1
  shift
  echo
  echo "==> ${name}: $*"
  if "$@"; then
    results+=("PASS  ${name}")
  else
    results+=("FAIL  ${name}")
    failed=1
  fi
}

# Builds the Docker image, serves it and checks that deep links fall back to index.html.
docker_smoke() {
  local image=sharing-vision-frontend-ci
  local port=${CI_DOCKER_PORT:-3999}
  local container
  docker build -t "$image" . || return 1
  container=$(docker run -d -p "${port}:80" "$image") || return 1

  local ok=0
  sleep 2
  for path in / /preview /edit/3; do
    if curl -fsS "http://localhost:${port}${path}" | grep -q '<div id="root">'; then
      echo "    ${path} -> index.html"
    else
      echo "    ${path} did not return index.html"
      ok=1
    fi
  done

  docker rm -f "$container" > /dev/null
  return "$ok"
}

run_job install npm ci
if [ "$failed" -eq 0 ]; then
  run_job lint npm run lint
  run_job test npm test
  run_job build npm run build
else
  results+=("SKIP  lint, test, build (install failed)")
fi

if [ "${CI_SKIP_DOCKER:-0}" = "1" ]; then
  results+=("SKIP  docker (CI_SKIP_DOCKER=1)")
elif docker info > /dev/null 2>&1; then
  run_job docker docker_smoke
else
  results+=("SKIP  docker (Docker is not running)")
fi

echo
echo "===== CI summary ====="
printf '%s\n' "${results[@]}"

if [ "$failed" -ne 0 ]; then
  echo "CI FAILED"
  exit 1
fi
echo "CI PASSED"
