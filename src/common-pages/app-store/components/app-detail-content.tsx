import React, {useState} from 'react';
import {View, Text, Image, StyleSheet, ScrollView} from 'react-native';
import ShareIcon from './share-icon';
import BookMarkIcon from './book-mark-icon';
import StarIcon from './star-icon';
import StarHalfIcon from './star-half-icon';
import DownloadButton from './download-button';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {envConfig} from '@/utils';

interface AppDetailContentProps {}

const AppDetailContent: React.FC<AppDetailContentProps> = () => {
  const [selectedDevice, setSelectedDevice] = useState('Ponsel');

  const screenshots = [
    require('../static/1.png'),
    require('../static/2.png'),
    require('../static/3.png'),
    require('../static/4.png'),
    require('../static/5.png'),
  ];

  const popularGames = [
    {name: 'Mahjong2', icon: require('../static/game.webp'), rating: 4.9},
    {name: 'Wild Bounty', icon: require('../static/game1.webp'), rating: 4.9},
    {
      name: 'Gates of Olympus',
      icon: require('../static/game2.webp'),
      rating: 4.8,
    },
    {name: 'Wild Bandito', icon: require('../static/game3.webp'), rating: 4.8},
    {
      name: 'Starlight Princess',
      icon: require('../static/game4.webp'),
      rating: 4.7,
    },
    {name: 'Aztec', icon: require('../static/game5.webp'), rating: 4.7},
  ];

  const handleShare = () => {
    // Handle share logic
    console.log('Share clicked');
  };

  const handleWishlist = () => {
    // Handle wishlist logic
    console.log('Wishlist clicked');
  };

  return (
    <View style={styles.container}>
      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* App Icon and Title Section */}
        <View style={styles.appHeader}>
          <View style={styles.titleRow}>
            <Image
              source={{uri: envConfig?.getLogo}}
              style={styles.mobileAppIcon}
            />

            <View style={styles.titleContainer}>
              <Text style={styles.appTitle}>{envConfig.getChannelId}</Text>
              <View style={styles.developerInfo}>
                <Text style={styles.developerName}>
                  {envConfig.getChannelId}
                </Text>
              </View>
              <Text style={styles.appType}>Pembelian dalam aplikasi</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsScrollView}
            contentContainerStyle={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statInner}>
                <Text style={styles.statValue}>4.9</Text>
                <StarIcon size={14} color="rgb(32,33,36)" />
              </View>
              <Text style={styles.statLabel}>99,4 jt ulasan</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3.39M +</Text>
              <Text style={styles.statLabel}>Download</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Image
                source={require('../static/18.png')}
                style={styles.ratingIcon}
              />
              <Text style={styles.statLabel}>Rating 18+</Text>
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <DownloadButton />
            <View style={styles.actionButtons}>
              <NativeTouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}>
                <ShareIcon width={24} height={24} />
                <Text style={styles.actionButtonText}>Bagikan</Text>
              </NativeTouchableOpacity>
              <NativeTouchableOpacity
                style={styles.actionButton}
                onPress={handleWishlist}>
                {/* <Text style={styles.actionButtonIcon}>➕</Text> */}
                <BookMarkIcon size={24} />
                <Text style={styles.actionButtonText}>
                  Tambahkan ke wishlist
                </Text>
              </NativeTouchableOpacity>
            </View>
          </View>
        </View>

        {/* Screenshots Section */}
        <View style={styles.screenshotsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.screenshotsContainer}
            decelerationRate="fast"
            pagingEnabled={false}>
            {screenshots.map((screenshot, index) => (
              <View key={index} style={styles.screenshotItem}>
                <Image
                  source={screenshot}
                  style={styles.screenshot}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* About Game Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tentang game ini</Text>
            <NativeTouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionIcon}>→</Text>
            </NativeTouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>
            {envConfig.getChannelId} mengundang Anda untuk bergabung dalam
            pengalaman permainan kasino seluler terbesar di Indonesia! Dengan
            lebih dari 100 permainan slot,unduh sekarang untuk mendapatkan bonus
            chip gratis senilai Rp777!
          </Text>
          <Text style={styles.sectionContent}>
            Nikmati berbagai macam permainan kasino 777 terpopuler di
            {envConfig.getChannelId},mulai dari slot terbaru,Texas
            Hold'em,Roulette,Baccarat hingga Memancing,untuk memenuhi kebutuhan
            semua jenis pemain.
          </Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Diupdate pada</Text>
              <Text style={styles.infoValue}>12 Feb 2025</Text>
            </View>
          </View>
          <View style={styles.tagsContainer}>
            <NativeTouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>slot</Text>
            </NativeTouchableOpacity>
            <NativeTouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>777</Text>
            </NativeTouchableOpacity>
            <NativeTouchableOpacity style={styles.tag}>
              <Text style={styles.tagText}>Casino</Text>
            </NativeTouchableOpacity>
          </View>
        </View>

        {/* Data Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Keamanan Data</Text>
            <NativeTouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionIcon}>→</Text>
            </NativeTouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>
            Keamanan dimulai dengan memahami cara developer mengumpulkan dan
            membagikan data Anda. Praktik privasi dan keamanan data dapat
            bervariasi berdasarkan penggunaan, wilayah, dan usia Anda. Developer
            memberikan informasi ini dan dapat memperbaruinya seiring waktu.
          </Text>
          <View style={styles.securityCard}>
            <View style={styles.securityItem}>
              <Image
                source={require('../static/unnamed.webp')}
                style={styles.securityIcon}
              />
              <View style={styles.securityContent}>
                <Text style={styles.securityText}>
                  Tidak ada data yang dibagikan kepada pihak ketiga
                </Text>
                <Text style={styles.securitySubtext}>
                  Pelajari lebih lanjut cara developer menyatakan pembagian data
                </Text>
              </View>
            </View>
            <View style={styles.securityItem}>
              <Image
                source={require('../static/unnamed1.webp')}
                style={styles.securityIcon}
              />
              <View style={styles.securityContent}>
                <Text style={styles.securityText}>
                  Aplikasi ini dapat mengumpulkan jenis data berikut
                </Text>
                <Text style={styles.securitySubtext}>
                  Lokasi, Info pribadi, dan 6 lainnya
                </Text>
              </View>
            </View>
            <View style={styles.securityItem}>
              <Image
                source={require('../static/unnamed2.webp')}
                style={styles.securityIcon}
              />
              <Text style={styles.securityText}>
                Data dienkripsi saat dalam pengiriman
              </Text>
            </View>
            <View style={styles.securityItem}>
              <Image
                source={require('../static/unnamed3.webp')}
                style={styles.securityIcon}
              />
              <Text style={styles.securityText}>
                Anda dapat meminta agar data dihapus
              </Text>
            </View>
            <NativeTouchableOpacity style={styles.detailButton}>
              <Text style={styles.detailButtonText}>Lihat detail</Text>
            </NativeTouchableOpacity>
          </View>
        </View>

        {/* Ratings and Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rating dan ulasan</Text>
            <NativeTouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionIcon}>→</Text>
            </NativeTouchableOpacity>
          </View>
          <View style={styles.deviceFilters}>
            <NativeTouchableOpacity
              style={[
                styles.deviceFilter,
                selectedDevice === 'Ponsel' && styles.deviceFilterActive,
              ]}
              onPress={() => setSelectedDevice('Ponsel')}>
              <Text style={styles.deviceFilterIcon}>📱</Text>
              <Text
                style={[
                  styles.deviceFilterText,
                  selectedDevice === 'Ponsel' && styles.deviceFilterTextActive,
                ]}>
                Ponsel
              </Text>
            </NativeTouchableOpacity>
            <NativeTouchableOpacity
              style={[
                styles.deviceFilter,
                selectedDevice === 'Tablet' && styles.deviceFilterActive,
              ]}
              onPress={() => setSelectedDevice('Tablet')}>
              <Text style={styles.deviceFilterIcon}>📱</Text>
              <Text
                style={[
                  styles.deviceFilterText,
                  selectedDevice === 'Tablet' && styles.deviceFilterTextActive,
                ]}>
                Tablet
              </Text>
            </NativeTouchableOpacity>
            <NativeTouchableOpacity
              style={[
                styles.deviceFilter,
                selectedDevice === 'Chromebook' && styles.deviceFilterActive,
              ]}
              onPress={() => setSelectedDevice('Chromebook')}>
              <Text style={styles.deviceFilterIcon}>💻</Text>
              <Text
                style={[
                  styles.deviceFilterText,
                  selectedDevice === 'Chromebook' &&
                    styles.deviceFilterTextActive,
                ]}>
                Chromebook
              </Text>
            </NativeTouchableOpacity>
          </View>
          <View style={styles.ratingOverview}>
            <View style={styles.ratingLeft}>
              <Text style={styles.ratingValue}>4.9</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star, index, arr) => {
                  return index !== arr.length - 1 ? (
                    <StarIcon size={20} key={index} />
                  ) : (
                    <StarHalfIcon size={20} key={index} />
                  );
                })}
              </View>
              <Text style={styles.ratingCount}>99,4 jt ulasan</Text>
            </View>
            <View style={styles.ratingRight}>
              {[5, 4, 3, 2, 1].map(rating => (
                <View key={rating} style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarLabel}>{rating}</Text>
                  <View style={styles.ratingBar}>
                    <View
                      style={[
                        styles.ratingBarFill,
                        {
                          width:
                            rating === 5 ? '90%' : rating === 4 ? '10%' : '0%',
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAuthor}>
                <Image
                  source={require('../static/avtar.webp')}
                  style={styles.reviewAvatar}
                />
                <Text style={styles.reviewAuthorName}>Adri Viljoen</Text>
              </View>
              <NativeTouchableOpacity style={styles.reviewMore}>
                <Text style={styles.reviewMoreIcon}>⋮</Text>
              </NativeTouchableOpacity>
            </View>
            <View style={styles.reviewRating}>
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon size={16} key={star} />
              ))}
              <Text style={styles.reviewDate}>28 Mei 2025</Text>
            </View>
            <Text style={styles.reviewText}>
              {envConfig.getChannelId} GAME KEREN! - Banyak pilihan mesin slot
              beruntung dengan hadiah gila-gilaan! Udah main berjam-jam nggak
              berhenti, wajib dicoba! 💯🔥
            </Text>
            <Text style={styles.reviewHelpful}>
              3.528 orang merasa ulasan ini berguna
            </Text>
            <View style={styles.reviewFooter}>
              <Text style={styles.reviewFooterText}>
                Apakah konten ini berguna bagi Anda?
              </Text>
              <View style={styles.reviewButtons}>
                <NativeTouchableOpacity style={styles.reviewButton}>
                  <Text style={styles.reviewButtonText}>Ya</Text>
                </NativeTouchableOpacity>
                <NativeTouchableOpacity style={styles.reviewButton}>
                  <Text style={styles.reviewButtonText}>Tidak</Text>
                </NativeTouchableOpacity>
              </View>
            </View>
          </View>
          <NativeTouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>Lihat semua ulasan</Text>
          </NativeTouchableOpacity>
        </View>

        {/* Popular Games Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Permainan Slot Populer</Text>
            <NativeTouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionIcon}>→</Text>
            </NativeTouchableOpacity>
          </View>
          <View style={styles.gamesGrid}>
            {popularGames.map((game, index) => (
              <NativeTouchableOpacity key={index} style={styles.gameItem}>
                <Image source={game.icon} style={styles.gameIcon} />
                <View style={styles.gameInfo}>
                  <Text style={styles.gameName} numberOfLines={1}>
                    {game.name}
                  </Text>
                  <Text style={styles.gameDeveloper} numberOfLines={1}>
                    {envConfig.getChannelId}
                  </Text>
                  <View style={styles.gameRating}>
                    <Text style={styles.gameRatingText}>{game.rating}</Text>
                    <StarIcon size={12} color="rgb(32,33,36)" />
                  </View>
                </View>
              </NativeTouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  appHeader: {
    marginBottom: 24,
  },
  mobileAppIcon: {
    width: 72,
    height: 72,
    borderRadius: 14,
    marginRight: 24,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  appInfo: {
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: 'rgb(32,33,36)',
    marginBottom: 8,
    lineHeight: 32,
  },
  developerInfo: {
    marginBottom: 4,
    marginTop: 8,
  },
  developerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#01875f',
    letterSpacing: 0.00625,
  },
  appType: {
    fontSize: 12,
    color: 'rgb(95,99,104)',
    letterSpacing: 0.5,
  },
  statsScrollView: {
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  statItem: {
    minWidth: 96,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  statInner: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgb(32,33,36)',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgb(95,99,104)',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(5,5,5,0.06)',
    marginHorizontal: 0,
  },
  ratingIcon: {
    width: 22,
    height: 16,
    marginBottom: 4,
  },
  star: {
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 24,
    flexWrap: 'wrap',
  },
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
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.00625,
  },
  actionButtons: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 64,
  },
  actionButtonIcon: {
    fontSize: 24,
    color: '#01875f',
    marginRight: 8,
  },
  actionButtonText: {
    color: '#01875f',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  screenshotsSection: {
    // marginBottom: 24,
  },
  screenshotsContainer: {
    paddingHorizontal: 0,
    // paddingRight: 24,
  },
  screenshotItem: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  screenshot: {
    height: 204,
    width: 92,
    borderRadius: 12,
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  section: {
    marginBottom: 24,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: 'rgb(32,33,36)',
    marginRight: 16,
  },
  sectionAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -12,
  },
  sectionActionIcon: {
    fontSize: 24,
    color: 'rgb(95,99,104)',
  },
  sectionContent: {
    fontSize: 14,
    color: 'rgb(95,99,104)',
    lineHeight: 20,
    letterSpacing: 0.01428571743,
    marginBottom: 12,
  },
  infoRow: {
    marginTop: 24,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgb(32,33,36)',
    letterSpacing: 0.0178571429,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: 'rgb(95,99,104)',
    letterSpacing: 0.01428571743,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  tag: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgb(218,220,224)',
    backgroundColor: 'transparent',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginRight: 12,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgb(95,99,104)',
  },
  securityCard: {
    marginTop: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgb(218,220,224)',
    padding: 20,
    paddingTop: 30,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  securityIcon: {
    width: 20,
    height: 20,
    marginRight: 20,
    marginTop: 2,
  },
  securityContent: {
    flex: 1,
  },
  securityText: {
    fontSize: 14,
    color: 'rgb(32,33,36)',
    lineHeight: 20,
  },
  securitySubtext: {
    fontSize: 12,
    color: 'rgb(95,99,104)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  detailButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#01875f',
  },
  deviceFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  deviceFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgb(218,220,224)',
    backgroundColor: 'transparent',
    marginBottom: 16,
    marginRight: 12,
  },
  deviceFilterActive: {
    borderWidth: 1,
    backgroundColor: '#e8f3ef',
    borderColor: 'transparent',
  },
  deviceFilterIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  deviceFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgb(95,99,104)',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  deviceFilterTextActive: {
    color: '#056449',
  },
  ratingOverview: {
    flexDirection: 'row',
    paddingVertical: 16,
    gap: 24,
  },
  ratingLeft: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 56,
    fontWeight: 'normal',
    color: 'rgb(32,33,36)',
    lineHeight: 64,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  starFull: {
    fontSize: 16,
    color: '#01875f',
  },
  ratingCount: {
    fontSize: 12,
    color: 'rgb(95,99,104)',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  ratingRight: {
    flex: 1,
    gap: 8,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingBarLabel: {
    fontSize: 12,
    color: 'rgb(95,99,104)',
    letterSpacing: 0.5,
    width: 16,
    textAlign: 'right',
  },
  ratingBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgb(232,234,237)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#01875f',
    borderRadius: 5,
  },
  reviewCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(232,234,237)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  reviewAuthorName: {
    fontSize: 14,
    color: 'rgb(32,33,36)',
    letterSpacing: 0.0142857143,
  },
  reviewMore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewMoreIcon: {
    fontSize: 24,
    color: 'rgb(95,99,104)',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  reviewStar: {
    fontSize: 12,
    color: '#01875f',
  },
  reviewDate: {
    fontSize: 12,
    color: 'rgb(95,99,104)',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  reviewText: {
    fontSize: 14,
    color: 'rgb(32,33,36)',
    lineHeight: 20,
    letterSpacing: 0.0142857143,
    marginTop: 8,
  },
  reviewHelpful: {
    fontSize: 12,
    color: 'rgb(95,99,104)',
    letterSpacing: 0.5,
    marginTop: 16,
  },
  reviewFooter: {
    marginTop: 12,
  },
  reviewFooterText: {
    fontSize: 12,
    color: 'rgb(95,99,104)',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  reviewButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgb(218,220,224)',
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgb(95,99,104)',
  },
  viewAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#01875f',
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gameItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    backgroundColor: 'transparent',
    marginRight: '2%',
    marginBottom: 12,
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  gameInfo: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 56,
  },
  gameName: {
    fontSize: 14,
    fontWeight: 'normal',
    color: 'rgb(32,33,36)',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  gameDeveloper: {
    fontSize: 12,
    color: 'rgb(32,33,36)',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  gameRating: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 2,
  },
  gameRatingText: {
    fontSize: 12,
    color: 'rgb(32,33,36)',
    letterSpacing: 0.2,
  },
  gameRatingStar: {
    fontSize: 12,
  },
});

export default AppDetailContent;
