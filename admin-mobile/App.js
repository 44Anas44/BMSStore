import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Feather } from '@expo/vector-icons'
import { COLORS, BRAND } from './src/config'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform, Alert } from 'react-native'
import { adminApi } from './src/lib/api'

import DashboardScreen   from './src/screens/DashboardScreen'
import ProductsScreen    from './src/screens/ProductsScreen'
import ProductFormScreen from './src/screens/ProductFormScreen'
import OrdersScreen      from './src/screens/OrdersScreen'
import CategoriesScreen  from './src/screens/CategoriesScreen'
import SlidesScreen      from './src/screens/SlidesScreen'
import BrandsScreen      from './src/screens/BrandsScreen'
import SecondHandScreen  from './src/screens/SecondHandScreen'
import DiagnosticsScreen from './src/screens/DiagnosticsScreen'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true,
  }),
})

async function registerForPushNotifications() {
  if (!Device.isDevice) return null
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') return null
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('admin-alerts', {
      name: 'Admin Alerts', importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250], lightColor: '#f8f8f4',
    })
  }
  const token = (await Notifications.getExpoPushTokenAsync()).data
  return token
}

const Tab   = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function ProductsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductsList" component={ProductsScreen}/>
      <Stack.Screen name="ProductForm"  component={ProductFormScreen}/>
    </Stack.Navigator>
  )
}

export default function App() {
  React.useEffect(() => {
    registerForPushNotifications().then(token => {
      if (token) adminApi.registerPushToken(token).catch(() => {})
    }).catch(() => {})
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data
      // Navigate based on notification type (future enhancement)
      console.log('Notification tapped:', data)
    })
    return () => sub.remove()
  }, [])

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={COLORS.primary}/>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.secondary,
            headerTitleStyle: { fontWeight: '700' },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: '#aaa',
            tabBarStyle: { borderTopColor: '#eee', height: 60, paddingBottom: 8 },
            tabBarIcon: ({ color, size }) => {
              const icons = {
                Dashboard: 'grid', Products: 'package',
                Orders: 'shopping-bag', Categories: 'folder',
                Slides: 'image', Brands: 'tag',
                'Second Hand': 'refresh-cw',
                Diagnostics: 'tool',
              }
              return <Feather name={icons[route.name] || 'circle'} size={size} color={color}/>
            },
          })}>
          <Tab.Screen name="Dashboard"   component={DashboardScreen}  options={{ title: BRAND + ' Admin' }}/>
          <Tab.Screen name="Products"    component={ProductsStack}    options={{ headerShown: false }}/>
          <Tab.Screen name="Orders"      component={OrdersScreen}/>
          <Tab.Screen name="Categories"  component={CategoriesScreen}/>
          <Tab.Screen name="Slides"      component={SlidesScreen}/>
          <Tab.Screen name="Brands"      component={BrandsScreen}/>
          <Tab.Screen name="Second Hand" component={SecondHandScreen}/>
          <Tab.Screen name="Diagnostics" component={DiagnosticsScreen}/>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
