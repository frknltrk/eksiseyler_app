import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useColorScheme, Platform, Share, Alert, FlatList, TouchableOpacity, View, StatusBar, BackHandler, Pressable, Text, ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Progress from 'react-native-progress';

const HOME_URL = 'https://eksiseyler.com/';

export default function App() {
  const webViewRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState(HOME_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [savedArticles, setSavedArticles] = useState([]);
  const [isSavedModalVisible, setIsSavedModalVisible] = useState(false);
  const colorScheme = useColorScheme();

  const handleSaveArticle = useCallback(() => {
    if (savedArticles.includes(currentUrl)) {
      Alert.alert('Duplicate Article', 'This article is already saved.');
    } else {
      setSavedArticles([...savedArticles, currentUrl]);
      Alert.alert('Article Saved', 'The current article has been saved.');
    }
  }, [currentUrl, savedArticles]);

  const toggleSavedModal = useCallback(() => {
    setIsSavedModalVisible(!isSavedModalVisible);
  }, [isSavedModalVisible]);

  const handleShareArticle = useCallback(async () => {
    try {
      await Share.share({ message: currentUrl });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  }, [currentUrl]);

  const handleWebViewNavigationStateChange = useCallback((navState) => {
    setCurrentUrl(navState.url);
    setCanGoBack(navState.canGoBack && navState.url !== HOME_URL);
  }, []);

  const switchWebViewTheme = useCallback(() => {
    if (webViewRef.current) {
      const scriptToInject = colorScheme === 'dark' ? `
        const darkModeLink = document.querySelector("a[href='/ayarlar/gece-gorus-modu']");
        if (darkModeLink) darkModeLink.click();
      ` : `
        const lightModeLink = document.querySelector("a[href='/ayarlar/her-zamanki-gorunum']");
        if (lightModeLink) lightModeLink.click();
      `;
      webViewRef.current.injectJavaScript(scriptToInject);
    }
  }, [colorScheme]);

  const onAndroidBackPress = useCallback(() => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

  const fetchRandomArticle = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(process.env.EXPO_PUBLIC_API_URL);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid content type. Expected JSON.");
      }
  
      const data = await response.json();
      if (!data.article_url) {
        throw new Error("Invalid response format. Missing 'article_url'.");
      }
  
      setCurrentUrl(data.article_url);
    } catch (error) {
      console.error("Error fetching random article:", error);
      Alert.alert("Error", "Could not fetch a random article. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);  

  const renderSavedArticle = useCallback(({ item }) => (
    <TouchableOpacity onPress={() => setCurrentUrl(item)}>
      <Text style={[styles.savedArticle, colorScheme === 'dark' ? styles.savedArticleDark : styles.savedArticleLight]}>{item}</Text>
    </TouchableOpacity>
  ), [colorScheme]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
      };
    }
  }, [onAndroidBackPress]);

  useEffect(() => {
    // Ensure the WebView theme switches on colorScheme change (i.e., real-time)
    switchWebViewTheme();

    // Update status bar style
    const statusBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';
    StatusBar.setBarStyle(statusBarStyle, true);
    StatusBar.setBackgroundColor(colorScheme === 'dark' ? '#2d2d2d' : '#ffffff');
  }, [colorScheme]);

  return (
    <SafeAreaView style={[styles.container, colorScheme === 'dark' ? styles.darkMode : styles.lightMode]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colorScheme === 'dark' ? '#2d2d2d' : '#ffffff'} />
      <Progress.Bar
        progress={loadingProgress}
        width={null}
        color="#007AFF"
        borderWidth={0}
      />
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onLoadProgress={({ nativeEvent }) => setLoadingProgress(nativeEvent.progress)}
        onLoadEnd={() => switchWebViewTheme(webViewRef, colorScheme)}
      />
      {isSavedModalVisible && (
        <FlatList
          data={savedArticles}
          renderItem={renderSavedArticle}
          keyExtractor={(item, index) => index.toString()}
          style={[styles.savedList, colorScheme === 'dark' ? styles.darkMode : styles.lightMode]}
        />
      )}
      <View style={[styles.buttonsContainer, colorScheme === 'dark' ? styles.darkMode : styles.lightMode]}>
        <Pressable style={styles.button} onPress={handleShareArticle}>
          <Text style={styles.buttonText}>PAYLAŞ</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={fetchRandomArticle} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>RASTGELE</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={handleSaveArticle}
          onLongPress={toggleSavedModal}
        >
          <Text style={styles.buttonText}>KAYDET</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  darkMode: {
    backgroundColor: '#2d2d2d',
  },
  lightMode: {
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  webview: {
    flex: 1,
    marginTop: 5
  },
  savedList: {
    flex: 1,
  },
  savedArticle: {
    padding: 10,
    borderBottomWidth: 1,
  },
  savedArticleLight: {
    color: '#2d2d2d',
  },
  savedArticleDark: {
    color: '#ffffff',
  },
});