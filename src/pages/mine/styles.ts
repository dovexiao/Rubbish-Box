import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  contentBox: {
    flexGrow: 1,
    width: '100%',
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 80,
    alignItems: 'center',
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#F2F2F2',
  },

  name: {
    marginTop: 12,
    marginBottom: 18,
    width: '100%',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
  darkName: {
    color: '#FFFFFF',
  },
  lightName: {
    color: '#333333',
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  memberRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },

  memberTextBox: {
    flex: 1,
    marginLeft: 12,
  },

  memberTitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },

  memberDesc: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: '#C6C9D1',
  },

  listBox: {
    width: '100%',
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  listItem: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  listLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },

  logoutBox: {
    width: '100%',
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
});

export default styles;
