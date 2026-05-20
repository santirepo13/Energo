import { StyleSheet } from 'react-native';

const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: '7%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    paddingLeft: 100,
    textAlign: 'left',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#fff',
    paddingTop: 90,
    paddingHorizontal: 16,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sidebarUserContainer: {
    backgroundColor: '#1B5E20',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  sidebarUser: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  sidebarPaused: {
    fontSize: 14,
    color: '#ffeb3b',
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  statusActive: {
    color: '#4caf50',
  },
  statusWarning: {
    color: '#ff9800',
  },
  statusError: {
    color: '#f44336',
  },
  scrollView: {
    flex: 1,
  },
});

export default layoutStyles;