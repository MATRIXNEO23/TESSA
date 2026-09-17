"""Minimal read-only Correspondence Integrity Checker.

Pure standard-library implementation for the approved v0.1 contract.
It accepts Markdown strings and returns a Markdown diagnostic report.
It never writes files, commits changes, or mutates repository state.
"""

from __future__ import annotations

import re
from typing import Dict, List, Tuple


TURN_RE = re.compile(r"^## Turno\s+(\d+)\s+—\s+([^—\n]+?)(?:\s+—.*)?$", re.MULTILINE)


def _parse_front_matter(text: str) -> Tuple[Dict[str, object], bool]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, False

    try:
        end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")
    except StopIteration:
        return {}, False

    data: Dict[str, object] = {}
    current_list_key: str | None = None
    for raw in lines[1:end]:
        if raw.startswith("  - ") and current_list_key:
            value = raw[4:].strip()
            if value:
                cast = data.setdefault(current_list_key, [])
                if isinstance(cast, list):
                    cast.append(value)
            continue

        current_list_key = None
        if ":" not in raw:
            continue
        key, value = raw.split(":", 1)
        key = key.strip()
        value = value.strip()
        if not key:
            continue
        if value:
            data[key] = value
        else:
            data[key] = []
            current_list_key = key

    return data, True


def _turn_blocks(text: str) -> List[Tuple[int, str, str]]:
    matches = list(TURN_RE.finditer(text))
    blocks: List[Tuple[int, str, str]] = []
    for i, match in enumerate(matches):
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        blocks.append((int(match.group(1)), match.group(2).strip(), text[start:end]))
    return blocks


def _has_operational_sections(body: str) -> bool:
    headings = set(re.findall(r"^###\s+(.+?)\s*$", body, re.MULTILINE))
    has_read = any(h.lower().startswith("ho letto") for h in headings)
    has_decision = any(
        h.lower().startswith("ho deciso") or h.lower().startswith("ho fatto")
        for h in headings
    )
    has_commit = any(h.lower().startswith("commit") for h in headings)
    has_next = any(h.lower().startswith("per ") for h in headings)
    has_continuity = any(h.lower().startswith("continuit") for h in headings)
    return all((has_read, has_decision, has_commit, has_next, has_continuity))


