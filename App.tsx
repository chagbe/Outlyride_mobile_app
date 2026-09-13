import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { embeddedOutlyrideHtml } from './embeddedOutlyride';
import { nativeLayoutScript } from './nativeLayout';

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <OutlyrideWebView />
    </SafeAreaProvider>
  );
}

function OutlyrideWebView() {
  const webView = useRef<WebView>(null);
  const insets = useSafeAreaInsets();
  const [error, setError] = useState('');
  const [keyboard, setKeyboard] = useState({ visible: false, height: 0 });
  const layoutScript = nativeLayoutScript(Platform.OS, insets, keyboard.visible, keyboard.height);
  const initialLayoutScript = useRef(layoutScript);
  // Changing the HTML source on rotation would reload the page and discard the user's form.
  const source = useMemo(() => ({
    html: embeddedOutlyrideHtml.replace('<head>', `<head><script>${initialLayoutScript.current}</script>`),
    baseUrl: 'https://outlyride.local',
  }), []);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => setKeyboard({ visible: true, height: event.endCoordinates.height }),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboard({ visible: false, height: 0 }),
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    webView.current?.injectJavaScript(layoutScript);
  }, [layoutScript]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      <StatusBar style="dark" />
      <WebView
        ref={webView}
        style={styles.webView}
        source={source}
        originWhitelist={['*']}
        injectedJavaScriptBeforeContentLoaded={layoutScript}
        automaticallyAdjustContentInsets={false}
        automaticallyAdjustsScrollIndicatorInsets={false}
        contentInsetAdjustmentBehavior="never"
        bounces={false}
        overScrollMode="never"
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        allowsInlineMediaPlayback
        onLoadStart={() => setError('')}
        onLoadEnd={() => webView.current?.injectJavaScript(layoutScript)}
        onError={(event) => setError(event.nativeEvent.description || 'Unable to reach the Outlyride app server.')}
        renderLoading={() => (
          <View style={styles.loading}>
            <Image source={require('./assets/logo-transparent.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Outlyride logo" />
            <ActivityIndicator size="large" color="#079b34" />
            <Text style={styles.loadingText}>Opening Outlyride…</Text>
          </View>
        )}
      />
      {error ? (
        <View style={styles.errorPanel}>
          <Image source={require('./assets/logo-transparent.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Outlyride logo" />
          <Text style={styles.errorTitle}>Outlyride is not reachable</Text>
          <Text style={styles.errorText}>Reload the Expo update to reopen the packaged Outlyride interface.</Text>
          <Pressable style={styles.retryButton} onPress={() => webView.current?.reload()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  webView: { flex: 1, backgroundColor: '#f8fff8' },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#f8fff8' },
  logo: { width: 112, height: 112, marginBottom: 6 },
  loadingText: { color: '#0b2718', fontSize: 16, fontWeight: '700' },
  errorPanel: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: '#f8fff8' },
  errorTitle: { marginBottom: 10, color: '#0c0c12', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  errorText: { color: '#66736b', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  retryButton: { minWidth: 150, marginTop: 22, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 24, backgroundColor: '#079b34' },
  retryText: { color: '#ffffff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
});
