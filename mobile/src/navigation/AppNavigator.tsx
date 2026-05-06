import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { UserProfile } from '../types/api';
import { HomeScreen } from '../screens/HomeScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type RootStackParamList = {
  Home: undefined;
  OrderDetail: { orderId: string };
  Profile: undefined;
};

interface AppNavigatorProps {
  token: string;
  user: UserProfile;
  onLogout: () => void;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator({ token, user, onLogout }: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          options={{ title: 'Pedidos' }}
        >
          {() => <HomeScreen token={token} user={user} onLogout={onLogout} />}
        </Stack.Screen>
        <Stack.Screen
          name="OrderDetail"
          options={{ title: 'Detalle del pedido' }}
        >
          {({ route }) => (
            <OrderDetailScreen token={token} user={user} orderId={route.params.orderId} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Profile"
          options={{ title: 'Mi perfil' }}
        >
          {() => <ProfileScreen user={user} onLogout={onLogout} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

