import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, SafeAreaView, BackHandler, Pressable, Text, ActivityIndicator, Platform, View, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Progress from 'react-native-progress';
import * as SystemUI from 'expo-system-ui';

export default function App() {
  const webViewRef = useRef(null);
  const HOME_URL = 'https://eksiseyler.com/';
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

  const onAndroidBackPress = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
      return true; // Prevent default behavior (do not exit app)
    }
    return false; // Allow default behavior (exit app)
  };

  const handleWebViewNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack && navState.url !== HOME_URL);
    updateWebViewTheme();
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

  const updateWebViewTheme = useCallback(() => {
    if (webViewRef.current) {
      const darkModeScript = `
        (function() {
          document.body.style.backgroundColor = 'black';
          document.body.style.color = 'white';
          let elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a');
          for (let i = 0; i < elements.length; i++) {
            elements[i].style.color = 'white';
          }
        })();
      `;
      const removeStylesScript = `
        (function() {
          let elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a');
          for (let i = 0; i < elements.length; i++) {
            elements[i].style.color = '';
          }
          document.body.style.backgroundColor = '';
          document.body.style.color = '';
        })();
      `;
      const scriptToInject = colorScheme === 'dark' ? darkModeScript : removeStylesScript;
      webViewRef.current.injectJavaScript(scriptToInject);
    }
  }, [colorScheme]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colorScheme === 'dark' ? '#000000' : '#ffffff');
    updateWebViewTheme();
  }, [colorScheme, updateWebViewTheme]);

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