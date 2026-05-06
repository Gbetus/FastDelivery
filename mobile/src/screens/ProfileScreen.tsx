import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { UserProfile } from '../types/api';

interface ProfileScreenProps {
  user: UserProfile;
  onLogout: () => void;
}

export function ProfileScreen({ user, onLogout }: ProfileScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Perfil del repartidor</Text>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{user.nombre}</Text>

        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>ID</Text>
        <Text style={styles.value}>{user.id}</Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eaecf0',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 8,
  },
  label: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#475467',
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 2,
    fontSize: 16,
    color: '#111827',
  },
  logoutButton: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#be123c',
    fontWeight: '700',
    fontSize: 15,
  },
});
