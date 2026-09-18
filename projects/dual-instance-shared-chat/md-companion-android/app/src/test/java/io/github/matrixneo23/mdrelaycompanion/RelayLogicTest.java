package io.github.matrixneo23.mdrelaycompanion;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import org.junit.Test;

public class RelayLogicTest {
    @Test
    public void lastRelayMarkerWins() {
        String md = "<!-- relay_next: gptina -->\nqualcosa\n<!-- relay_next: tessa -->\n";
        assertEquals(RelayLogic.Next.TESSA, RelayLogic.parseLastRelayMarker(md));
    }

    @Test
    public void noneMarkerIsExplicitStop() {
        assertEquals(RelayLogic.Next.NONE, RelayLogic.parseLastRelayMarker("<!-- relay_next: none -->"));
    }

    @Test
    public void missingMarkerFailsClosed() {
        assertEquals(RelayLogic.Next.MISSING, RelayLogic.parseLastRelayMarker("nessun marker"));
        assertEquals(RelayLogic.Next.MISSING, RelayLogic.parseLastRelayMarker(null));
    }

    @Test
    public void currentThreadPathComesFromCanonicalEntrypoint() {
        String entrypoint = "Primary canonical thread:\n`MATRIXNEO23/TESSA/agent-exchanges/correspondence/2026-09-18-continuity-003.md`\n";
        assertEquals(
                "agent-exchanges/correspondence/2026-09-18-continuity-003.md",
                RelayLogic.parseCurrentThreadPath(entrypoint));
    }

    @Test
    public void missingCurrentThreadPathFailsClosed() {
        assertNull(RelayLogic.parseCurrentThreadPath("no canonical path here"));
    }

    @Test
    public void onlyChatGptHttpsUrlsAreAllowed() {
        assertTrue(RelayLogic.isAllowedChatUrl("https://chatgpt.com/c/abc"));
        assertTrue(RelayLogic.isAllowedChatUrl("https://chatgpt.com/g/g-123/project"));
        assertFalse(RelayLogic.isAllowedChatUrl("http://chatgpt.com/c/abc"));
        assertFalse(RelayLogic.isAllowedChatUrl("https://example.com/chat"));
        assertFalse(RelayLogic.isAllowedChatUrl(""));
        assertFalse(RelayLogic.isAllowedChatUrl(null));
    }
}
