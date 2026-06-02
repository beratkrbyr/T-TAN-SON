import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";

interface Booking {
  _id: string;
  service_name: string;
  date: string;
  time: string;
  status: string;
  address: string;
  price: number;
  discount_pct?: number;
  final_price?: number;
  points_earned?: number;
}

const statusColors: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", completed: "#10b981", cancelled: "#ef4444",
};
const statusLabels: Record<string, string> = {
  pending: "Bekliyor", confirmed: "Onaylandı", completed: "Tamamlandı", cancelled: "İptal Edildi",
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const customerData = await SecureStore.getItemAsync("customer");
      if (!token || !customerData) return;
      const customer = JSON.parse(customerData);
      const res = await fetch(`${API_URL}/customers/${customer.id}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setBookings(await res.json());
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const onRefresh = async () => { setRefreshing(true); await loadBookings(); setRefreshing(false); };

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.serviceName}>{item.service_name}</Text>
          <Text style={styles.date}>{item.date} - {item.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColors[item.status]}20` }]}>
          <Text style={[styles.statusText, { color: statusColors[item.status] }]}>{statusLabels[item.status] || item.status}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#64748b" />
          <Text style={styles.infoText}>{item.address || "Adres belirtilmemiş"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color="#64748b" />
          <Text style={styles.infoText}>{item.price} TL</Text>
          {item.discount_pct && item.discount_pct > 0 && (
            <Text style={styles.discountText}>(%{item.discount_pct} indirim)</Text>
          )}
        </View>
        {item.points_earned && item.points_earned > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="star" size={16} color="#fbbf24" />
            <Text style={styles.pointsText}>+{item.points_earned} puan kazanıldı</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0ea5e9" /></View>;

  return (
    <View style={styles.container}>
      <FlatList data={bookings} renderItem={renderBooking} keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={64} color="#374151" />
            <Text style={styles.emptyTitle}>Randevu Yok</Text>
            <Text style={styles.emptyText}>Henüz randevunuz bulunmuyor.{"\n"}Hizmetler sayfasından randevu oluşturabilirsiniz.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f1a" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0f1a" },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  serviceName: { fontSize: 18, fontWeight: "600", color: "#fff" },
  date: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "600" },
  cardBody: { gap: 8 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 14, color: "#94a3b8" },
  discountText: { fontSize: 12, color: "#10b981", fontWeight: "600" },
  pointsText: { fontSize: 13, color: "#fbbf24", fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#fff", marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 22 },
});
