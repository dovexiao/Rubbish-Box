import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const NetworkTester = () => {
  const testNetworkRequest = async () => {
    try {
      const testUrl = 'http://8.135.11.47:8000/AppStart/Input_Code';
      
      console.log('Testing network request to:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phoneid: '13800138000'
        }),
        timeout: 10000, // 10秒超时
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      Alert.alert('成功', '网络请求成功！');
      
    } catch (error: any) {
      console.error('网络请求失败:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      Alert.alert('失败', `网络请求失败: ${error.message}`);
    }
  };

  const testWithXMLHttpRequest = () => {
    const xhr = new XMLHttpRequest();
    const testUrl = 'http://8.135.11.47:8000/AppStart/Input_Code';
    
    xhr.timeout = 10000;
    xhr.open('POST', testUrl);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function() {
      console.log('XHR readyState:', xhr.readyState, 'status:', xhr.status);
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 201) {
          Alert.alert('XHR 成功', 'XMLHttpRequest 请求成功！');
        } else {
          Alert.alert('XHR 失败', `状态码: ${xhr.status}`);
        }
      }
    };
    xhr.onerror = function() {
      console.error('XHR error occurred');
      Alert.alert('XHR 错误', '请求过程中发生错误');
    };
    xhr.ontimeout = function() {
      console.error('XHR timeout');
      Alert.alert('XHR 超时', '请求超时');
    };
    xhr.send(JSON.stringify({
      phoneid: '13800138000'
    }));
  };

  const testWithAxios = async () => {
    try {
      const response = await axios.post('http://8.135.11.47:8000/AppStart/Input_Code', {
        phoneid: '13800138000'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Axios response:', response.data);
      Alert.alert('Axios 成功', '请求成功！');
    } catch (error: any) {
      console.error('Axios error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      Alert.alert('Axios 失败', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>网络测试工具</Text>
      <TouchableOpacity style={styles.button} onPress={testNetworkRequest}>
        <Text style={styles.buttonText}>测试 Fetch 请求</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={testWithXMLHttpRequest}>
        <Text style={styles.buttonText}>测试 XMLHttpRequest</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={testWithAxios}>
        <Text style={styles.buttonText}>测试 Axios 请求</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NetworkTester;


