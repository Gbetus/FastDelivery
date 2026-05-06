import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface LoginScreenProps {
  loading: boolean;
  error: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function LoginScreen({ loading, error, onSubmit }: LoginScreenProps) {
  const [email, setEmail] = useState('repartidor@fastdelivery.local');
  const [password, setPassword] = useState('RepartidorPassword');
  const [showPassword, setShowPassword] = useState(false);

  const disabled = loading || !email.trim() || !password;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FastDelivery</Text>
      <Text style={styles.subtitle}>Inicia sesion para gestionar entregas</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Correo</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="repartidor@fastdelivery.local"
          style={styles.input}
        />

        <Text style={styles.label}>Contrasena</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            style={[styles.input, styles.passwordInput]}
          />
          <Pressable
            onPress={() => setShowPassword((current) => !current)}
            style={styles.passwordToggle}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ocultar contrasena' : 'Ver contrasena'}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#155eef"
            />
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, disabled && styles.buttonDisabled]}
          disabled={disabled}
          onPress={() => {
            void onSubmit(email.trim(), password);
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f5f7fb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#101828',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 24,
    color: '#475467',
    fontSize: 14,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  label: {
    fontSize: 13,
    color: '#344054',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordInput: {
    flex: 1,
  },
  passwordToggle: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: 10,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#155eef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  error: {
    color: '#b42318',
    fontSize: 13,
  },
});
