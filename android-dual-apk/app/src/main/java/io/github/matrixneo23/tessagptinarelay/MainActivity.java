package io.github.matrixneo23.tessagptinarelay;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.Gravity;
import android.view.KeyCharacterMap;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;

public class MainActivity extends Activity {
    private static final String PREFS = "dual_chat_relay";
    private static final String DEFAULT_URL = "https://chatgpt.com/";
    private static final String TRIGGER_TEXT = "fatto";

    private static final String COMPOSER_JS =
            "(function(){" +
            "const s=['#prompt-textarea','textarea[data-testid=prompt-textarea]'," +
            "'[contenteditable=true][data-virtualkeyboard=true]','div[contenteditable=true].ProseMirror'];" +
            "for(const q of s){const e=document.querySelector(q);if(!e)continue;" +
            "const r=e.getBoundingClientRect();if(r.width>0&&r.height>0){" +
            "return [(r.left+r.width/2)/window.innerWidth,(r.top+r.height/2)/window.innerHeight];}}" +
            "return null;})()";

    private static final String COMPOSER_LENGTH_JS =
            "(function(){" +
            "const s=['#prompt-textarea','textarea[data-testid=prompt-textarea]'," +
            "'[contenteditable=true][data-virtualkeyboard=true]','div[contenteditable=true].ProseMirror'];" +
            "for(const q of s){const e=document.querySelector(q);if(!e)continue;" +
            "const v=('value' in e)?e.value:(e.innerText||e.textContent||'');" +
            "return String(v).trim().length;}return -1;})()";

    private static final String SEND_JS =
            "(function(){" +
            "const s=['button[data-testid=send-button]','button[aria-label*=Send]'," +
            "'button[aria-label*=Invia]','button[aria-label*=send]','button[aria-label*=invia]'];" +
            "for(const q of s){const e=document.querySelector(q);if(!e||e.disabled)continue;" +
            "const r=e.getBoundingClientRect();if(r.width>0&&r.height>0){" +
            "return [(r.left+r.width/2)/window.innerWidth,(r.top+r.height/2)/window.innerHeight];}}" +
            "return null;})()";

