import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import GooglePlayLogo from './google-play-logo';
import SearchIcon from './search-icon';
import QuestionIcon from './question-icon';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const navItems = ['Game', 'Aplikasi', 'Film', 'Buku', 'Anak-anak'];
  const [activeNav, setActiveNav] = React.useState('Aplikasi');

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <GooglePlayLogo size={40} />
              <Text style={styles.logoTitle}>Google Play</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <NativeTouchableOpacity style={styles.iconButton}>
            {/* <Text style={styles.icon}>🔍</Text> */}
            <SearchIcon size={24} />
          </NativeTouchableOpacity>
          <NativeTouchableOpacity style={styles.iconButton}>
            {/* <Text style={styles.icon}>❓</Text> */}
            <QuestionIcon size={24} />
          </NativeTouchableOpacity>
          <NativeTouchableOpacity style={styles.iconButton}>
            <Image
              source={require('../static/logo_avatar_anonymous_color_1x_web_32dp.png')}
              style={styles.avatar}
            />
          </NativeTouchableOpacity>
        </View>
      </View>
      <View style={styles.mobileNav}>
        {navItems.map(item => (
          <NativeTouchableOpacity
            key={item}
            style={styles.mobileNavItem}
            onPress={() => setActiveNav(item)}>
            <Text
              style={[
                styles.mobileNavText,
                activeNav === item && styles.mobileNavTextActive,
              ]}>
              {item}
            </Text>
            {activeNav === item && <View style={styles.mobileNavIndicator} />}
          </NativeTouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    height: 56,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgb(95,99,104)',
    fontFamily: 'System',
    marginLeft: 8,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgb(95,99,104)',
    letterSpacing: 0.0178571429,
  },
  navTextActive: {
    color: '#01875f',
  },
  navIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#01875f',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  icon: {
    fontSize: 24,
    color: 'rgb(95,99,104)',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  mobileNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 48,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  mobileNavItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mobileNavText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgb(95,99,104)',
    letterSpacing: 0.0178571429,
  },
  mobileNavTextActive: {
    color: '#01875f',
  },
  mobileNavIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: '#01875f',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});

export default Header;
