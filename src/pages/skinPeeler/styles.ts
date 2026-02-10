import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    width: '100%',
  },
  themeList: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeItem: {
    width: '50%',
    marginBottom: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  themeCard: {
    width: '100%',
    height: 165,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F6F7FA',
  },
  themeImage: {
    width: '100%',
    height: '100%',
  },
  themeInfo: {
    width: '100%',
    marginTop: 12,
    alignItems: 'center',
  },
  currentButton: {
    width: 56,
    height: 30,
    borderRadius: 12,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchButton: {
    width: 56,
    height: 30,
    borderRadius: 12,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 17,
  },
});

export default styles;
