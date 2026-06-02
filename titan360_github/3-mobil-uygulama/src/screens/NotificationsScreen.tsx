import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl, Alert
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";
import { Ionicons } from "@expo/vector-icons";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
    markAsRead();
  }, []);

  const loadNotifications = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/notifications/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (e) {
      console.log("Load notifications error:", e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;

      await fetch(`${API_URL}/notifications/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.log("Mark notifications read error:", e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    await markAsRead();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <View style={[styles.card, !item.read && styles.unreadCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={item.read ? "notifications-outline" : "notifications"}
            size={20}
            color={item.read ? "#64748b" : "#0ea5e9"}
          />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
            {!item.read && <View style={styles.badgeDot} />}
          </View>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Bildirimler Yükleniyor...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="notifications-off-outline" size={48} color="#475569" />
              </View>
              <Text style={styles.emptyTitle}>Bildirim Kutunuz Boş</Text>
              <Text style={styles.emptySubtitle}>
                Randevularınız, kampanyalarımız ve duyurularımızla ilgili bildirimler burada listelenecektir.
              </Text>
            </View>
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f1a" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#64748b", marginTop: 12, fontSize: 14 },
  listContainer: { padding: 20, gap: 12 },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
  },
  unreadCard: {
    backgroundColor: "rgba(14, 165, 233, 0.05)",
    borderColor: "rgba(14, 165, 233, 0.15)",
  },
  cardHeader: { flexDirection: "row", gap: 12 },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start"
  },
  contentContainer: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { fontSize: 15, fontWeight: "600", color: "#e2e8f0" },
  unreadTitle: { color: "#fff", fontWeight: "bold" },
  badgeDot: { width: 6, height: 6, backgroundColor: "#0ea5e9", borderRadius: 3 },
  message: { fontSize: 13, color: "#94a3b8", marginTop: 4, lineHeight: 18 },
  date: { fontSize: 11, color: "#64748b", marginTop: 8 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40, marginTop: 40 },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)"
  },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: "#64748b", textAlign: "center", lineHeight: 18 }
});
