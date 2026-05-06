import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchOrders } from '../services/orders';
import type { OrderItem, UserProfile } from '../types/api';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface HomeScreenProps {
  token: string;
  user: UserProfile;
  onLogout: () => void;
}

export function HomeScreen({ token, user, onLogout }: HomeScreenProps) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const load = async (options?: { isRefresh?: boolean; silent?: boolean }) => {
    const isRefresh = Boolean(options?.isRefresh);
    const silent = Boolean(options?.silent);

    if (isRefresh) setRefreshing(true);
    else if (!silent) setLoading(true);

    setError(null);
    try {
      const data = await fetchOrders(token, user.id);
      setOrders(data);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No fue posible cargar pedidos';
      setError(message);
      if (!silent) {
        setOrders([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load({ silent: true });
    }, []),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'FastDelivery',
      headerLeft: () => (
        <Pressable
          style={[styles.menuTrigger, styles.menuTriggerLeft]}
          hitSlop={10}
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={styles.menuTriggerText}>☰</Text>
        </Pressable>
      ),
      headerRight: () => null,
    });
  }, [navigation]);

  const formatStatus = (status: string) => status.replaceAll('_', ' ');

  const getStatusChipStyle = (status: string) => {
    switch (status) {
      case 'EN_CAMINO':
        return styles.statusChipInfo;
      case 'PENDIENTE':
        return styles.statusChipWarning;
      case 'ENTREGADO':
        return styles.statusChipSuccess;
      case 'CANCELADO':
        return styles.statusChipDanger;
      default:
        return styles.statusChipDefault;
    }
  };

  const getStatusChipTextStyle = (status: string) => {
    switch (status) {
      case 'EN_CAMINO':
        return styles.statusTextInfo;
      case 'PENDIENTE':
        return styles.statusTextWarning;
      case 'ENTREGADO':
        return styles.statusTextSuccess;
      case 'CANCELADO':
        return styles.statusTextDanger;
      default:
        return styles.statusTextDefault;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hola, {user.nombre}</Text>
        <Text style={styles.subtitle}>{user.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Pedidos asignados</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.hint}>Consultando pedidos...</Text>
        </View>
      ) : error ? (
        <View style={styles.card}>
          <Text style={styles.errorTitle}>Aun no se pudieron cargar pedidos</Text>
          <Text style={styles.errorBody}>
            {error}
            {'\n\n'}
            Si todavia no implementaste `/orders`, esta vista quedara lista para usar cuando el
            endpoint exista.
          </Text>
          <Pressable style={styles.retry} onPress={() => void load()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void load({ isRefresh: true })} />
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>Aun no tienes pedidos asignados</Text>
              <Text style={styles.emptyStateBody}>
                Cuando el admin te asigne pedidos apareceran aqui. Mientras tanto puedes recargar
                manualmente.
              </Text>
              <Pressable style={styles.retry} onPress={() => void load()}>
                <Text style={styles.retryText}>Recargar pedidos</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('OrderDetail', { orderId: String(item.id) })}
            >
              <View style={styles.orderTopRow}>
                <Text style={styles.orderId}>Pedido #{item.id}</Text>
                <View style={[styles.statusChipBase, getStatusChipStyle(item.estado)]}>
                  <Text style={[styles.statusChipText, getStatusChipTextStyle(item.estado)]}>
                    {formatStatus(item.estado)}
                  </Text>
                </View>
              </View>
              {item.customer ? (
                <Text style={styles.orderNote}>
                  Cliente: {item.customer.nombre} - {item.customer.direccionEntrega}
                </Text>
              ) : null}
              {item.notasPedido ? <Text style={styles.orderNote}>{item.notasPedido}</Text> : null}
              <View style={styles.actions}>
                <View style={styles.actionButtonSecondary}>
                  <Text style={styles.actionButtonSecondaryText}>Ver detalle</Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}

      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.overlayRoot}>
          <View
            style={[
              styles.drawer,
              {
                marginTop: 0,
                marginBottom: 0,
              },
            ]}
          >
            <View
              style={[
                styles.drawerContent,
                {
                  paddingTop: Math.max(insets.top, 12) + 14,
                  paddingBottom: Math.max(insets.bottom, 12),
                },
              ]}
            >
              <Text style={styles.drawerTitle}>Menu</Text>
              <Pressable
                style={styles.drawerItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  navigation.navigate('Profile');
                }}
              >
                <Text style={styles.drawerItemText}>Ver perfil</Text>
              </Pressable>
              <Pressable
                style={[styles.drawerItem, styles.drawerItemDanger]}
                onPress={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
              >
                <Text style={[styles.drawerItemText, styles.drawerItemTextDanger]}>Cerrar sesion</Text>
              </Pressable>
            </View>
          </View>
          <Pressable style={styles.overlayBackdrop} onPress={() => setIsMenuOpen(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f7fb',
  },
  header: {
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#101828',
  },
  subtitle: {
    color: '#475467',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 10,
    color: '#101828',
  },
  menuTrigger: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTriggerLeft: {
    marginLeft: 6,
  },
  menuTriggerText: {
    color: '#475467',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hint: {
    color: '#667085',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eaecf0',
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontWeight: '700',
    color: '#101828',
    fontSize: 22,
  },
  statusChipBase: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusChipInfo: {
    backgroundColor: '#dbeafe',
  },
  statusChipWarning: {
    backgroundColor: '#fef3c7',
  },
  statusChipSuccess: {
    backgroundColor: '#dcfce7',
  },
  statusChipDanger: {
    backgroundColor: '#fee2e2',
  },
  statusChipDefault: {
    backgroundColor: '#e5e7eb',
  },
  statusTextInfo: {
    color: '#1e40af',
  },
  statusTextWarning: {
    color: '#92400e',
  },
  statusTextSuccess: {
    color: '#166534',
  },
  statusTextDanger: {
    color: '#b91c1c',
  },
  statusTextDefault: {
    color: '#374151',
  },
  orderNote: {
    marginTop: 8,
    color: '#475467',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
    alignSelf: 'stretch',
  },
  actionButtonSecondary: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  actionButtonSecondaryText: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#b42318',
    fontWeight: '700',
  },
  errorBody: {
    marginTop: 6,
    color: '#475467',
    lineHeight: 20,
  },
  retry: {
    marginTop: 12,
    backgroundColor: '#155eef',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eaecf0',
  },
  emptyStateTitle: {
    color: '#101828',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyStateBody: {
    marginTop: 6,
    color: '#475467',
    lineHeight: 20,
  },
  overlayRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.2)',
  },
  drawer: {
    width: 260,
    backgroundColor: '#f5f7fb',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 14,
    gap: 8,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  drawerItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  drawerItemDanger: {
    backgroundColor: '#fff1f2',
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  drawerItemTextDanger: {
    color: '#be123c',
  },
});
