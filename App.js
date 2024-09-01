import React, { useState, useEffect, useRef } from 'react';
import { useColorScheme, Platform, Share, Alert, FlatList, TouchableOpacity, View, StatusBar } from 'react-native';
import { StyleSheet, SafeAreaView, BackHandler, Pressable, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Progress from 'react-native-progress';

export default function App() {
  const webViewRef = useRef(null);
  const HOME_URL = 'https://eksiseyler.com/';
  const [currentUrl, setCurrentUrl] = useState(HOME_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [savedArticles, setSavedArticles] = useState([]);
  const [savedModalVisible, setSavedModalVisible] = useState(false);
  const colorScheme = useColorScheme();

  const handleSaveArticle = () => {
    if (!savedArticles.includes(currentUrl)) {
      setSavedArticles([...savedArticles, currentUrl]);
      Alert.alert('Article Saved', 'The current article has been saved.');
    } else {
      Alert.alert('Duplicate Article', 'This article is already saved.');
    }
  };

  const handleOpenSavedArticles = () => {
    setSavedModalVisible(!savedModalVisible);
  };

  const handleShareArticle = async () => {
    try {
      await Share.share({
        message: currentUrl,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleWebViewNavigationStateChange = (navState) => {
    setCurrentUrl(navState.url);
    setCanGoBack(navState.canGoBack && navState.url !== HOME_URL);
  };

  const switchWebViewTheme = (webViewRef, colorScheme) => {
    if (webViewRef.current) {
      const darkModeScript = `
        const darkModeLink = document.querySelector("a[href='/ayarlar/gece-gorus-modu']");
        if (darkModeLink) darkModeLink.click();
      `;
      const lightModeScript = `
        const lightModeLink = document.querySelector("a[href='/ayarlar/her-zamanki-gorunum']");
        if (lightModeLink) lightModeLink.click();
      `;

      const scriptToInject = colorScheme === 'dark' ? darkModeScript : lightModeScript;
      webViewRef.current.injectJavaScript(scriptToInject);
    }
  };

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
      setCurrentUrl(data['article_url']);
    } catch (error) {
      console.error('Error fetching random article:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSavedArticle = ({ item }) => (
    <TouchableOpacity onPress={() => setCurrentUrl(item)}>
      <Text style={[styles.savedArticle, colorScheme === 'dark' ? styles.savedArticleDark : styles.savedArticleLight]}>{item}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
      };
    }
  }, [canGoBack]);

  useEffect(() => {
    // Switch WebView theme
    switchWebViewTheme(webViewRef, colorScheme);

    // Update status bar style
    const statusBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';
    StatusBar.setBarStyle(statusBarStyle, true);
  }, [colorScheme]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
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
      {savedModalVisible && (
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
        <Pressable style={styles.button} onPress={getRandomArticle} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>RASTGELE</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={handleSaveArticle}
          onLongPress={handleOpenSavedArticles}
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