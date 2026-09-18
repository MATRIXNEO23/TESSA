package io.github.matrixneo23.mdrelaycompanion;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final String TESSA_URL = "tessa_chat_url";
    private static final String GPTINA_URL = "gptina_chat_url";

    private static final String ENTRYPOINT_URL =
            "https://raw.githubusercontent.com/MATRIXNEO23/TESSA/main/agent-exchanges/TASK_ENTRYPOINT.md";
    private static final String RAW_BASE =
            "https://raw.githubusercontent.com/MATRIXNEO23/TESSA/main/";

    private TextView relayStatus;
    private TextView detailStatus;
    private EditText tessaUrl;
    private EditText gptinaUrl;
    private Button actionButton;

    private RelayLogic.Next currentNext = RelayLogic.Next.MISSING;
    private boolean refreshing = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(buildUi());
        refreshRelay();
    }

    private View buildUi() {
        int pad = dp(14);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(pad, pad, pad, pad);
        root.setBackgroundColor(Color.rgb(18, 18, 22));

        TextView title = text("Tessa + GPTina Companion", 22, Color.WHITE);
        root.addView(title);

        TextView subtitle = text(
                "Markdown/GitHub decide a chi tocca. L'app copia solo \"fatto\" e apre la chat; incolla + invio restano manuali.",
                14, Color.LTGRAY);
        subtitle.setPadding(0, dp(6), 0, dp(14));
        root.addView(subtitle);

        relayStatus = text("Controllo il turno…", 24, Color.WHITE);
        relayStatus.setGravity(Gravity.CENTER);
        relayStatus.setPadding(pad, dp(18), pad, dp(18));
        relayStatus.setBackgroundColor(Color.rgb(38, 38, 46));
        root.addView(relayStatus, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));

        detailStatus = text("", 13, Color.LTGRAY);
        detailStatus.setPadding(0, dp(8), 0, dp(8));
        root.addView(detailStatus);

        Button refresh = button("Aggiorna turno");
        refresh.setOnClickListener(v -> refreshRelay());
        root.addView(refresh);

        TextView tessaLabel = text("URL chat Tessa", 14, Color.WHITE);
        tessaLabel.setPadding(0, dp(18), 0, 0);
        root.addView(tessaLabel);

        tessaUrl = urlField(getPreferences(0).getString(TESSA_URL, ""));
        root.addView(tessaUrl);

        TextView gptinaLabel = text("URL chat GPTina", 14, Color.WHITE);
        gptinaLabel.setPadding(0, dp(12), 0, 0);
        root.addView(gptinaLabel);

        gptinaUrl = urlField(getPreferences(0).getString(GPTINA_URL, ""));
        root.addView(gptinaUrl);

        Button save = button("Salva URL");
        save.setOnClickListener(v -> saveUrls());
        root.addView(save);

        actionButton = button("Nessun relay disponibile");
        actionButton.setEnabled(false);
        actionButton.setPadding(pad, dp(14), pad, dp(14));
        actionButton.setOnClickListener(v -> copyAndOpenCurrent());
        root.addView(actionButton);

        TextView guard = text(
                "Guard: nessun token OpenAI, nessuna WebView, nessun JavaScript su ChatGPT, nessun tap/tasto simulato, nessuna lettura delle risposte.",
                12, Color.GRAY);
        guard.setPadding(0, dp(18), 0, 0);
        root.addView(guard);

        return root;
    }

    private void refreshRelay() {
        if (refreshing) return;
        refreshing = true;
        currentNext = RelayLogic.Next.MISSING;
        renderState("Aggiornamento…", "Leggo il puntatore canonico.", false);

        new Thread(() -> {
            try {
                String entrypoint = getText(ENTRYPOINT_URL);
                String path = RelayLogic.parseCurrentThreadPath(entrypoint);
                if (path == null) {
                    throw new Exception("Thread canonico non trovato nel task entrypoint.");
                }

                String transcript = getText(RAW_BASE + path);
                RelayLogic.Next next = RelayLogic.parseLastRelayMarker(transcript);

                runOnUiThread(() -> {
                    refreshing = false;
                    currentNext = next;
                    switch (next) {
                        case TESSA:
                            renderState("Tocca a Tessa", path, canOpenFor(next));
                            actionButton.setText("Copia \"fatto\" + Apri Tessa");
                            break;
                        case GPTINA:
                            renderState("Tocca a GPTina", path, canOpenFor(next));
                            actionButton.setText("Copia \"fatto\" + Apri GPTina");
                            break;
                        case NONE:
                            renderState("Nessun relay", "Ultimo marker: relay_next: none", false);
                            actionButton.setText("Nessun relay disponibile");
                            break;
                        case MISSING:
                        default:
                            renderState("Marker mancante", "Non suggerisco alcun invio.", false);
                            actionButton.setText("Nessun relay disponibile");
                            break;
                    }
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    refreshing = false;
                    currentNext = RelayLogic.Next.MISSING;
                    renderState("Errore", e.getMessage(), false);
                    actionButton.setText("Nessun relay disponibile");
                });
            }
        }).start();
    }

    private boolean canOpenFor(RelayLogic.Next next) {
        if (next == RelayLogic.Next.TESSA) {
            return RelayLogic.isAllowedChatUrl(tessaUrl.getText().toString());
        }
        if (next == RelayLogic.Next.GPTINA) {
            return RelayLogic.isAllowedChatUrl(gptinaUrl.getText().toString());
        }
        return false;
    }

    private void copyAndOpenCurrent() {
        String target;
        String label;

        if (currentNext == RelayLogic.Next.TESSA) {
            target = tessaUrl.getText().toString().trim();
            label = "Tessa";
        } else if (currentNext == RelayLogic.Next.GPTINA) {
            target = gptinaUrl.getText().toString().trim();
            label = "GPTina";
        } else {
            toast("Nessun relay attivo.");
            return;
        }

        if (!RelayLogic.isAllowedChatUrl(target)) {
            toast("Configura prima un URL chatgpt.com valido per " + label + ".");
            return;
        }

        saveUrls();

        ClipboardManager clipboard =
                (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        clipboard.setPrimaryClip(ClipData.newPlainText("relay", "fatto"));

        Intent open = new Intent(Intent.ACTION_VIEW, Uri.parse(target));
        try {
            startActivity(open);
            toast("\"fatto\" copiato. Incolla e invia manualmente a " + label + ".");
        } catch (Exception e) {
            toast("Nessuna app disponibile per aprire la chat.");
        }
    }

    private void saveUrls() {
        String tessa = tessaUrl.getText().toString().trim();
        String gptina = gptinaUrl.getText().toString().trim();

        if (!tessa.isEmpty() && !RelayLogic.isAllowedChatUrl(tessa)) {
            toast("URL Tessa non valido.");
            return;
        }
        if (!gptina.isEmpty() && !RelayLogic.isAllowedChatUrl(gptina)) {
            toast("URL GPTina non valido.");
            return;
        }

        getPreferences(0).edit()
                .putString(TESSA_URL, tessa)
                .putString(GPTINA_URL, gptina)
                .apply();

        actionButton.setEnabled(canOpenFor(currentNext));
        toast("URL salvati.");
    }

    private void renderState(String headline, String detail, boolean enabled) {
        relayStatus.setText(headline);
        detailStatus.setText(detail == null ? "" : detail);
        actionButton.setEnabled(enabled);
    }

    private String getText(String url) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setConnectTimeout(8000);
        connection.setReadTimeout(8000);
        connection.setRequestProperty("Accept", "text/plain");
        connection.setRequestProperty("User-Agent", "Tessa-GPTina-MD-Companion");

        int code = connection.getResponseCode();
        if (code != 200) throw new Exception("GitHub HTTP " + code);

        try (InputStream in = connection.getInputStream();
             BufferedReader reader = new BufferedReader(
                     new InputStreamReader(in, StandardCharsets.UTF_8))) {
            StringBuilder out = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                out.append(line).append('\n');
            }
            return out.toString();
        } finally {
            connection.disconnect();
        }
    }

    private TextView text(String value, int sp, int color) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(sp);
        view.setTextColor(color);
        return view;
    }

    private EditText urlField(String initial) {
        EditText field = new EditText(this);
        field.setSingleLine(true);
        field.setText(initial);
        field.setHint("https://chatgpt.com/…");
        field.setTextColor(Color.WHITE);
        field.setHintTextColor(Color.GRAY);
        return field;
    }

    private Button button(String value) {
        Button button = new Button(this);
        button.setText(value);
        button.setAllCaps(false);
        return button;
    }

    private void toast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
