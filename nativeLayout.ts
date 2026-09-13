type SafeInsets = { top: number; right: number; bottom: number; left: number };

// Run this inside the HTML before React mounts as well as after native inset changes.
// Android WebView does not reliably run injectedJavaScriptBeforeContentLoaded first.
export function nativeLayoutScript(platform: string, insets: SafeInsets, keyboardVisible: boolean, keyboardHeight = 0) {
  const bridge = platform === 'android'
    ? 'window.androidBridge = window.androidBridge || {};'
    : `window.webkit = window.webkit || {};
       window.webkit.messageHandlers = window.webkit.messageHandlers || {};
       window.webkit.messageHandlers.bridge = window.webkit.messageHandlers.bridge || { postMessage: function () {} };`;
  const safeInsets = { ...insets, bottom: keyboardVisible ? 0 : insets.bottom };
  const properties = Object.entries(safeInsets).map(([edge, value]) =>
    `root.style.setProperty('--outly-native-safe-${edge}', '${Math.max(0, value)}px');`,
  ).join('\n');

  return `(function () {
    ${bridge}
    window.__OUTLYRIDE_NATIVE__ = true;
    var root = document.documentElement;
    if (!root) return;
    ${properties}
    root.style.setProperty('--outly-native-keyboard-height', '${Math.max(0, keyboardHeight)}px');
    root.dataset.outlyNativeKeyboard = '${keyboardVisible}';
    window.dispatchEvent(new Event('outlyride:native-layout'));
  })(); true;`;
}