    private final Handler handler = new Handler(Looper.getMainLooper());
    private WebView tessaView;
    private WebView gptinaView;
    private EditText tessaUrl;
    private EditText gptinaUrl;
    private TextView status;
    private boolean relayBusy = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView.setWebContentsDebuggingEnabled(false);
        setContentView(buildUi());
        loadInitialPages();
    }

    private View buildUi() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(18, 18, 22));

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.setGravity(Gravity.CENTER_VERTICAL);
        actions.setPadding(8, 8, 8, 8);

        Button toTessa = button("fatto → Tessa");
        Button toGptina = button("fatto → GPTina");
        status = new TextView(this);
        status.setText("Pronta. Nessuna lettura automatica delle risposte.");
        status.setTextColor(Color.LTGRAY);
        status.setPadding(14, 0, 0, 0);

        toTessa.setOnClickListener(v -> relay(tessaView, "Tessa"));
        toGptina.setOnClickListener(v -> relay(gptinaView, "GPTina"));

        actions.addView(toTessa);
        actions.addView(toGptina);
        actions.addView(status, new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        root.addView(actions);

        LinearLayout panes = new LinearLayout(this);
        panes.setOrientation(LinearLayout.VERTICAL);

        tessaView = makeWebView("tessa_url");
        gptinaView = makeWebView("gptina_url");

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
        pane.setPadding(4, 0, 4, 4);

        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);

        TextView title = new TextView(this);
        title.setText(label);
        title.setTextColor(Color.WHITE);
        title.setPadding(8, 4, 8, 4);

        EditText url = new EditText(this);
        url.setSingleLine(true);
        url.setTextColor(Color.WHITE);
        url.setHintTextColor(Color.GRAY);
        url.setHint("https://chatgpt.com/…");
        url.setText(getPreferences(0).getString(
                tessa ? "tessa_url" : "gptina_url", DEFAULT_URL));

        Button go = button("Vai");
        go.setOnClickListener(v -> {
            String value = normalizeUrl(url.getText().toString());
            url.setText(value);
            getPreferences(0).edit()
                    .putString(tessa ? "tessa_url" : "gptina_url", value)
                    .apply();
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

    private Button button(String text) {
        Button b = new Button(this);
        b.setText(text);
        b.setAllCaps(false);
        return b;
    }

    private WebView makeWebView(String prefKey) {
        WebView view = new WebView(this);
        WebSettings s = view.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setMediaPlaybackRequiresUserGesture(true);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(view, true);

        view.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView v, String url) {
                super.onPageFinished(v, url);
                if (url != null && url.startsWith("https://")) {
                    getPreferences(0).edit().putString(prefKey, url).apply();
                    if (v == tessaView && tessaUrl != null) tessaUrl.setText(url);
                    if (v == gptinaView && gptinaUrl != null) gptinaUrl.setText(url);
                }
            }
        });
        return view;
    }

    private void loadInitialPages() {
        tessaView.loadUrl(normalizeUrl(tessaUrl.getText().toString()));
        gptinaView.loadUrl(normalizeUrl(gptinaUrl.getText().toString()));
    }

    private String normalizeUrl(String raw) {
        String value = raw == null ? "" : raw.trim();
        if (value.isEmpty()) return DEFAULT_URL;
        if (!value.startsWith("https://")) return DEFAULT_URL;
        return value;
    }

    private void relay(WebView target, String label) {
        if (relayBusy) {
            say("Relay già in corso.");
            return;
        }
        if (target == null) return;

        relayBusy = true;
        say("Controllo il composer " + label + "…");

        readComposerLength(target, before -> {
            if (before < 0) {
                finishRelay("Composer " + label + " non trovato.");
                return;
            }
            if (before != 0) {
                finishRelay("Composer " + label + " non vuoto: non invio nulla.");
                return;
            }

            locate(target, COMPOSER_JS, composer -> {
                if (composer == null) {
                    finishRelay("Composer " + label + " non localizzabile.");
                    return;
                }

                tap(target, composer[0], composer[1]);
                handler.postDelayed(() -> {
                    if (!typeAscii(target, TRIGGER_TEXT)) {
                        finishRelay("Impossibile digitare il trigger.");
                        return;
                    }

                    handler.postDelayed(() -> readComposerLength(target, typed -> {
                        if (typed < TRIGGER_TEXT.length()) {
                            finishRelay("Digitazione non confermata nel composer.");
                            return;
                        }

                        locate(target, SEND_JS, send -> {
                            if (send == null) {
                                finishRelay("Pulsante Invia non trovato: nessun invio.");
                                return;
                            }

                            tap(target, send[0], send[1]);
                            handler.postDelayed(() -> readComposerLength(target, after -> {
                                if (after == 0) {
                                    finishRelay("Trigger 'fatto' inviato a " + label + ".");
                                } else {
                                    finishRelay("Invio non confermato: il composer non si è svuotato.");
                                }
                            }), 900);
                        });
                    }), 250);
                }, 180);
            });
        });
    }

    private void readComposerLength(WebView view, IntCallback callback) {
        view.evaluateJavascript(COMPOSER_LENGTH_JS, value -> {
            try {
                callback.onValue(Integer.parseInt(value));
            } catch (Exception e) {
                callback.onValue(-1);
            }
        });
    }

    private void locate(WebView view, String script, PointCallback callback) {
        view.evaluateJavascript(script, value -> {
            if (value == null || "null".equals(value)) {
                callback.onPoint(null);
                return;
            }
            try {
                JSONArray a = new JSONArray(value);
                double nx = a.getDouble(0);
                double ny = a.getDouble(1);
                if (nx < 0 || nx > 1 || ny < 0 || ny > 1) {
                    callback.onPoint(null);
                    return;
                }
                callback.onPoint(new float[]{(float) nx, (float) ny});
            } catch (Exception e) {
                callback.onPoint(null);
            }
        });
    }

    private void tap(WebView view, float normalizedX, float normalizedY) {
        float x = normalizedX * view.getWidth();
        float y = normalizedY * view.getHeight();
        long now = SystemClock.uptimeMillis();
        MotionEvent down = MotionEvent.obtain(
                now, now, MotionEvent.ACTION_DOWN, x, y, 0);
        MotionEvent up = MotionEvent.obtain(
                now, now + 50, MotionEvent.ACTION_UP, x, y, 0);
        view.dispatchTouchEvent(down);
        view.dispatchTouchEvent(up);
        down.recycle();
        up.recycle();
        view.requestFocusFromTouch();
    }

    private boolean typeAscii(WebView view, String text) {
        KeyCharacterMap map = KeyCharacterMap.load(KeyCharacterMap.VIRTUAL_KEYBOARD);
        KeyEvent[] events = map.getEvents(text.toCharArray());
        if (events == null || events.length == 0) return false;
        for (KeyEvent event : events) {
            view.dispatchKeyEvent(event);
        }
        return true;
    }

    private void finishRelay(String message) {
        relayBusy = false;
        say(message);
    }

    private void say(String message) {
        status.setText(message);
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onBackPressed() {
        WebView focused = tessaView.hasFocus() ? tessaView :
                (gptinaView.hasFocus() ? gptinaView : null);
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

    private interface PointCallback {
        void onPoint(float[] point);
    }

    private interface IntCallback {
        void onValue(int value);
    }
}
