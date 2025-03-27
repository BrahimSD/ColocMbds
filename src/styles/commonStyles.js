import { Platform, StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    minHeight: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 10,
    marginLeft: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: '#4C86F9',
  },
  placeholder: {
    width: 40,
  },
});

export default commonStyles; 