#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

REAL_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = REAL_ROOT / "rag" / "live_context.py"


def run(
    root: Path,
    *args: str,
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env["TESSA_REPO_ROOT"] = str(root)
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        env=env,
        text=True,
        capture_output=True,
        check=check,
    )


def write_json(path: Path, value: dict) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    path.write_text(raw, encoding="utf-8")
    return raw


def write_memory(path: Path, memory_id: str, owner: str = "tessa") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "---\n"
        "schema_version: 2\n"
        f'memory_id: "{memory_id}"\n'
        f"owner: {owner}\n"
        "kind: tessa_live_memory\n"
        'event_at: "2026-09-21"\n'
        'recorded_at: "2026-09-21T12:00:00Z"\n'
        "status: current\n"
        "source_refs: []\n"
        "media_refs: []\n"
        "confidence: verified\n"
        "append_only: true\n"
        "---\n\n"
        "# Test memory\n",
        encoding="utf-8",
    )


def test_micro(memory_ref: str, micro_id: str) -> dict:
    return {
        "schema_version": 2,
        "micro_id": micro_id,
        "owner": "tessa",
        "kind": "tessa_micro_checkpoint",
        "event_at": "2026-09-21T12:00:00Z",
        "recorded_at": "2026-09-21T12:00:00Z",
        "change_type": "decision",
        "summary": "memory ref resolver test",
        "changed": [],
        "thread_ids": [],
        "source_refs": ["conversation://current"],
        "memory_refs": [memory_ref],
        "media_refs": [],
        "importance": 3,
        "next_action": "",
        "preflight": False,
    }


