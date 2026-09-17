"""Test-first contract for the read-only Correspondence Integrity Checker.

These tests use only synthetic in-memory Markdown. They never read or modify the
real correspondence, project board, mirror, or personal memories.

The implementation is intentionally absent in this phase. Until
`agent-exchanges/tools/correspondence_integrity_checker.py` exists with the
minimal public function described by `load_checker()`, the suite is expected to
be red.
"""

from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CHECKER_PATH = ROOT / "tools" / "correspondence_integrity_checker.py"


def load_checker():
    """Load the future checker without changing sys.path or touching the repo."""
    if not CHECKER_PATH.exists():
        raise AssertionError(
            "Checker implementation intentionally absent in test-first phase: "
            f"{CHECKER_PATH}"
        )

    spec = importlib.util.spec_from_file_location(
        "correspondence_integrity_checker", CHECKER_PATH
    )
    if spec is None or spec.loader is None:
        raise AssertionError("Unable to load checker module")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    if not hasattr(module, "check_correspondence"):
        raise AssertionError(
            "Expected public function check_correspondence(canonical_text, "
            "mirror_text=None, expected_thread_id=None)"
        )
    return module


def front_matter(*, max_turns: int = 20, mirror: bool = False) -> str:
    mirror_line = "mirror_copy: MATRIXNEO23/scodinzolina-conntinuity\n" if mirror else ""
    return (
        "---\n"
        "type: agent_correspondence\n"
        "thread_id: synthetic-thread\n"
        "status: running\n"
        "participants:\n"
        "  - Tessa\n"
        "  - GPTina\n"
        f"max_turns: {max_turns}\n"
        "mode: append_only_markdown\n"
        "canonical_copy: MATRIXNEO23/TESSA\n"
        f"{mirror_line}"
        "---\n\n"
    )


def turn(n: int, author: str = "Tessa", *, omit: str | None = None) -> str:
    sections = {
        "read": "### Ho letto\n\nContesto sintetico.\n\n",
        "decide": "### Ho deciso\n\nDecisione sintetica.\n\n",
        "done": "### Ho fatto\n\nNessuna modifica reale.\n\n",
        "commit": "### Commit\n\n- Nessun commit.\n\n",
        "next": "### Per GPTina\n\nProssima istruzione sintetica.\n\n",
        "continuity": "### Continuità\n\nStato sintetico.\n\n",
    }
    body = "".join(v for k, v in sections.items() if k != omit)
    return f"## Turno {n} — {author} — 2026-09-17\n\n{body}---\n\n"


def run_check(canonical: str, mirror: str | None = None, expected_thread_id: str = "synthetic-thread") -> str:
    checker = load_checker()
    report = checker.check_correspondence(
        canonical_text=canonical,
        mirror_text=mirror,
        expected_thread_id=expected_thread_id,
    )
    if not isinstance(report, str):
        raise AssertionError("check_correspondence must return a Markdown string")
    return report


class CorrespondenceIntegrityCheckerTests(unittest.TestCase):
    def test_valid_thread_passes(self):
        canonical = front_matter() + turn(1, "Tessa") + turn(2, "GPTina")
        report = run_check(canonical)
        self.assertIn("result: PASS", report)
        self.assertIn("turns: 2", report)
        self.assertIn("last_author: GPTina", report)

    def test_numbering_gap_fails(self):
        canonical = front_matter() + turn(1, "Tessa") + turn(3, "GPTina")
        report = run_check(canonical)
        self.assertIn("result: FAIL", report)
        self.assertIn("Numerazione", report)

    def test_duplicate_turn_number_fails(self):
        canonical = front_matter() + turn(1, "Tessa") + turn(1, "GPTina")
        report = run_check(canonical)
        self.assertIn("result: FAIL", report)
        self.assertIn("Numerazione", report)

    def test_max_turns_reached_or_exceeded_fails(self):
        canonical = front_matter(max_turns=1) + turn(1, "Tessa") + turn(2, "GPTina")
        report = run_check(canonical)
        self.assertIn("result: FAIL", report)
        self.assertIn("Max turns", report)

    def test_stop_thread_requires_human_review(self):
        canonical = front_matter() + "STOP_THREAD\n\n" + turn(1, "Tessa")
        report = run_check(canonical)
        self.assertIn("result: FAIL", report)
        self.assertIn("can_continue: no", report)

    def test_missing_operational_section_warns(self):
        canonical = front_matter() + turn(1, "Tessa", omit="commit")
        report = run_check(canonical)
        self.assertIn("result: WARN", report)
        self.assertIn("Campi operativi", report)

    def test_declared_mirror_divergence_warns(self):
        canonical = front_matter(mirror=True) + turn(1, "Tessa")
        mirror = front_matter(mirror=True) + turn(1, "Tessa") + turn(2, "GPTina")
        report = run_check(canonical, mirror=mirror)
        self.assertIn("result: WARN", report)
        self.assertIn("Mirror coherence", report)

    def test_undeclared_mirror_is_not_checked(self):
        canonical = front_matter(mirror=False) + turn(1, "Tessa")
        report = run_check(canonical, mirror=None)
        self.assertIn("result: PASS", report)
        self.assertIn("NOT_CHECKED", report)
        self.assertIn("Mirror", report)

    def test_unparseable_canonical_fails(self):
        canonical = "# no front matter and no valid thread metadata\n"
        report = run_check(canonical)
        self.assertIn("result: FAIL", report)
        self.assertIn("Front matter", report)


if __name__ == "__main__":
    unittest.main()
