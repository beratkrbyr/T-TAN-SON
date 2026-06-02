import React, { useState, useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { View, ActivityIndicator } from "react-native";

import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import BookingsScreen from "./src/screens/BookingsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ServicesScreen from "./src/screens/ServicesScreen";
import NewBookingScreen from "./src/screens/NewBookingScreen";
import ReviewScreen from "./src/screens/ReviewScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import PointsScreen from "./src/screens/PointsScreen";
import BeforeAfterScreen from "./src/screens/BeforeAfterScreen";
import NotificationsScreen from "./src/screens/NotificationsScreen";

const Stack = createNativeStackNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#0ea5e9",
    background: "#0a0f1a",
    card: "#111827",
    text: "#ffffff",
    border: "#1f2937",
    notification: "#0ea5e9",
  },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      setIsLoggedIn(!!token);
    } catch (e) {
      console.log("Auth check error:", e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0f1a" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0a0f1a" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {!isLoggedIn ? (
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              options={{ title: "TiTAN 360", headerLeft: () => null }}
            >
              {(props) => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
            <Stack.Screen name="Bookings" component={BookingsScreen} options={{ title: "Randevularım" }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profilim" }} />
            <Stack.Screen name="Services" component={ServicesScreen} options={{ title: "Hizmetler" }} />
            <Stack.Screen name="NewBooking" component={NewBookingScreen} options={{ title: "Randevu Oluştur" }} />
            <Stack.Screen name="Review" component={ReviewScreen} options={{ title: "Değerlendirme" }} />
            <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: "Takvim" }} />
            <Stack.Screen name="Points" component={PointsScreen} options={{ title: "Puanlarım" }} />
            <Stack.Screen name="BeforeAfter" component={BeforeAfterScreen} options={{ title: "Öncesi / Sonrası" }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Bildirimlerim" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
