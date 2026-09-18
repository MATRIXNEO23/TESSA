package io.github.matrixneo23.tessachat;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

public class MainActivity extends Activity {
    private static final String CHAT_URL = "https://matrixneo23.github.io/TESSA/chat/?v=20260918-1223";
    private static final String CONTENTS_API_BASE = "https://api.github.com/repos/MATRIXNEO23/TESSA/contents/";
    private static final String DEFAULT_THREAD_PATH = "agent-exchanges/correspondence/2026-09-18-continuity-003.md";
    private static final String PREFS = "tessa_chat_secure";
    private static final String TOKEN_BLOB = "github_token_blob";
    private static final String KEY_ALIAS = "tessa_chat_github_token";

    private WebView webView;
    private volatile String etag = null;
    private volatile String etagPath = null;
    private final AtomicBoolean fetching = new AtomicBoolean(false);

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        setContentView(webView);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.clearCache(true);
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new NativeBridge(this), "TessaNative");
        webView.loadUrl(CHAT_URL);
    }

    @Override protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.evaluateJavascript("if(typeof load==='function'){load(true);}", null);
        }
    }

    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }

    private class NativeBridge {
        private final Context context;
        NativeBridge(Context context) { this.context = context; }

        @JavascriptInterface public boolean hasGitHubToken() {
            return getToken() != null;
        }

        @JavascriptInterface public boolean saveGitHubToken(String token) {
            if (token == null || token.trim().length() < 20) return false;
            try {
                saveToken(token.trim());
                etag = null;
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface public void clearGitHubToken() {
            context.getSharedPreferences(PREFS, MODE_PRIVATE).edit().remove(TOKEN_BLOB).apply();
            etag = null;
        }

        @JavascriptInterface public void refreshThread() {
            refreshThreadPath(DEFAULT_THREAD_PATH);
        }

        @JavascriptInterface public void refreshThreadPath(String path) {
            final String token = getToken();
            final String cleanPath = validateThreadPath(path);
            if (token == null || cleanPath == null || !fetching.compareAndSet(false, true)) return;
            new Thread(() -> {
                try { fetchThread(token, cleanPath); }
                catch (Exception e) { js("window.onNativeSyncError(" + JSONObject.quote(e.getMessage()) + ")"); }
                finally { fetching.set(false); }
            }).start();
        }

        @JavascriptInterface public void sendMessage(String text) {
            sendMessageTo(DEFAULT_THREAD_PATH, text);
        }

        @JavascriptInterface public void sendMessageTo(String path, String text) {
            final String token = getToken();
            final String cleanPath = validateThreadPath(path);
            final String clean = text == null ? "" : text.trim();
            if (token == null) {
                js("window.onNativeSendResult(false,'Autorizzazione GitHub mancante')");
                return;
            }
            if (cleanPath == null) {
                js("window.onNativeSendResult(false,'Percorso thread non valido')");
                return;
            }
            if (clean.isEmpty()) return;
            new Thread(() -> {
                try {
                    appendMessage(token, cleanPath, clean);
                    etag = null;
                    etagPath = null;
                    js("window.onNativeSendResult(true,'Messaggio inviato')");
                    fetchThread(token, cleanPath);
                } catch (Exception e) {
                    js("window.onNativeSendResult(false," + JSONObject.quote(e.getMessage()) + ")");
                }
            }).start();
        }
    }

    private void fetchThread(String token, String path) throws Exception {
        if (!path.equals(etagPath)) etag = null;
        HttpURLConnection c = connection("GET", token, path);
        if (etag != null) c.setRequestProperty("If-None-Match", etag);
        int code = c.getResponseCode();
        if (code == 304) return;
        if (code != 200) throw new Exception("GitHub GET " + code + ": " + readBody(c.getErrorStream()));
        String newEtag = c.getHeaderField("ETag");
        JSONObject obj = new JSONObject(readBody(c.getInputStream()));
        String md = new String(Base64.decode(obj.getString("content"), Base64.DEFAULT), StandardCharsets.UTF_8);
        if (newEtag != null) etag = newEtag;
        etagPath = path;
        js("window.onNativeThread(" + JSONObject.quote(md) + ")");
    }

    private void appendMessage(String token, String path, String text) throws Exception {
        for (int attempt = 0; attempt < 2; attempt++) {
            HttpURLConnection get = connection("GET", token, path);
            int gc = get.getResponseCode();
            if (gc != 200) throw new Exception("GitHub GET " + gc + ": " + readBody(get.getErrorStream()));
            JSONObject current = new JSONObject(readBody(get.getInputStream()));
            String sha = current.getString("sha");
            String md = new String(Base64.decode(current.getString("content"), Base64.DEFAULT), StandardCharsets.UTF_8);
            String when = new SimpleDateFormat("dd/MM/yyyy, HH:mm:ss", Locale.ITALY).format(new Date());
            String block = "\n\n---\n\n## Turno manuale — Alberto — " + when +
                    "\n\n### Messaggio\n\n" + text +
                    "\n\n### Destinatario\n\nTessa e GPTina\n";
            String updated = md + block;

            JSONObject body = new JSONObject();
            body.put("message", "Alberto: messaggio dalla chat");
            body.put("content", Base64.encodeToString(updated.getBytes(StandardCharsets.UTF_8), Base64.NO_WRAP));
            body.put("sha", sha);

            HttpURLConnection put = connection("PUT", token, path);
            put.setRequestProperty("Content-Type", "application/json; charset=utf-8");
            put.setDoOutput(true);
            try (OutputStream os = put.getOutputStream()) {
                os.write(body.toString().getBytes(StandardCharsets.UTF_8));
            }
            int pc = put.getResponseCode();
            if (pc == 200 || pc == 201) return;
            String err = readBody(put.getErrorStream());
            if (pc == 409 && attempt == 0) {
                Thread.sleep(500);
                continue;
            }
            throw new Exception("GitHub PUT " + pc + ": " + err);
        }
    }

    private String validateThreadPath(String path) {
        if (path == null) return null;
        String clean = path.trim();
        if (!clean.startsWith("agent-exchanges/correspondence/")) return null;
        if (!clean.endsWith(".md")) return null;
        if (clean.contains("..") || !clean.matches("[A-Za-z0-9._/-]+")) return null;
        return clean;
    }

    private HttpURLConnection connection(String method, String token, String path) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(CONTENTS_API_BASE + path).openConnection();
        c.setRequestMethod(method);
        c.setConnectTimeout(8000);
        c.setReadTimeout(8000);
        c.setRequestProperty("Accept", "application/vnd.github+json");
        c.setRequestProperty("Authorization", "Bearer " + token);
        c.setRequestProperty("X-GitHub-Api-Version", "2026-03-10");
        c.setRequestProperty("User-Agent", "Tessa-Chat-Android");
        return c;
    }

    private String readBody(InputStream in) throws Exception {
        if (in == null) return "";
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) sb.append(line).append('\n');
        }
        return sb.toString().trim();
    }

    private void js(String code) {
        runOnUiThread(() -> webView.evaluateJavascript(code, null));
    }

    private SecretKey getOrCreateKey() throws Exception {
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
        ks.load(null);
        if (ks.containsAlias(KEY_ALIAS)) return ((KeyStore.SecretKeyEntry) ks.getEntry(KEY_ALIAS, null)).getSecretKey();
        KeyGenerator kg = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        kg.init(new KeyGenParameterSpec.Builder(KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build());
        return kg.generateKey();
    }

    private void saveToken(String token) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey());
        byte[] iv = cipher.getIV();
        byte[] enc = cipher.doFinal(token.getBytes(StandardCharsets.UTF_8));
        String blob = Base64.encodeToString(iv, Base64.NO_WRAP) + ":" + Base64.encodeToString(enc, Base64.NO_WRAP);
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(TOKEN_BLOB, blob).apply();
    }

    private String getToken() {
        try {
            String blob = getSharedPreferences(PREFS, MODE_PRIVATE).getString(TOKEN_BLOB, null);
            if (blob == null) return null;
            String[] parts = blob.split(":", 2);
            if (parts.length != 2) return null;
            byte[] iv = Base64.decode(parts[0], Base64.DEFAULT);
            byte[] enc = Base64.decode(parts[1], Base64.DEFAULT);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(), new GCMParameterSpec(128, iv));
            return new String(cipher.doFinal(enc), StandardCharsets.UTF_8);
        } catch (Exception e) {
            return null;
        }
    }
}
