import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { createStyles, rpx } from '../utils/rpxStyleSheet';

interface DebugToolsProps {
  visible?: boolean;
}

/**
 * 调试工具组件
 * 提供快捷方式打开调试器和显示布局信息
 */
export function DebugTools({ visible = __DEV__ }: DebugToolsProps) {
  const [showGrid, setShowGrid] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showDebugView, setShowDebugView] = useState(false);
  const [componentTree, setComponentTree] = useState<any[]>([]);
  const { width, height } = Dimensions.get('window');
  
  // 收集组件树信息
  useEffect(() => {
    if (showDebugView) {
      try {
        // 尝试获取组件树信息
        const tree = [];
        // 这里只是模拟，实际情况下无法直接获取完整组件树
        tree.push({ name: 'HomeScreen', children: 3, props: { style: { flex: 1 } } });
        tree.push({ name: 'LinearGradient', children: 5, props: { colors: ['#93abff', '#e4f4ff', '#cdedff', '#ffffff'] } });
        tree.push({ name: 'StatusBar', children: 0, props: { theme: 'dark' } });
        tree.push({ name: 'View (topBar)', children: 2, props: { style: { flexDirection: 'row' } } });
        tree.push({ name: 'TouchableOpacity (aiButton)', children: 1, props: {} });
        setComponentTree(tree);
      } catch (error) {
        console.error('获取组件树失败:', error);
      }
    }
  }, [showDebugView]);

  if (!visible) return null;

  const openDebugger = () => {
    // 尝试打开调试器
    if (global.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('React DevTools 已连接');
    } else {
      console.log('请连接 React Native Debugger');
    }
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };
  
  const toggleDebugView = () => {
    setShowDebugView(!showDebugView);
  };

  return (
    <>
      {/* 调试工具面板 */}
      <View style={styles.debugPanel}>
        <TouchableOpacity style={styles.debugButton} onPress={openDebugger}>
          <Text style={styles.debugButtonText}>调试器</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={toggleGrid}>
          <Text style={styles.debugButtonText}>网格</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={toggleInfo}>
          <Text style={styles.debugButtonText}>信息</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.debugButton} onPress={toggleDebugView}>
          <Text style={styles.debugButtonText}>结构</Text>
        </TouchableOpacity>
      </View>

      {/* 网格覆盖层 */}
      {showGrid && (
        <View style={styles.gridOverlay} pointerEvents="none">
          {/* 横向网格线 */}
          {Array.from({ length: Math.ceil(height / rpx(100)) }).map((_, i) => (
            <View 
              key={`h-${i}`} 
              style={[
                styles.gridLine, 
                { 
                  top: rpx(i * 100), 
                  width: '100%',
                  height: 1,
                }
              ]} 
            />
          ))}
          
          {/* 纵向网格线 */}
          {Array.from({ length: Math.ceil(width / rpx(100)) }).map((_, i) => (
            <View 
              key={`v-${i}`} 
              style={[
                styles.gridLine, 
                { 
                  left: rpx(i * 100), 
                  height: '100%',
                  width: 1,
                }
              ]} 
            />
          ))}
        </View>
      )}

      {/* 设备信息 */}
      {showInfo && (
        <View style={styles.infoPanel} pointerEvents="none">
          <Text style={styles.infoText}>屏幕: {width.toFixed(0)} x {height.toFixed(0)}px</Text>
          <Text style={styles.infoText}>rpx比例: {(width / 750).toFixed(4)}</Text>
          <Text style={styles.infoText}>100rpx = {rpx(100).toFixed(1)}px</Text>
        </View>
      )}
      
      {/* 组件结构查看器 */}
      {showDebugView && (
        <ScrollView style={styles.debugViewPanel}>
          <Text style={styles.debugViewTitle}>组件结构</Text>
          {componentTree.map((component, index) => (
            <View key={index} style={styles.componentItem}>
              <Text style={styles.componentName}>{component.name}</Text>
              <Text style={styles.componentDetail}>
                子组件: {component.children}
              </Text>
              <Text style={styles.componentDetail}>
                属性: {JSON.stringify(component.props, null, 2)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </>
  );
}

const styles = createStyles({
  debugPanel: {
    position: 'absolute',
    top: 40,
    right: 10,
    flexDirection: 'row',
    zIndex: 9999,
  },
  debugButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginLeft: 5,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  infoPanel: {
    position: 'absolute',
    top: 80,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 4,
    zIndex: 9999,
  },
  infoText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  debugViewPanel: {
    position: 'absolute',
    top: 80,
    left: 10,
    right: 10,
    height: 400,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 10,
    borderRadius: 4,
    zIndex: 9999,
  },
  debugViewTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  componentItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
  },
  componentName: {
    color: '#4891FF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  componentDetail: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
});

export default DebugTools;
