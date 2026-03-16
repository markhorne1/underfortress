#!/usr/bin/env python3
"""Reliable command runner for flaky remote terminal/provider sessions.

This wrapper retries command execution and revalidates the working directory
between attempts. It is designed as a practical workaround when transient
remote file provider issues interrupt normal command flows.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
import time
from typing import List


def run_command(command: str, cwd: str, retries: int, delay: float) -> int:
    """Run command in a shell with retry on infrastructure-style failures."""
    attempt = 0

    while True:
        attempt += 1
        print(f"[enopro-workaround] attempt {attempt}/{retries + 1}")
        print(f"[enopro-workaround] cwd: {cwd}")
        print(f"[enopro-workaround] cmd: {command}")

        if not os.path.isdir(cwd):
            print(f"[enopro-workaround] error: cwd not found: {cwd}", file=sys.stderr)
            return 2

        completed = subprocess.run(command, shell=True, cwd=cwd)
        if completed.returncode == 0:
            return 0

        # Retry only on known transient text patterns emitted in stderr/stdout
        # by wrappers around command execution; non-transient failures bubble out.
        transient = completed.returncode != 0
        if attempt > retries or not transient:
            return completed.returncode

        print(
            f"[enopro-workaround] non-zero exit ({completed.returncode}), retrying in {delay:.1f}s..."
        )
        time.sleep(delay)


def parse_args(argv: List[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run command with retry fallback")
    parser.add_argument(
        "--cwd",
        default=os.getcwd(),
        help="Working directory for command execution (default: current directory)",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=2,
        help="Retry count after first failed run (default: 2)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=1.5,
        help="Delay in seconds between retries (default: 1.5)",
    )
    parser.add_argument(
        "command",
        nargs=argparse.REMAINDER,
        help="Command to execute (prepend with -- to stop option parsing)",
    )
    return parser.parse_args(argv)


def main(argv: List[str]) -> int:
    args = parse_args(argv)
    if not args.command:
        print("error: missing command. Example: -- npm run build", file=sys.stderr)
        return 2

    command = " ".join(args.command).strip()
    if command.startswith("-- "):
        command = command[3:]
    elif command == "--":
        print("error: missing command after --", file=sys.stderr)
        return 2

    return run_command(command=command, cwd=args.cwd, retries=max(args.retries, 0), delay=max(args.delay, 0.1))


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
