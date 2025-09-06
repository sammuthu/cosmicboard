import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';

// Custom cosmic theme
const CosmicTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4A90E2',
    primaryContainer: '#1E3A8A',
    secondary: '#7C3AED',
    secondaryContainer: '#581C87',
    tertiary: '#EC4899',
    tertiaryContainer: '#BE185D',
    surface: '#0F172A',
    surfaceVariant: '#1E293B',
    surfaceContainer: '#334155',
    background: '#020817',
    outline: '#475569',
    outlineVariant: '#334155',
  },
};

const LightCosmicTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4A90E2',
    primaryContainer: '#DBEAFE',
    secondary: '#7C3AED',
    secondaryContainer: '#EDE9FE',
    tertiary: '#EC4899',
    tertiaryContainer: '#FCE7F3',
    surface: '#FFFFFF',
    surfaceVariant: '#F8FAFC',
    surfaceContainer: '#F1F5F9',
    background: '#FAFAFA',
    outline: '#64748B',
    outlineVariant: '#CBD5E1',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? CosmicTheme : LightCosmicTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="project-detail" 
            options={{ 
              title: 'Project Details',
              presentation: 'modal',
            }} 
          />
          <Stack.Screen 
            name="media-viewer" 
            options={{ 
              title: 'Media Viewer',
              presentation: 'modal',
            }} 
          />
          <Stack.Screen 
            name="camera" 
            options={{ 
              title: 'Capture Photo',
              presentation: 'modal',
            }} 
          />
        </Stack>
        <Toast />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}