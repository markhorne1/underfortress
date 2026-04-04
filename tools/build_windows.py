#!/usr/bin/env python3
"""Build Windows artifacts locally or dispatch the CI workflow when Wine is unavailable."""

from __future__ import annotations

import argparse
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path


def run(command: list[str], cwd: Path) -> int:
    print(f"[build-windows] cwd: {cwd}")
    print(f"[build-windows] cmd: {' '.join(command)}")
    completed = subprocess.run(command, cwd=cwd)
    return completed.returncode


def run_capture(command: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    print(f"[build-windows] cwd: {cwd}")
    print(f"[build-windows] cmd: {' '.join(command)}")
    return subprocess.run(command, cwd=cwd, capture_output=True, text=True, check=False)


def command_exists(command: str) -> bool:
    return shutil.which(command) is not None


def git_branch(cwd: Path) -> str:
    completed = subprocess.run(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"],
        cwd=cwd,
        capture_output=True,
        text=True,
        check=False,
    )
    branch = completed.stdout.strip()
    return branch or "main"


def should_use_ci(force_ci: bool) -> bool:
    if force_ci:
        return True
    return platform.system() == "Linux" and not command_exists("wine")


def dispatch_workflow(cwd: Path, workflow: str, ref: str) -> int:
    if not command_exists("gh"):
        print("[build-windows] error: gh CLI is required to dispatch the GitHub Actions fallback.", file=sys.stderr)
        print("[build-windows] install gh or run the workflow manually from the Actions tab.", file=sys.stderr)
        return 2

    print("[build-windows] Wine is unavailable; dispatching the Windows GitHub Actions workflow instead.")
    completed = run_capture(["gh", "workflow", "run", workflow, "--ref", ref], cwd)
    if completed.stdout:
        print(completed.stdout, end="")
    if completed.returncode != 0:
        if completed.stderr:
            print(completed.stderr, end="", file=sys.stderr)
        if "Resource not accessible by integration" in completed.stderr or "HTTP 403" in completed.stderr:
            print(
                "[build-windows] workflow dispatch was denied by GitHub permissions.",
                file=sys.stderr,
            )
            print(
                "[build-windows] use one of these paths instead:",
                file=sys.stderr,
            )
            print(
                "[build-windows] 1. Push to main; this workflow already runs on push.",
                file=sys.stderr,
            )
            print(
                "[build-windows] 2. Open GitHub Actions in the browser and run 'Build Windows EXE' manually.",
                file=sys.stderr,
            )
            print(
                "[build-windows] 3. Re-authenticate gh with a token that has repo/actions workflow permissions.",
                file=sys.stderr,
            )
            return 3
        return completed.returncode

    print("[build-windows] workflow dispatched successfully.")
    print("[build-windows] next: open GitHub Actions and download the underfortress-windows-exe artifact.")
    return 0


def build_locally(cwd: Path, publish_never: bool) -> int:
    code = run(["npm", "run", "build"], cwd)
    if code != 0:
        return code

    command = ["npx", "electron-builder", "--win", "nsis", "portable"]
    if publish_never:
        command.extend(["--publish", "never"])
    return run(command, cwd)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build Windows artifacts locally, or fall back to GitHub Actions on Linux without Wine."
    )
    parser.add_argument(
        "--cwd",
        default=os.getcwd(),
        help="Working directory for the build command (default: current directory).",
    )
    parser.add_argument(
        "--workflow",
        default=".github/workflows/windows-exe.yml",
        help="Workflow file to dispatch when CI fallback is used.",
    )
    parser.add_argument(
        "--ref",
        default=None,
        help="Git ref for the CI workflow dispatch (default: current branch).",
    )
    parser.add_argument(
        "--ci",
        action="store_true",
        help="Always use the GitHub Actions fallback instead of attempting a local build.",
    )
    parser.add_argument(
        "--allow-publish",
        action="store_true",
        help="Allow electron-builder to use its configured publish behavior.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    cwd = Path(args.cwd).resolve()
    if not cwd.is_dir():
        print(f"[build-windows] error: cwd not found: {cwd}", file=sys.stderr)
        return 2

    if should_use_ci(force_ci=args.ci):
        return dispatch_workflow(cwd, workflow=args.workflow, ref=args.ref or git_branch(cwd))

    return build_locally(cwd, publish_never=not args.allow_publish)


if __name__ == "__main__":
    raise SystemExit(main())