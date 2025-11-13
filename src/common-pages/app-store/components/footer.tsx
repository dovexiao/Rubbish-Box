import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.divider} />
      <View style={styles.footerContent}>
        <View style={styles.footerSection}>
          <Text style={styles.footerSectionTitle}>Google Play</Text>
          <NativeTouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Play Pass</Text>
          </NativeTouchableOpacity>
          <NativeTouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Play Points</Text>
          </NativeTouchableOpacity>
          <NativeTouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Kartu voucher</Text>
          </NativeTouchableOpacity>
          <NativeTouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Tukarkan</Text>
          </NativeTouchableOpacity>
          <NativeTouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>
              Kebijakan pengembalian dana
            </Text>
          </NativeTouchableOpacity>
        </View>
        <View style={styles.footerSection}>
          <Text style={styles.footerSectionTitle}>Anak-anak & keluarga</Text>
          <NativeTouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Panduan Orang Tua</Text>
          </NativeTouchableOpacity>
          <NativeTouchableOpacity style={styles.footerLink}>
            <Text style={styles.footerLinkText}>Berbagi dengan keluarga</Text>
          </NativeTouchableOpacity>
        </View>
      </View>
      <View style={styles.footerBottom}>
        <NativeTouchableOpacity style={styles.footerBottomLink}>
          <Text style={styles.footerBottomText}>Persyaratan Layanan</Text>
        </NativeTouchableOpacity>
        <NativeTouchableOpacity style={styles.footerBottomLink}>
          <Text style={styles.footerBottomText}>Privasi</Text>
        </NativeTouchableOpacity>
        <NativeTouchableOpacity style={styles.footerBottomLink}>
          <Text style={styles.footerBottomText}>Tentang Google Play</Text>
        </NativeTouchableOpacity>
        <NativeTouchableOpacity style={styles.footerBottomLink}>
          <Text style={styles.footerBottomText}>Developer</Text>
        </NativeTouchableOpacity>
        <NativeTouchableOpacity style={styles.footerBottomLink}>
          <Text style={styles.footerBottomText}>Google Store</Text>
        </NativeTouchableOpacity>
        <View style={styles.footerBottomLink}>
          <Text style={styles.footerBottomText}>Semua harga termasuk PPN</Text>
        </View>
        <View
          style={[
            styles.footerBottomLink,
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingBottom: 40,
              columnGap: 12,
            },
          ]}>
          <Image
            source={require('../static/uk.webp')}
            style={styles.footerLanguageFlag}
          />
          <Text style={styles.footerLanguageText}>
            Bahasa Indonesia (Indonesia)
          </Text>
        </View>
        <View style={styles.footerBottomLink}></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 72,
    backgroundColor: '#fff',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgb(232,234,237)',
    marginBottom: 36,
  },
  footerContent: {
    // marginBottom: 32,
    // gap: 24,
  },
  footerSection: {
    marginBottom: 24,
  },
  footerSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgb(95,99,104)',
    letterSpacing: 0.0178571429,
    marginBottom: 8,
    lineHeight: 32,
  },
  footerLink: {
    marginBottom: 8,
  },
  footerLinkText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: 'rgb(95,99,104)',
    letterSpacing: 0.0142857143,
    lineHeight: 32,
  },
  footerBottom: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  footerBottomLink: {
    marginRight: 24,
    marginBottom: 12,
  },
  footerBottomText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: 'rgb(95,99,104)',
    letterSpacing: 0.0142857143,
    lineHeight: 32,
  },
  footerLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 12,
  },
  footerLanguageFlag: {
    width: 24,
    height: 18,
  },
  footerLanguageText: {
    fontSize: 12,
    color: 'rgb(95,99,104)',
    lineHeight: 32,
  },
});

export default Footer;
