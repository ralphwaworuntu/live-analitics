import 'expo-task-manager';
import { TaskManager } from 'expo-location';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TacticalHUD } from './src/components/TacticalHUD';
import { useAppStore } from './src/store';

const BACKGROUND_TRACKING_TASK = 'BACKGROUND_TRACKING_TASK';

TaskManager.defineTask(BACKGROUND_TRACKING_TASK, ({ data, error }) => {
  if (error) {
    console.error('[TASK] Background tracking error:', error);
    return;
  }
  if (data) {
    const { location } = data as { location: any };
    console.log('[TASK] Background location:', location);
  }
});

type RootStackParamList = {
  Home: undefined;
  Briefing: undefined;
  ShiftReview: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeScreen() {
  const missionStatus = useAppStore((s) => s.missionStatus);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <TacticalHUD isConnected={true} />
        <View style={styles.content}>
          <Text style={styles.statusText}>Mission Status: {missionStatus}</Text>
          <Text style={styles.welcomeText}>Selamat datang di SENTINEL</Text>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1a1a2e' },
            headerTintColor: '#00ff88',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ 
              title: 'SENTINEL',
              headerStyle: { backgroundColor: '#1a1a2e' },
              headerTintColor: '#00ff88',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  welcomeText: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
});