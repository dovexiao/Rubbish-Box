/* eslint-disable */
/* prettier-ignore */
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import WebView from 'react-native-webview';
import {useRoute} from '@react-navigation/native';
import {getCasinoUrl, getSportUrl} from '@/pages/home/home.service';

const {width, height} = Dimensions.get('window');

const CasinoGameWeb = () => {
  const route = useRoute();
  const {id} = route.params as {id: number};

  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = id === 99999 ? await getSportUrl() : await getCasinoUrl(id);
        if (res) {
          setUrl(res);
        }
      } catch (error) {
        console.error('Failed to fetch casino URL', error);
        setUrl('');
      }
    };

    fetchUrl();
  }, [id]);

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#F8D72F" />
    </View>
  );

  if (!url) {
    return (
      <View style={styles.loadingContainer}>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {loading && renderLoading()}
        <iframe
          src={url}
          style={styles.iframe as any}
          frameBorder="0"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && renderLoading()}
      <WebView
        source={{uri: url}}
        startInLoadingState
        style={{flex: 1}}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

export default CasinoGameWeb;

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Optional: dim the background
    zIndex: 1,
  },
  container: {
    flex: 1,
  },
  iframe: {
    width: width,
    height: height,
    border: 'none',
  },
});
