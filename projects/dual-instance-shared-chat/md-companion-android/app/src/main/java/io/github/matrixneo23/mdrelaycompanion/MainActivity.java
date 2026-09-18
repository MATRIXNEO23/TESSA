package io.github.matrixneo23.mdrelaycompanion;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
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
    private static final String DEFAULT_CHAT_URL = "https://chatgpt.com/";

    private static final String ENTRYPOINT_URL =
            "https://raw.githubusercontent.com/MATRIXNEO23/TESSA/main/agent-exchanges/TASK_ENTRYPOINT.md";
    private static final String RAW_BASE =
            "https://raw.githubusercontent.com/MATRIXNEO23/TESSA/main/";

    private TextView relayStatus;
    private TextView detailStatus;
    private EditText tessaUrl;
    private EditText gptinaUrl;
    private Button copyButton;
    private WebView tessaView;
    private WebView gptinaView;

    private RelayLogic.Next currentNext = RelayLogic.Next.MISSING;
    private boolean refreshing = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(buildUi());
        refreshRelay();
    }

    private View buildUi() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(18, 18, 22));

        LinearLayout top = new LinearLayout(this);
        top.setOrientation(LinearLayout.HORIZONTAL);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(dp(8), dp(6), dp(8), dp(6));

        relayStatus = text("Controllo turno…", 17, Color.WHITE);
        detailStatus = text("", 11, Color.LTGRAY);

        LinearLayout statusBox = new LinearLayout(this);
        statusBox.setOrientation(LinearLayout.VERTICAL);
        statusBox.addView(relayStatus);
        statusBox.addView(detailStatus);

        Button refresh = button("Aggiorna");
        refresh.setOnClickListener(v -> refreshRelay());

        copyButton = button("Copia fatto");
        copyButton.setEnabled(false);
        copyButton.setOnClickListener(v -> copyTrigger());

        top.addView(statusBox, new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        top.addView(refresh);
        top.addView(copyButton);
        root.addView(top);

        LinearLayout panes = new LinearLayout(this);
        panes.setOrientation(LinearLayout.VERTICAL);

        tessaView = makeWebView(TESSA_URL, true);
        gptinaView = makeWebView(GPTINA_URL, false);

        View tessaPane = makePane("Tessa", tessaView, true);
        View gptinaPane = makePane("GPTina", gptinaView, false);

        panes.addView(tessaPane, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        panes.addView(gptinaPane, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));

        root.addView(panes, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        return root;
    }

    private View makePane(String label, WebView webView, boolean tessa) {
        LinearLayout pane = new LinearLayout(this);
        pane.setOrientation(LinearLayout.VERTICAL);
        pane.setPadding(dp(4), dp(2), dp(4), dp(4));

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);

        TextView title = text(label, 15, Color.WHITE);
        title.setPadding(dp(4), 0, dp(6), 0);

        String pref = tessa ? TESSA_URL : GPTINA_URL;
        EditText url = urlField(getPreferences(0).getString(pref, DEFAULT_CHAT_URL));
        Button go = button("Vai");

        go.setOnClickListener(v -> {
            String value = url.getText().toString().trim();
            if (!RelayLogic.isAllowedChatUrl(value)) {
                toast("URL " + label + " non valido.");
                return;
            }
            getPreferences(0).edit().putString(pref, value).apply();
            webView.loadUrl(value);
        });

        bar.addView(title);
        bar.addView(url, new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        bar.addView(go);

        pane.addView(bar);
        pane.addView(webView, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));

        if (tessa) tessaUrl = url; else gptinaUrl = url;
        return pane;
    }

    private WebView makeWebView(String prefKey, boolean tessa) {
        WebView view = new WebView(this);
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(view, true);

        view.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView v, String url) {
                super.onPageFinished(v, url);
                if (RelayLogic.isAllowedChatUrl(url)) {
                    getPreferences(0).edit().putString(prefKey, url).apply();
                    if (tessa && tessaUrl != null) tessaUrl.setText(url);
                    if (!tessa && gptinaUrl != null) gptinaUrl.setText(url);
                }
            }
        });

        String initial = getPreferences(0).getString(prefKey, DEFAULT_CHAT_URL);
        if (!RelayLogic.isAllowedChatUrl(initial)) initial = DEFAULT_CHAT_URL;
        view.loadUrl(initial);
        return view;
    }

    private void refreshRelay() {
        if (refreshing) return;
        refreshing = true;
        currentNext = RelayLogic.Next.MISSING;
        renderState("Aggiornamento…", "Leggo il transcript canonico.", false);

        new Thread(() -> {
            try {
                String entrypoint = getText(ENTRYPOINT_URL);
                String path = RelayLogic.parseCurrentThreadPath(entrypoint);
                if (path == null) throw new Exception("Thread canonico non trovato.");

                String transcript = getText(RAW_BASE + path);
                RelayLogic.Next next = RelayLogic.parseLastRelayMarker(transcript);

                runOnUiThread(() -> {
                    refreshing = false;
                    currentNext = next;
                    switch (next) {
                        case TESSA:
                            renderState("Tocca a Tessa", "pane sopra", true);
                            break;
                        case GPTINA:
                            renderState("Tocca a GPTina", "pane sotto", true);
                            break;
                        case NONE:
                            renderState("Nessun relay", "relay_next: none", false);
                            break;
                        case MISSING:
                        default:
                            renderState("Marker mancante", "Nessun relay suggerito.", false);
                            break;
                    }
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    refreshing = false;
                    currentNext = RelayLogic.Next.MISSING;
                    renderState("Errore", e.getMessage(), false);
                });
            }
        }).start();
    }

    private void copyTrigger() {
        if (currentNext != RelayLogic.Next.TESSA && currentNext != RelayLogic.Next.GPTINA) {
            toast("Nessun relay attivo.");
            return;
        }

        ClipboardManager clipboard =
                (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        clipboard.setPrimaryClip(ClipData.newPlainText("relay", "fatto"));

        String label = currentNext == RelayLogic.Next.TESSA ? "Tessa (sopra)" : "GPTina (sotto)";
        toast("'fatto' copiato: incolla e invia manualmente in " + label + ".");
    }

    private void renderState(String headline, String detail, boolean enabled) {
        relayStatus.setText(headline);
        detailStatus.setText(detail == null ? "" : detail);
        copyButton.setEnabled(enabled);
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
            while ((line = reader.readLine()) != null) out.append(line).append('\n');
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
        field.setTextSize(11);
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

    @Override
    public void onBackPressed() {
        WebView focused = tessaView != null && tessaView.hasFocus() ? tessaView :
                (gptinaView != null && gptinaView.hasFocus() ? gptinaView : null);
        if (focused != null && focused.canGoBack()) {
            focused.goBack();
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (tessaView != null) tessaView.destroy();
        if (gptinaView != null) gptinaView.destroy();
        super.onDestroy();
    }
}