def check_correspondence(
    canonical_text: str,
    mirror_text: str | None = None,
    expected_thread_id: str | None = None,
) -> str:
    """Return a deterministic Markdown integrity report for supplied text only."""

    checks: List[Tuple[str, str, str]] = []
    findings: List[Tuple[str, str, str]] = []
    fail = False
    warn = False
    stop_detected = False

    meta, front_ok = _parse_front_matter(canonical_text)
    if not front_ok:
        checks.append(("FAIL", "Front matter minimo", "Front matter assente o non parsabile"))
        findings.append(("FAIL", "front matter", "Impossibile leggere i metadati minimi"))
        fail = True
        meta = {}
    else:
        required = ("thread_id", "status", "participants", "max_turns", "mode", "canonical_copy")
        missing = [key for key in required if not meta.get(key)]
        if missing:
            checks.append(("FAIL", "Front matter minimo", f"Campi mancanti: {', '.join(missing)}"))
            findings.append(("FAIL", "front matter", f"Campi mancanti: {', '.join(missing)}"))
            fail = True
        else:
            checks.append(("PASS", "Front matter minimo", "Campi minimi presenti"))

    thread_id = str(meta.get("thread_id", ""))
    if expected_thread_id and thread_id and thread_id != expected_thread_id:
        checks.append(("FAIL", "Thread identity", "thread_id inatteso"))
        findings.append(("FAIL", "front matter.thread_id", "Identità del thread incoerente"))
        fail = True
    elif thread_id:
        checks.append(("PASS", "Thread identity", "thread_id coerente"))
    else:
        checks.append(("NOT_CHECKED", "Thread identity", "thread_id non disponibile"))

    status = str(meta.get("status", "")).lower()
    if "STOP_THREAD" in canonical_text or status == "stopped":
        checks.append(("FAIL", "Status", "Stop esplicito rilevato"))
        findings.append(("FAIL", "thread status", "Il thread richiede arresto"))
        fail = True
        stop_detected = True
    else:
        checks.append(("PASS", "Status", "Nessuno stop esplicito rilevato"))

    turns = _turn_blocks(canonical_text)
    numbers = [n for n, _, _ in turns]
    authors = [a for _, a, _ in turns]

    if numbers == list(range(1, len(numbers) + 1)):
        checks.append(("PASS", "Numerazione monotona", "Turni consecutivi"))
    else:
        checks.append(("FAIL", "Numerazione monotona", "Gap, duplicato o regressione rilevata"))
        findings.append(("FAIL", "turn headings", "Numerazione dei turni non consecutiva"))
        fail = True

    participants_obj = meta.get("participants", [])
    participants = set(participants_obj if isinstance(participants_obj, list) else [])
    unauthorized = [a for a in authors if a not in participants and a.lower() not in {"alberto", "operatore"}]
    if unauthorized:
        checks.append(("WARN", "Autori ammessi", f"Autori non dichiarati: {', '.join(sorted(set(unauthorized)))}"))
        findings.append(("WARN", "turn headings", "Autore non presente nei participants"))
        warn = True
    else:
        checks.append(("PASS", "Autori ammessi", "Autori coerenti con participants"))

    try:
        max_turns = int(str(meta.get("max_turns", "0")))
    except ValueError:
        max_turns = 0
        fail = True
        checks.append(("FAIL", "Max turns", "max_turns non numerico"))
    else:
        if max_turns and len(turns) > max_turns:
            checks.append(("FAIL", "Max turns", f"Rilevati {len(turns)} turni su massimo {max_turns}"))
            findings.append(("FAIL", "turn count", "max_turns superato"))
            fail = True
        else:
            checks.append(("PASS", "Max turns", "Limite non superato"))

    incomplete = [str(n) for n, _, body in turns if not _has_operational_sections(body)]
    if incomplete:
        checks.append(("WARN", "Campi operativi minimi", f"Sezioni mancanti nei turni: {', '.join(incomplete)}"))
        findings.append(("WARN", "turn blocks", "Uno o più turni sono operativamente incompleti"))
        warn = True
    else:
        checks.append(("PASS", "Campi operativi minimi", "Sezioni operative presenti"))

    mirror_declared = bool(meta.get("mirror_copy"))
    if not mirror_declared:
        checks.append(("NOT_CHECKED", "Mirror presence", "Mirror non dichiarato"))
        checks.append(("NOT_CHECKED", "Mirror coherence", "Mirror non dichiarato"))
    elif mirror_text is None:
        checks.append(("WARN", "Mirror presence", "Mirror dichiarato ma non fornito"))
        checks.append(("NOT_CHECKED", "Mirror coherence", "Mirror non disponibile"))
        findings.append(("WARN", "mirror", "Mirror dichiarato ma non verificabile"))
        warn = True
    else:
        checks.append(("PASS", "Mirror presence", "Mirror disponibile"))
        if mirror_text == canonical_text:
            checks.append(("PASS", "Mirror coherence", "Mirror coerente"))
        else:
            checks.append(("WARN", "Mirror coherence", "Mirror divergente dal canonico"))
            findings.append(("WARN", "mirror", "Contenuto mirror divergente"))
            warn = True

    destructive_markers = ("auto-ripar", "auto repair", "riscrivi automaticamente", "cancella automaticamente")
    if any(marker in canonical_text.lower() for marker in destructive_markers):
        checks.append(("WARN", "Marker distruttivi", "Istruzione automatica potenzialmente distruttiva rilevata"))
        findings.append(("WARN", "content", "Possibile richiesta incompatibile con il vincolo read-only"))
        warn = True
    else:
        checks.append(("PASS", "Marker distruttivi", "Nessun marker distruttivo inatteso"))

    result = "FAIL" if fail else "WARN" if warn else "PASS"
    can_continue = "no" if stop_detected else "human_review" if fail else "yes"
    last_author = authors[-1] if authors else "none"

    lines = [
        "# Correspondence Integrity Report",
        "",
        f"- thread_id: {thread_id or 'unknown'}",
        f"- result: {result}",
        "- checked_at: deterministic-input-check",
        f"- canonical: {meta.get('canonical_copy', 'unknown')}",
        f"- mirror: {meta.get('mirror_copy', 'not-declared')}",
        f"- turns: {len(turns)}",
        f"- last_author: {last_author}",
        "",
        "## Checks",
    ]
    lines.extend(f"- [{state}] {name} — {detail}" for state, name, detail in checks)
    lines.append("")
    lines.append("## Findings")
    if findings:
        for severity, location, detail in findings:
            lines.extend((f"- severity: {severity}", f"  location: {location}", f"  detail: {detail}"))
    else:
        lines.append("- none")
    lines.extend(
        (
            "",
            "## Continuity",
            f"- can_continue: {can_continue}",
            f"- note: {'Intervento umano richiesto' if fail else 'Thread strutturalmente utilizzabile'}",
        )
    )
    return "\n".join(lines) + "\n"
