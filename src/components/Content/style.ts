import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  contentBox: {
    flex: 1,
  },

  lockNameText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333333',
  },
  manualRow: {
    paddingHorizontal: 28,
    marginVertical: 20,
  },
  manualBtn: {
    alignItems: 'center',
  },
  manualIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  manualText: {
    fontSize: 12,
    color: '#333333',
  },
  cardsRow: {
    paddingHorizontal: 16,
    gap: 6,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mapCard: {
    marginRight: 4,
  },
  cardHeader: {
    margin: 12,
  },
  mapPreview: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  contentLeftBox: {
    width: 165,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  singleHeight: {
    height: 130,
  },
  multipleHeight: {
    height: 172,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333333',
  },
  cardSubTitle: {
    fontSize: 12,
    color: '#666666',
  },
  groupListBox: {
    marginTop: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingVertical: 23,
    paddingHorizontal: 12,
  },
  groupItem: {
    width: '100%',
  },
  groupItemImage: {
    width: 20,
    height: 20,
  },
  groupItemLockName: {
    fontWeight: '400',
    fontSize: 12,
    color: '#999999',
    marginLeft: 8,
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: '0 0 8 8',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 12,
    color: '#333333',
  },
  entryList: {
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  entryItem: {
    flex: 1,
    paddingVertical: 4,
  },
  entryText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '400',
    color: '#333333',
  },
});
