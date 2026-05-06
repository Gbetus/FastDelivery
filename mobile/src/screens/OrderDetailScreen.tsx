import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Pressable, Modal } from 'react-native';
import { fetchOrderHistory, updateOrderStatus } from '../services/orders';
import type { OrderHistoryResponse, OrderStatus, UserProfile } from '../types/api';

interface OrderDetailScreenProps {
  token: string;
  user: UserProfile;
  orderId: string;
}

export function OrderDetailScreen({ token, orderId }: OrderDetailScreenProps) {
  const [data, setData] = useState<OrderHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrderHistory(token, orderId);
      setData(res);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No fue posible cargar el detalle';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const changeStatus = async (status: OrderStatus) => {
    setUpdating(true);
    setError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Permiso de ubicacion denegado');
      }
      const coords = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      await updateOrderStatus(token, orderId, {
        status,
        lat: coords.coords.latitude,
        lng: coords.coords.longitude,
      });

      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No fue posible actualizar estado';
      setError(message);
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_CAMINO', label: 'En camino' },
    { value: 'ENTREGADO', label: 'Entregado' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ];

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return styles.badgePending;
      case 'EN_CAMINO':
        return styles.badgeInProgress;
      case 'ENTREGADO':
        return styles.badgeDelivered;
      case 'CANCELADO':
        return styles.badgeCanceled;
      default:
        return styles.badgePending;
    }
  };

  const getStatusBadgeTextStyle = (status: OrderStatus) => {
    switch (status) {
      case 'PENDIENTE':
        return styles.badgeTextPending;
      case 'EN_CAMINO':
        return styles.badgeTextInProgress;
      case 'ENTREGADO':
        return styles.badgeTextDelivered;
      case 'CANCELADO':
        return styles.badgeTextCanceled;
      default:
        return styles.badgeTextPending;
    }
  };

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.hint}>Cargando pedido...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error ?? 'No se encontró el pedido'}</Text>
      </View>
    );
  }

  const { order, events } = data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Pedido #{order.id}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.status}>Estado actual:</Text>
          <View style={[styles.badgeBase, getStatusBadgeStyle(order.estado)]}>
            <Text style={[styles.badgeTextBase, getStatusBadgeTextStyle(order.estado)]}>
              {order.estado.replaceAll('_', ' ')}
            </Text>
          </View>
        </View>
        {order.customer ? (
          <>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{order.customer.nombre}</Text>
            <Text style={styles.value}>{order.customer.direccionEntrega}</Text>
            {order.customer.telefono ? (
              <Text style={styles.value}>Tel: {order.customer.telefono}</Text>
            ) : null}
          </>
        ) : null}
        {order.notasPedido ? (
          <>
            <Text style={styles.label}>Notas</Text>
            <Text style={styles.value}>{order.notasPedido}</Text>
          </>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cambiar estado</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.buttonPrimary} disabled={updating} onPress={() => setStatusModalOpen(true)}>
          <Text style={styles.buttonPrimaryText}>Seleccionar estado</Text>
        </Pressable>
        {updating ? <ActivityIndicator style={{ marginTop: 8 }} /> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Historial</Text>
        {events.length === 0 ? (
          <Text style={styles.hint}>Sin movimientos registrados aún.</Text>
        ) : (
          events.map((evt, idx) => (
            <View key={`${evt.timestamp}-${idx}`} style={styles.eventRow}>
              <Text style={styles.eventText}>
                {`${evt.previousStatus} -> ${evt.newStatus}`}
              </Text>
              <Text style={styles.eventSub}>
                {`${new Date(evt.timestamp).toLocaleString()} (${evt.location.lat.toFixed(
                  4,
                )}, ${evt.location.lng.toFixed(4)})`}
              </Text>
            </View>
          ))
        )}
      </View>

      <Modal
        visible={statusModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModalOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setStatusModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Selecciona un estado</Text>
            <View style={styles.modalOptions}>
              {statusOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[styles.modalOption, option.value === order.estado && styles.modalOptionDisabled]}
                  disabled={updating || option.value === order.estado}
                  onPress={() => {
                    setStatusModalOpen(false);
                    void changeStatus(option.value);
                  }}
                >
                  <View style={[styles.badgeBase, getStatusBadgeStyle(option.value)]}>
                    <Text style={[styles.badgeTextBase, getStatusBadgeTextStyle(option.value)]}>
                      {option.label}
                    </Text>
                  </View>
                  {option.value === order.estado ? (
                    <Text style={styles.currentStatusText}>Actual</Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eaecf0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 4,
  },
  status: {
    color: '#344054',
  },
  statusRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  label: {
    marginTop: 8,
    fontWeight: '700',
    color: '#101828',
  },
  value: {
    color: '#475467',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  buttonPrimary: {
    backgroundColor: '#155eef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  eventRow: {
    marginTop: 6,
  },
  eventText: {
    color: '#101828',
    fontWeight: '600',
  },
  eventSub: {
    color: '#667085',
    fontSize: 12,
  },
  hint: {
    color: '#667085',
  },
  error: {
    color: '#b42318',
  },
  badgeBase: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeTextBase: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgePending: {
    backgroundColor: '#fef3c7',
  },
  badgeInProgress: {
    backgroundColor: '#dbeafe',
  },
  badgeDelivered: {
    backgroundColor: '#dcfce7',
  },
  badgeCanceled: {
    backgroundColor: '#fee2e2',
  },
  badgeTextPending: {
    color: '#92400e',
  },
  badgeTextInProgress: {
    color: '#1e40af',
  },
  badgeTextDelivered: {
    color: '#166534',
  },
  badgeTextCanceled: {
    color: '#b91c1c',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eaecf0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 12,
  },
  modalOptions: {
    gap: 8,
  },
  modalOption: {
    borderWidth: 1,
    borderColor: '#eaecf0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionDisabled: {
    backgroundColor: '#f8fafc',
  },
  currentStatusText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '600',
  },
});

