import React, { useState, useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { StyleSheet, SafeAreaView, BackHandler, Pressable, Text, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Progress from 'react-native-progress';

export default function App() {
  const webViewRef = useRef(null);
  const HOME_URL = 'https://eksiseyler.com/';
  const [articleUrl, setArticleUrl] = useState(HOME_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const colorScheme = useColorScheme();

  const handleWebViewNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack && navState.url !== HOME_URL);
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
      };
    }
  }, [canGoBack]);

  // Inject JavaScript to click the link for dark mode or light mode
  useEffect(() => {
    const switchTheme = () => {
      if (colorScheme === 'dark') {
        webViewRef.current.injectJavaScript(`
          const darkModeLink = document.querySelector("a[href='/ayarlar/gece-gorus-modu']");
          if (darkModeLink) darkModeLink.click();
        `);
      } else {
        webViewRef.current.injectJavaScript(`
          const lightModeLink = document.querySelector("a[href='/ayarlar/her-zamanki-gorunum']");
          if (lightModeLink) lightModeLink.click();
        `);
      }
    };
    if (webViewRef.current) {
      switchTheme();
    }
  }, [colorScheme]);

  const onAndroidBackPress = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  const getRandomArticle = async () => {
    setLoading(true);
    try {
      const response = await fetch(process.env.EXPO_PUBLIC_API_URL);
      const data = await response.json();
      setArticleUrl(data['article_url']);
    } catch (error) {
      console.error('Error fetching random article:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Progress.Bar
        progress={loadingProgress}
        width={null}
        color="#007AFF"
        borderWidth={0}
      />
      <WebView
        ref={webViewRef}
        source={{ uri: articleUrl }}
        style={styles.webview}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onLoadProgress={({ nativeEvent }) => setLoadingProgress(nativeEvent.progress)}
      />
      <Pressable style={styles.button} onPress={getRandomArticle} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>RASTGELE</Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  webview: {
    flex: 1,
  },
});