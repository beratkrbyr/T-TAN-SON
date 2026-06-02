import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";

interface Booking {
  id: string;
  service_name: string;
  date: string;
  status: string;
}

export default function ReviewScreen({ navigation }: any) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCompletedBookings();
  }, []);

  const loadCompletedBookings = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(`${API_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const completed = data.filter((b: any) => b.status === "completed");
      setBookings(completed);
    } catch (error) {
      console.log("Error:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedBooking) {
      Alert.alert("Hata", "Lütfen bir randevu seçin");
      return;
    }
    if (!comment.trim()) {
      Alert.alert("Hata", "Lütfen bir yorum yazın");
      return;
    }

    setSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      const customerData = await SecureStore.getItemAsync("customer");
      const customer = customerData ? JSON.parse(customerData) : null;

      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: selectedBooking,
          customer_id: customer?.id,
          rating,
          comment,
        }),
      });

      if (response.ok) {
        Alert.alert("Teşekkürler!", "Değerlendirmeniz kaydedildi.", [
          { text: "Tamam", onPress: () => navigation.goBack() },
        ]);
      } else {
        const data = await response.json();
        Alert.alert("Hata", data.detail || "Değerlendirme gönderilemedi");
      }
    } catch (error) {
      Alert.alert("Hata", "Bağlantı hatası");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.glow} />
        <Text style={styles.title}>Değerlendirme</Text>
        <Text style={styles.subtitle}>Deneyiminizi bizimle paylaşın</Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="clipboard-outline" size={48} color="#64748b" />
          </View>
          <Text style={styles.emptyTitle}>Henüz tamamlanan randevunuz yok</Text>
          <Text style={styles.emptyText}>
            Randevunuz tamamlandıktan sonra değerlendirme yapabilirsiniz.
          </Text>
        </View>
      ) : (
        <>
          {/* Booking Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Randevu Seçin</Text>
            <View style={styles.bookingsList}>
              {bookings.map((booking) => (
                <TouchableOpacity
                  key={booking.id}
                  style={[styles.bookingOption, selectedBooking === booking.id && styles.bookingSelected]}
                  onPress={() => setSelectedBooking(booking.id)}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={styles.bookingName}>{booking.service_name}</Text>
                    <Text style={styles.bookingDate}>{booking.date}</Text>
                  </View>
                  {selectedBooking === booking.id ? (
                    <LinearGradient colors={["#0ea5e9", "#06b6d4"]} style={styles.checkIcon}>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    </LinearGradient>
                  ) : (
                    <View style={styles.radioOuter} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Puanınız</Text>
            <LinearGradient colors={["rgba(251,191,36,0.1)", "rgba(251,191,36,0.05)"]} style={styles.ratingCard}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={44}
                      color="#fbbf24"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingText}>
                {rating === 5 ? "Mükemmel!" : rating === 4 ? "Çok İyi" : rating === 3 ? "İyi" : rating === 2 ? "Orta" : "Kötü"}
              </Text>
            </LinearGradient>
          </View>

          {/* Comment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yorumunuz</Text>
            <View style={[styles.inputWrapper, { alignItems: "flex-start" }]}>
              <Ionicons name="chatbubble-outline" size={18} color="#64748b" style={{ marginTop: 14 }} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Deneyiminizi paylaşın..."
                placeholderTextColor="#4b5563"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity onPress={handleSubmit} disabled={submitting} activeOpacity={0.8} style={styles.submitWrapper}>
            <LinearGradient
              colors={submitting ? ["#64748b", "#475569"] : ["#0ea5e9", "#06b6d4"]}
              style={styles.submitButton}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.submitText}>Değerlendirme Gönder</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f1a" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0f1a" },
  header: { padding: 24, paddingBottom: 8, position: "relative" },
  glow: { position: "absolute", top: -30, right: -30, width: 150, height: 150, backgroundColor: "rgba(251,191,36,0.08)", borderRadius: 75 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 15, color: "#94a3b8", marginTop: 4 },
  emptyState: { alignItems: "center", padding: 40, marginTop: 40 },
  emptyIconWrapper: { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 8 },
  emptyText: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 20 },
  section: { padding: 24, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 16 },
  bookingsList: { gap: 12 },
  bookingOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 18,
    borderWidth: 2, borderColor: "transparent",
  },
  bookingSelected: { borderColor: "#0ea5e9", backgroundColor: "rgba(14,165,233,0.1)" },
  bookingName: { fontSize: 16, fontWeight: "500", color: "#fff" },
  bookingDate: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
  checkIcon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)" },
  ratingCard: { padding: 24, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(251,191,36,0.2)" },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  ratingText: { fontSize: 18, color: "#fbbf24", fontWeight: "600" },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 14, color: "#fff", fontSize: 16 },
  textArea: { height: 120, textAlignVertical: "top" },
  submitWrapper: { paddingHorizontal: 24 },
  submitButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 18, borderRadius: 14, gap: 10,
    shadowColor: "#0ea5e9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  submitText: { fontSize: 17, fontWeight: "600", color: "#fff" },
});
