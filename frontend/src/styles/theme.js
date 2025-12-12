import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E7D32', // Green for agriculture
    secondary: '#4CAF50',
    accent: '#8BC34A',
    background: '#F1F8E9',
    surface: '#FFFFFF',
    text: '#1B5E20',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    success: '#4CAF50',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontSize: 16,
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontSize: 18,
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontSize: 20,
      fontWeight: 'bold',
    },
  },
};

export const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: 10,
    padding: 15,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  button: {
    marginVertical: 10,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginVertical: 20,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
    marginVertical: 10,
  },
  farmerfriendly: {
    padding: 20,
    minHeight: 60, // Larger touch targets
    justifyContent: 'center',
    alignItems: 'center',
  },
};