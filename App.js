import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, BackHandler, Pressable, Text, ActivityIndicator, Platform, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Progress from 'react-native-progress';
import * as SystemUI from 'expo-system-ui';

export default function App() {
  const webViewRef = useRef(null);
  const HOME_URL = 'https://eksiseyler.com/';
  const DARK_MODE_URL = 'https://eksiseyler.com/ayarlar/gece-gorus-modu';
  const LIGHT_MODE_URL = 'https://eksiseyler.com/ayarlar/her-zamanki-gorunum';
  const [articleUrl, setArticleUrl] = useState(HOME_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
      };
    }
  }, [canGoBack]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colorScheme === 'dark' ? '#000000' : '#ffffff');
    if (webViewRef.current) {
      const themeUrl = (colorScheme === 'dark') ? DARK_MODE_URL : LIGHT_MODE_URL;
      webViewRef.current.injectJavaScript(`
        window.location.href = '${themeUrl}';
      `);
    }
    console.log(colorScheme);
  }, [colorScheme]);

  const onAndroidBackPress = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
      return true; // Prevent default behavior (do not exit app)
    }
    return false; // Allow default behavior (exit app)
  };

  const handleWebViewNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack && navState.url !== HOME_URL);
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
    <SafeAreaView style={[styles.container, colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <Progress.Bar
        progress={loadingProgress}
        width={null}
        color={colorScheme === 'dark' ? "#00FF00" : "#007AFF"}
        borderWidth={0}
      />
      <WebView
        ref={webViewRef}
        source={{ uri: articleUrl }}
        style={styles.webview}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onLoadProgress={({ nativeEvent }) => setLoadingProgress(nativeEvent.progress)}
      />
      <Pressable style={[styles.button, colorScheme === 'dark' ? styles.darkButton : styles.lightButton]} onPress={getRandomArticle} disabled={loading}>
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
  lightContainer: {
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  button: {
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  lightButton: {
    backgroundColor: '#007AFF',
  },
  darkButton: {
    backgroundColor: '#00FF00',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  webview: {
    flex: 1,
  },
});