import React from 'react';
import {Text, StyleSheet} from 'react-native';
import usePWAInstall from '@/hooks/usePWAInstall';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';

const DownloadButton: React.FC = () => {
  const {canInstall, isInstalling, isInstalled, showInstallPrompt} =
    usePWAInstall();

  const handleDownload = async () => {
    if (isInstalled) {
      //   alert('✅ App 已安装');
      return;
    }

    if (!canInstall) {
      //   alert('⚠️ 当前浏览器不支持 PWA 安装或未触发 beforeinstallprompt');
      return;
    }

    await showInstallPrompt();
  };

  return (
    <NativeTouchableOpacity
      style={[
        styles.downloadButton,
        (!canInstall || isInstalling || isInstalled) && styles.disabledButton,
      ]}
      onPress={handleDownload}
      disabled={!canInstall || isInstalling || isInstalled}>
      <Text style={styles.downloadButtonText}>
        {isInstalled ? 'Installed' : isInstalling ? 'Installing...' : 'Install'}
      </Text>
    </NativeTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  downloadButton: {
    backgroundColor: '#01875f',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DownloadButton;
