package io.github.matrixneo23.mdrelaycompanion;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class RelayLogic {
    public enum Next { TESSA, GPTINA, NONE, MISSING }

    private static final Pattern MARKER = Pattern.compile(
            "<!--\\s*relay_next:\\s*(tessa|gptina|none)\\s*-->",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern CURRENT_THREAD = Pattern.compile(
            "`?MATRIXNEO23/TESSA/(agent-exchanges/correspondence/[A-Za-z0-9._/-]+\\.md)`?");

    private RelayLogic() {}

    public static Next parseLastRelayMarker(String markdown) {
        if (markdown == null || markdown.isEmpty()) return Next.MISSING;
        Matcher matcher = MARKER.matcher(markdown);
        String last = null;
        while (matcher.find()) last = matcher.group(1);
        if (last == null) return Next.MISSING;
        switch (last.toLowerCase(Locale.ROOT)) {
            case "tessa": return Next.TESSA;
            case "gptina": return Next.GPTINA;
            case "none": return Next.NONE;
            default: return Next.MISSING;
        }
    }

    public static String parseCurrentThreadPath(String entrypoint) {
        if (entrypoint == null || entrypoint.isEmpty()) return null;
        Matcher matcher = CURRENT_THREAD.matcher(entrypoint);
        String last = null;
        while (matcher.find()) last = matcher.group(1);
        return last;
    }

    public static boolean isAllowedChatUrl(String raw) {
        if (raw == null) return false;
        String value = raw.trim().toLowerCase(Locale.ROOT);
        if (!value.startsWith("https://chatgpt.com/")) return false;
        return !value.contains(" ") && !value.contains("\n") && !value.contains("\r");
    }

    public static boolean isAllowedBrowserUrl(String raw) {
        if (raw == null) return false;
        String value = raw.trim().toLowerCase(Locale.ROOT);
        if (!value.startsWith("https://")) return false;
        return value.length() > "https://".length()
                && !value.contains(" ")
                && !value.contains("\n")
                && !value.contains("\r");
    }

    public static String normalizeBrowserUrl(String raw) {
        if (raw == null) return "";
        String value = raw.trim();
        if (value.isEmpty()) return "";
        if (!value.contains("://")) value = "https://" + value;
        return value;
    }
}