def main() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "chat-checkpoints").mkdir(parents=True)
        checkpoint = root / "chat-checkpoints" / "test.md"
        checkpoint.write_text("# checkpoint\n", encoding="utf-8")

        first = run(
            root,
            "save-delta",
            "--summary", "Decisione importante",
            "--change-type", "decision",
            "--event-at", "2026-09-18",
            "--changed", "prima modifica",
            "--thread", "test-thread",
            "--source", "conversation://current",
            "--importance", "5",
            "--next", "prossimo passo",
        )
        if "Created rag/live/micro-checkpoints/" not in first.stdout:
            raise AssertionError(first.stdout)

        live_path = root / "rag" / "live" / "TESSA_LIVE_CONTEXT.json"
        live = json.loads(live_path.read_text(encoding="utf-8"))
        if live["micro_since_full_checkpoint"] != 1:
            raise AssertionError(live)
        if live["next_action"] != "prossimo passo":
            raise AssertionError(live)

        micros = sorted((root / "rag" / "live" / "micro-checkpoints").rglob("*.json"))
        first_record = json.loads(micros[0].read_text(encoding="utf-8"))
        if first_record["schema_version"] != 2:
            raise AssertionError("save-delta must emit schema_version=2")

        run(root, "mark-checkpoint", "chat-checkpoints/test.md")
        live = json.loads(live_path.read_text(encoding="utf-8"))
        if live["micro_since_full_checkpoint"] != 0:
            raise AssertionError(live)
        if live["last_full_checkpoint"] != "chat-checkpoints/test.md":
            raise AssertionError(live)

        second = run(
            root,
            "save-delta",
            "--summary", "Correzione successiva",
            "--change-type", "correction",
            "--changed", "seconda modifica",
            "--source", "conversation://current",
            "--resolve", "prossimo passo",
        )
        if "Created rag/live/micro-checkpoints/" not in second.stdout:
            raise AssertionError(second.stdout)

        legacy_path = (
            root / "rag" / "live" / "micro-checkpoints"
            / "2026" / "09" / "17" / "legacy-v1.json"
        )
        legacy_raw = write_json(
            legacy_path,
            {
                "schema_version": 1,
                "micro_id": "legacy-v1",
                "owner": "tessa",
                "kind": "tessa_micro_checkpoint",
                "event_at": "2026-09-17T10:00:00+02:00",
                "recorded_at": "2026-09-17T10:00:00+02:00",
                "change_type": "preflight",
                "summary": "Legacy incompleto ma valido",
                "thread_ids": ["legacy"],
                "source_refs": [
                    "artifact://legacy/source",
                    "attachment://legacy/attachment",
                ],
                "importance": 3,
                "preflight": True,
            },
        )

        verify = run(root, "verify")
        if "OK: live context verified" not in verify.stdout:
            raise AssertionError(verify.stdout)
        if legacy_path.read_text(encoding="utf-8") != legacy_raw:
            raise AssertionError("v1 validation must not rewrite the historical file")

        live = json.loads(live_path.read_text(encoding="utf-8"))
        if live["micro_since_full_checkpoint"] != 1:
            raise AssertionError(live)
        if "prossimo passo" in live["open_loops"]:
            raise AssertionError(live)

        micros = list((root / "rag" / "live" / "micro-checkpoints").rglob("*.json"))
        if len(micros) != 3:
            raise AssertionError(f"expected 3 micros, got {len(micros)}")

        bad_v2 = (
            root / "rag" / "live" / "micro-checkpoints"
            / "2026" / "09" / "19" / "bad-v2-missing-next.json"
        )
        write_json(
            bad_v2,
            {
                "schema_version": 2,
                "micro_id": "bad-v2-missing-next",
                "owner": "tessa",
                "kind": "tessa_micro_checkpoint",
                "event_at": "2026-09-19T10:00:00+02:00",
                "recorded_at": "2026-09-19T10:00:00+02:00",
                "change_type": "decision",
                "summary": "v2 deve restare strict",
                "changed": [],
                "thread_ids": [],
                "source_refs": ["conversation://current"],
                "memory_refs": [],
                "media_refs": [],
                "importance": 3,
                "preflight": False,
            },
        )
        failed = run(root, "verify", check=False)
        if failed.returncode == 0:
            raise AssertionError("v2 missing next_action unexpectedly passed")
        if "next_action" not in (failed.stdout + failed.stderr):
            raise AssertionError(failed.stdout + failed.stderr)
        bad_v2.unlink()

        bad_prefix = (
            root / "rag" / "live" / "micro-checkpoints"
            / "2026" / "09" / "19" / "bad-v2-legacy-prefix.json"
        )
        write_json(
            bad_prefix,
            {
                "schema_version": 2,
                "micro_id": "bad-v2-legacy-prefix",
                "owner": "tessa",
                "kind": "tessa_micro_checkpoint",
                "event_at": "2026-09-19T11:00:00+02:00",
                "recorded_at": "2026-09-19T11:00:00+02:00",
                "change_type": "decision",
                "summary": "prefisso legacy non ammesso in v2",
                "changed": [],
                "thread_ids": [],
                "source_refs": ["artifact://legacy/not-for-v2"],
                "memory_refs": [],
                "media_refs": [],
                "importance": 3,
                "next_action": "",
                "preflight": False,
            },
        )
        failed = run(root, "verify", check=False)
        if failed.returncode == 0:
            raise AssertionError("v2 legacy external prefix unexpectedly passed")
        if "source_refs missing ref" not in (failed.stdout + failed.stderr):
            raise AssertionError(failed.stdout + failed.stderr)
        bad_prefix.unlink()

        memory_path = (
            root / "rag" / "memories" / "tessa"
            / "2026" / "09" / "test-memory.md"
        )
        write_memory(memory_path, "tessa-test-memory")

        id_ref_micro = (
            root / "rag" / "live" / "micro-checkpoints"
            / "2026" / "09" / "21" / "memory-id-ref.json"
        )
        write_json(
            id_ref_micro,
            test_micro("tessa-test-memory", "memory-id-ref"),
        )

        path_ref_micro = (
            root / "rag" / "live" / "micro-checkpoints"
            / "2026" / "09" / "21" / "memory-path-ref.json"
        )
        write_json(
            path_ref_micro,
            test_micro(
                "rag/memories/tessa/2026/09/test-memory.md",
                "memory-path-ref",
            ),
        )
        verify = run(root, "verify")
        if "OK: live context verified" not in verify.stdout:
            raise AssertionError(verify.stdout)

        missing_id_micro = (
            root / "rag" / "live" / "micro-checkpoints"
            / "2026" / "09" / "21" / "missing-memory-id.json"
        )
        write_json(
            missing_id_micro,
            test_micro("tessa-missing-memory", "missing-memory-id"),
        )
        failed = run(root, "verify", check=False)
        if failed.returncode == 0:
            raise AssertionError("missing memory_id unexpectedly passed")
        if "memory_refs missing ref" not in (failed.stdout + failed.stderr):
            raise AssertionError(failed.stdout + failed.stderr)
        missing_id_micro.unlink()

        missing_path_micro = (
            root / "rag" / "live" / "micro-checkpoints"
            / "2026" / "09" / "21" / "missing-memory-path.json"
        )
        write_json(
            missing_path_micro,
            test_micro(
                "rag/memories/tessa/2026/09/missing.md",
                "missing-memory-path",
            ),
        )
        failed = run(root, "verify", check=False)
        if failed.returncode == 0:
            raise AssertionError("missing memory path unexpectedly passed")
        if "memory_refs missing ref" not in (failed.stdout + failed.stderr):
            raise AssertionError(failed.stdout + failed.stderr)
        missing_path_micro.unlink()

        duplicate_path = (
            root / "rag" / "memories" / "tessa"
            / "2026" / "09" / "duplicate-memory.md"
        )
        write_memory(duplicate_path, "tessa-test-memory")
        failed = run(root, "verify", check=False)
        if failed.returncode == 0:
            raise AssertionError("duplicate memory_id unexpectedly passed")
        if "duplicate memory_id" not in (failed.stdout + failed.stderr):
            raise AssertionError(failed.stdout + failed.stderr)
        duplicate_path.unlink()

        wrong_owner_path = (
            root / "rag" / "memories" / "tessa"
            / "2026" / "09" / "wrong-owner-memory.md"
        )
        write_memory(wrong_owner_path, "tessa-wrong-owner-memory", owner="gptina")
        failed = run(root, "verify", check=False)
        if failed.returncode == 0:
            raise AssertionError("wrong-owner memory_id unexpectedly passed")
        if "owner must be tessa" not in (failed.stdout + failed.stderr):
            raise AssertionError(failed.stdout + failed.stderr)
        wrong_owner_path.unlink()

        id_ref_micro.unlink()
        path_ref_micro.unlink()

        verify = run(root, "verify")
        if "OK: live context verified" not in verify.stdout:
            raise AssertionError(verify.stdout)

    print("OK: live-context v1-compat/v2-strict round-trip passed.")


if __name__ == "__main__":
    main()
