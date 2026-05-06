import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { LoginScreen } from './src/screens/LoginScreen';
import { fetchMe, login } from './src/services/auth';
import type { UserProfile } from './src/types/api';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const auth = await login({ email, password });
      const profile = await fetchMe(auth.access_token);
      setToken(auth.access_token);
      setUser(profile);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo iniciar sesion';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setError(null);
  };

  if (loading && !isAuthenticated) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text style={styles.subtitle}>Conectando con FastDelivery...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {isAuthenticated ? (
          <AppNavigator token={token!} user={user!} onLogout={handleLogout} />
        ) : (
          <SafeAreaView style={styles.container}>
            <LoginScreen onSubmit={handleLogin} loading={loading} error={error} />
          </SafeAreaView>
        )}
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f7fb',
  },
  subtitle: {
    color: '#475467',
  },
});
