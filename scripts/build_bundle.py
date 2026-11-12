#!/usr/bin/env python3
"""Deterministic CSS bundle builder for Irene Thomas Portfolio.

Parses @import "..." directives in css/main.css in order and concatenates
them into css/bundle.css with consistent LF line endings.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS_DIR = ROOT / "css"
MAIN_CSS = CSS_DIR / "main.css"
BUNDLE_CSS = CSS_DIR / "bundle.css"

IMPORT_RE = re.compile(r'^\s*@import\s+["\']([^"\']+)["\']\s*;\s*$')


def build_bundle() -> tuple[str, list[Path]]:
    if not MAIN_CSS.is_file():
        raise FileNotFoundError(f"Missing entry CSS: {MAIN_CSS}")

    parts: list[str] = []
    sources: list[Path] = []
    main_lines = MAIN_CSS.read_text(encoding="utf-8").splitlines()

    for line in main_lines:
        match = IMPORT_RE.match(line)
        if not match:
            continue
        rel_path = match.group(1)
        src_path = (CSS_DIR / rel_path).resolve()
        if not src_path.is_file():
            raise FileNotFoundError(f"Missing imported CSS file: {rel_path} ({src_path})")
        content = src_path.read_text(encoding="utf-8").replace("\r\n", "\n").rstrip()
        parts.append(f"/* === {rel_path} === */\n{content}\n")
        sources.append(src_path)

    bundle_text = "\n\n".join(parts).rstrip() + "\n"
    BUNDLE_CSS.write_text(bundle_text, encoding="utf-8", newline="\n")
    return bundle_text, sources


def main() -> int:
    bundle_text, sources = build_bundle()
    important_total = len(re.findall(r"!important", bundle_text))
    ag_path = CSS_DIR / "components" / "atelier-gram.css"
    ag_important = len(re.findall(r"!important", ag_path.read_text(encoding="utf-8"))) if ag_path.is_file() else 0
    print(
        f"Built {BUNDLE_CSS.relative_to(ROOT)} from {len(sources)} CSS files "
        f"({len(bundle_text.encode('utf-8')):,} bytes, "
        f"!important total={important_total}, atelier-gram={ag_important})."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
