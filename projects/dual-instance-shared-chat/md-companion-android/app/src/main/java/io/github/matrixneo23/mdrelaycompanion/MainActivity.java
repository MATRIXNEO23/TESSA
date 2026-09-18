package io.github.matrixneo23.mdrelaycompanion;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
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
    private static final String TOP_URL = "top_browser_url";
    private static final String BOTTOM_GPT_URL = "bottom_gpt_url";
    private static final String DEFAULT_GPT_URL = "https://chatgpt.com/";
    private static final String GOOGLE_HOME = "https://www.google.com/";

    private static final String ENTRYPOINT_URL =
            "https://raw.githubusercontent.com/MATRIXNEO23/TESSA/main/agent-exchanges/TASK_ENTRYPOINT.md";
    private static final String RAW_BASE =
            "https://raw.githubusercontent.com/MATRIXNEO23/TESSA/main/";

    private TextView relayStatus;
    private TextView detailStatus;
    private EditText topAddress;
    private Button copyButton;
    private WebView topView;
    private WebView bottomView;

    private RelayLogic.Next currentNext = RelayLogic.Next.MISSING;
    private boolean refreshing = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setFlags(
                WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(buildUi());
        enterImmersiveMode();
        refreshRelay();
    }

    private View buildUi() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(18, 18, 22));

        LinearLayout relayBar = new LinearLayout(this);
        relayBar.setOrientation(LinearLayout.HORIZONTAL);
        relayBar.setGravity(Gravity.CENTER_VERTICAL);
        relayBar.setPadding(dp(6), dp(3), dp(6), dp(3));

        relayStatus = text("Controllo turno…", 14, Color.WHITE);
        detailStatus = text("", 10, Color.LTGRAY);

        LinearLayout statusBox = new LinearLayout(this);
        statusBox.setOrientation(LinearLayout.VERTICAL);
        statusBox.addView(relayStatus);
        statusBox.addView(detailStatus);

        Button refresh = smallButton("↻");
        refresh.setContentDescription("Aggiorna turno");
        refresh.setOnClickListener(v -> refreshRelay());

        copyButton = smallButton("Copia fatto");
        copyButton.setEnabled(false);
        copyButton.setOnClickListener(v -> copyTrigger());

        relayBar.addView(statusBox, new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        relayBar.addView(refresh);
        relayBar.addView(copyButton);
        root.addView(relayBar);

        LinearLayout panes = new LinearLayout(this);
        panes.setOrientation(LinearLayout.VERTICAL);

        topView = makeBrowserWebView(true);
        bottomView = makeBrowserWebView(false);

        panes.addView(makeTopPane(), new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        panes.addView(makeBottomPane(), new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));

        root.addView(panes, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        return root;
    }

    private View makeTopPane() {
        LinearLayout pane = new LinearLayout(this);
        pane.setOrientation(LinearLayout.VERTICAL);
        pane.setPadding(dp(3), 0, dp(3), dp(2));

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);

        TextView title = text("Web / Agente", 12, Color.WHITE);
        title.setPadding(dp(3), 0, dp(5), 0);

        String initial = getPreferences(0).getString(TOP_URL, DEFAULT_GPT_URL);
        if (!RelayLogic.isAllowedBrowserUrl(initial)) initial = DEFAULT_GPT_URL;
        topAddress = urlField(initial);

        Button go = smallButton("Vai");
        go.setOnClickListener(v -> loadTopAddress());

        Button google = smallButton("G");
        google.setContentDescription("Google home");
        google.setOnClickListener(v -> {
            topAddress.setText(GOOGLE_HOME);
            getPreferences(0).edit().putString(TOP_URL, GOOGLE_HOME).apply();
            topView.loadUrl(GOOGLE_HOME);
        });

        bar.addView(title);
        bar.addView(topAddress, new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        bar.addView(go);
        bar.addView(google);

        pane.addView(bar);
        pane.addView(topView, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        return pane;
    }

    private View makeBottomPane() {
        LinearLayout pane = new LinearLayout(this);
        pane.setOrientation(LinearLayout.VERTICAL);
        pane.setPadding(dp(3), dp(1), dp(3), dp(2));

        TextView label = text("GPT", 12, Color.WHITE);
        label.setPadding(dp(4), dp(2), 0, dp(2));
        pane.addView(label);
        pane.addView(bottomView, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        return pane;
    }

    private WebView makeBrowserWebView(boolean top) {
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
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                String target = request.getUrl().toString();
                return !RelayLogic.isAllowedBrowserUrl(target);
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                super.onPageFinished(v, url);
                if (!RelayLogic.isAllowedBrowserUrl(url)) return;

                if (top) {
                    getPreferences(0).edit().putString(TOP_URL, url).apply();
                    if (topAddress != null) topAddress.setText(url);
                } else if (RelayLogic.isAllowedChatUrl(url)) {
                    getPreferences(0).edit().putString(BOTTOM_GPT_URL, url).apply();
                }
            }
        });

        String initial;
        if (top) {
            initial = getPreferences(0).getString(TOP_URL, DEFAULT_GPT_URL);
            if (!RelayLogic.isAllowedBrowserUrl(initial)) initial = DEFAULT_GPT_URL;
        } else {
            initial = getPreferences(0).getString(BOTTOM_GPT_URL, DEFAULT_GPT_URL);
            if (!RelayLogic.isAllowedChatUrl(initial)) initial = DEFAULT_GPT_URL;
        }
        view.loadUrl(initial);
        return view;
    }

    private void loadTopAddress() {
        String raw = topAddress.getText().toString().trim();
        String value = RelayLogic.normalizeBrowserUrl(raw);
        if (!RelayLogic.isAllowedBrowserUrl(value)) {
            toast("Indirizzo HTTPS non valido.");
            return;
        }
        topAddress.setText(value);
        getPreferences(0).edit().putString(TOP_URL, value).apply();
        topView.loadUrl(value);
    }

    private void refreshRelay() {
        if (refreshing) return;
        refreshing = true;
        currentNext = RelayLogic.Next.MISSING;
        renderState("Aggiornamento…", "Leggo il transcript.", false);

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
                            renderState("Tocca a GPTina", "GPT sotto", true);
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

        String label = currentNext == RelayLogic.Next.TESSA ? "Tessa / sopra" : "GPTina / sotto";
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

    private void enterImmersiveMode() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterImmersiveMode();
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
        field.setTextSize(10);
        field.setHint("https://...");
        field.setTextColor(Color.WHITE);
        field.setHintTextColor(Color.GRAY);
        return field;
    }

    private Button smallButton(String value) {
        Button button = new Button(this);
        button.setText(value);
        button.setTextSize(10);
        button.setMinWidth(0);
        button.setMinimumWidth(0);
        button.setMinHeight(0);
        button.setMinimumHeight(0);
        button.setPadding(dp(8), dp(3), dp(8), dp(3));
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
        WebView focused = topView != null && topView.hasFocus() ? topView :
                (bottomView != null && bottomView.hasFocus() ? bottomView : null);
        if (focused != null && focused.canGoBack()) {
            focused.goBack();
            return;
        }

        new AlertDialog.Builder(this)
                .setTitle("Uscire dall'app?")
                .setMessage("Le due pagine resteranno salvate per il prossimo avvio.")
                .setNegativeButton("Annulla", null)
                .setPositiveButton("Esci", (dialog, which) -> MainActivity.super.onBackPressed())
                .show();
    }

    @Override
    protected void onDestroy() {
        if (topView != null) topView.destroy();
        if (bottomView != null) bottomView.destroy();
        super.onDestroy();
    }
}
