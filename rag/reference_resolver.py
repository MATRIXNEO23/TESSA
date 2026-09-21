#!/usr/bin/env python3
"""Canonical Tessa reference resolution.

This module is read-only: it derives reference mappings directly from canonical
Git-tracked memory sources. Derived SQLite/JSONL indexes are never authoritative
for reference resolution.
"""

from __future__ import annotations

import re
from pathlib import Path


class MemoryReferenceError(ValueError):
    pass


def _front_matter(raw: str) -> str:
    if not raw.startswith("---\n"):
        return ""
    end = raw.find("\n---", 4)
    if end < 0:
        return ""
    return raw[4:end]


def _scalar(front_matter: str, key: str) -> str | None:
    match = re.search(
        rf"(?m)^{re.escape(key)}:\\s*(.*?)\\s*$",
        front_matter,
    )
    if not match:
        return None
    value = match.group(1).strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        value = value[1:-1]
    return value.strip() or None


def build_memory_id_index(root: Path, owner: str = "tessa") -> dict[str, Path]:
    """Build stable memory_id -> canonical path from source Markdown files."""
    root = root.resolve()
    memory_root = (root / "rag" / "memories" / owner).resolve()
    if not memory_root.is_dir():
        return {}

    index: dict[str, Path] = {}
    errors: list[str] = []
    for path in sorted(memory_root.rglob("*.md")):
        front = _front_matter(path.read_text(encoding="utf-8"))
        memory_id = _scalar(front, "memory_id")
        if not memory_id:
            # Historical pre-schema memories remain path-addressable.
            continue

        record_owner = _scalar(front, "owner")
        rp = path.resolve().relative_to(root).as_posix()
        if record_owner != owner:
            errors.append(
                f"{rp}: memory_id={memory_id} owner must be {owner}, "
                f"got {record_owner or '<missing>'}"
            )
            continue

        existing = index.get(memory_id)
        if existing is not None:
            errors.append(
                "duplicate memory_id "
                f"{memory_id}: "
                f"{existing.resolve().relative_to(root).as_posix()}, {rp}"
            )
            continue
        index[memory_id] = path.resolve()

    if errors:
        raise MemoryReferenceError("\n- ".join(errors))
    return index


def resolve_memory_ref(
    root: Path,
    ref: str,
    owner: str = "tessa",
    memory_index: dict[str, Path] | None = None,
) -> Path:
    """Resolve a canonical Tessa memory path or stable memory_id."""
    root = root.resolve()
    memory_root = (root / "rag" / "memories" / owner).resolve()

    candidate = (root / ref).resolve()
    if candidate.is_file():
        try:
            candidate.relative_to(memory_root)
        except ValueError as exc:
            raise MemoryReferenceError(
                f"memory path is outside rag/memories/{owner}: {ref}"
            ) from exc
        if candidate.suffix.casefold() != ".md":
            raise MemoryReferenceError(f"memory path must be Markdown: {ref}")
        return candidate

    index = memory_index if memory_index is not None else build_memory_id_index(root, owner)
    resolved = index.get(ref)
    if resolved is None:
        raise MemoryReferenceError(f"unknown memory ref: {ref}")
    return resolved


def validate_memory_id_index(root: Path, owner: str = "tessa") -> dict[str, Path]:
    """Validate stable-ID uniqueness/ownership and return the derived mapping."""
    return build_memory_id_index(root, owner)
