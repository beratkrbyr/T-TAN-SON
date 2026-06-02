import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Alert, Dimensions, Linking,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";
import { API_URL } from "../config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface Customer {
  name: string;
  phone: string;
  loyalty_points: number;
  referral_code: string;
  total_bookings: number;
}

interface Props {
  navigation: any;
  setIsLoggedIn: (value: boolean) => void;
}

export default function HomeScreen({ navigation, setIsLoggedIn }: Props) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => { loadCustomer(); }, []);

  const loadCustomer = async () => {
    try {
      const stored = await SecureStore.getItemAsync("customer");
      if (stored) setCustomer(JSON.parse(stored));
      // Fetch fresh data from API
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        const res = await fetch(`${API_URL}/customers/my-points`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const updated = { ...JSON.parse(stored || "{}"), loyalty_points: data.points || 0, total_bookings: data.total_bookings || 0, referral_code: data.referral_code || "" };
          setCustomer(updated as any);
          if ((data.total_bookings || 0) === 0) setIsFirstTime(true);
          await SecureStore.setItemAsync("customer", JSON.stringify(updated));
        }
      }
    } catch (e) { console.log(e); }
  };

  const onRefresh = async () => { setRefreshing(true); await loadCustomer(); setRefreshing(false); };

  const copyReferralCode = async () => {
    if (!customer?.referral_code) return;
    await Clipboard.setStringAsync(customer.referral_code);
    Alert.alert("Kopyalandı", "Referans kodunuz panoya kopyalandı!");
  };

  const shareReferralCode = async () => {
    if (!customer?.referral_code) return;
    await Share.share({
      message: `TiTAN 360 uygulamasını indir ve kayıt olurken referans kodumu kullan: ${customer.referral_code}\n\nİlk randevunda özel indirim kazan!`,
    });
  };

  const handleLogout = async () => {
    Alert.alert("Çıkış", "Çıkış yapmak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: async () => {
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("customer");
        setIsLoggedIn(false);
      }},
    ]);
  };

  const handleSupport = () => {
    const waLink = "https://wa.me/905523637425?text=Merhaba,%20uygulama%20üzerinden%20iletişime%20geçiyorum.";
    Linking.openURL(waLink).catch(() => {
      Alert.alert("Hata", "WhatsApp uygulaması açılamadı.");
    });
  };

  const menuItems = [
    { name: "Hizmetler", icon: "sparkles-outline", color: "#0ea5e9", screen: "Services" },
    { name: "Randevu Al", icon: "add-circle-outline", color: "#10b981", screen: "NewBooking" },
    { name: "Randevularım", icon: "list-outline", color: "#8b5cf6", screen: "Bookings" },
    { name: "Takvim", icon: "calendar", color: "#f59e0b", screen: "Calendar" },
    { name: "Önce / Sonra", icon: "images-outline", color: "#d97706", screen: "BeforeAfter" },
    { name: "Bildirimler", icon: "notifications-outline", color: "#06b6d4", screen: "Notifications" },
    { name: "Canlı Destek", icon: "chatbubbles-outline", color: "#10b981", action: handleSupport },
    { name: "Puanlarım", icon: "gift-outline", color: "#f97316", screen: "Points" },
    { name: "Değerlendir", icon: "star-outline", color: "#ec4899", screen: "Review" },
    { name: "Profilim", icon: "person-outline", color: "#6366f1", screen: "Profile" },
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.glow1} />
        <View style={styles.glow2} />
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Profesyonel Temizlik</Text>
        </View>
        <Text style={styles.greeting}>Merhaba,</Text>
        <Text style={styles.name}>{customer?.name || "Müşteri"}</Text>
      </View>

      {/* İlk Kullanım Bannerı */}
      {isFirstTime && (
        <TouchableOpacity style={{ marginHorizontal: 20, marginBottom: 12 }} onPress={() => navigation.navigate("Services")} activeOpacity={0.8}>
          <LinearGradient colors={["#f59e0b", "#d97706"]} style={{ padding: 16, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="gift" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Hoş Geldiniz! %20 İndirim</Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>İlk randevunuzda özel %20 indirim kazanın!</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* İstatistikler */}
      <View style={styles.statsRow}>
        <LinearGradient colors={["rgba(14,165,233,0.15)", "rgba(6,182,212,0.05)"]} style={styles.statCard}>
          <Ionicons name="star" size={24} color="#fbbf24" />
          <Text style={styles.statValue}>{customer?.loyalty_points || 0}</Text>
          <Text style={styles.statLabel}>Puan</Text>
        </LinearGradient>
        <LinearGradient colors={["rgba(14,165,233,0.15)", "rgba(6,182,212,0.05)"]} style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#0ea5e9" />
          <Text style={styles.statValue}>{customer?.total_bookings || 0}</Text>
          <Text style={styles.statLabel}>Randevu</Text>
        </LinearGradient>
      </View>

      {/* Hızlı İşlemler */}
      <View style={styles.quickActions}>
        <TouchableOpacity onPress={() => navigation.navigate("NewBooking")} style={{ flex: 1 }}>
          <LinearGradient colors={["#0ea5e9", "#06b6d4"]} style={styles.primaryBtn}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Randevu Al</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Calendar")} style={styles.secondaryBtn}>
          <Ionicons name="calendar" size={20} color="#f59e0b" />
          <Text style={styles.secondaryBtnText}>Takvim</Text>
        </TouchableOpacity>
      </View>

      {/* Menü */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, i) => (
             <TouchableOpacity key={i} style={styles.menuItem} onPress={() => item.action ? item.action() : navigation.navigate(item.screen)} activeOpacity={0.7}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon as any} size={26} color={item.color} />
              </View>
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Referans */}
      <LinearGradient colors={["rgba(16,185,129,0.15)", "rgba(6,182,212,0.05)"]} style={styles.referralCard}>
        <View style={styles.referralHeader}>
          <Ionicons name="gift" size={22} color="#10b981" />
          <Text style={styles.referralTitle}>Referans Kodunuz</Text>
        </View>
        <Text style={styles.referralCode}>{customer?.referral_code || "---"}</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <TouchableOpacity onPress={copyReferralCode} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(14,165,233,0.15)", paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(14,165,233,0.3)" }}>
            <Ionicons name="copy-outline" size={18} color="#0ea5e9" />
            <Text style={{ color: "#0ea5e9", fontWeight: "600", fontSize: 13 }}>Kopyala</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={shareReferralCode} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(16,185,129,0.15)", paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "rgba(16,185,129,0.3)" }}>
            <Ionicons name="share-social" size={18} color="#10b981" />
            <Text style={{ color: "#10b981", fontWeight: "600", fontSize: 13 }}>Paylaş</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.referralInfo}>Arkadaşlarınıza paylaşın, ekstra %10 indirim kazanın!</Text>
      </LinearGradient>

      {/* Çıkış */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f1a" },
  hero: { padding: 20, paddingTop: 10, position: "relative" },
  glow1: { position: "absolute", top: -50, left: -50, width: 180, height: 180, backgroundColor: "rgba(14,165,233,0.12)", borderRadius: 90 },
  glow2: { position: "absolute", top: 30, right: -60, width: 200, height: 200, backgroundColor: "rgba(6,182,212,0.08)", borderRadius: 100 },
  badge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "rgba(14,165,233,0.1)", borderWidth: 1, borderColor: "rgba(14,165,233,0.2)", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 12 },
  badgeDot: { width: 6, height: 6, backgroundColor: "#10b981", borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, color: "#06b6d4", fontWeight: "500" },
  greeting: { fontSize: 18, color: "#64748b" },
  name: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 2 },
  statsRow: { flexDirection: "row", paddingHorizontal: 20, gap: 12 },
  statCard: { flex: 1, alignItems: "center", padding: 18, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  statValue: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 8 },
  statLabel: { fontSize: 13, color: "#64748b", marginTop: 2 },
  quickActions: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 6 },
  primaryBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  secondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, backgroundColor: "rgba(245,158,11,0.1)", borderWidth: 1, borderColor: "rgba(245,158,11,0.3)", gap: 6 },
  secondaryBtnText: { fontSize: 15, fontWeight: "600", color: "#f59e0b" },
  menuSection: { padding: 20, paddingBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 14 },
  menuGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  menuItem: { width: (width - 50) / 3, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  menuIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  menuText: { fontSize: 12, fontWeight: "500", color: "#fff", textAlign: "center" },
  referralCard: { margin: 20, marginBottom: 12, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" },
  referralHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  referralTitle: { fontSize: 15, color: "#10b981", fontWeight: "600" },
  referralCode: { fontSize: 28, fontWeight: "bold", color: "#fff", letterSpacing: 2 },
  referralInfo: { fontSize: 12, color: "#64748b", marginTop: 6 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 20, padding: 14, borderRadius: 12, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", gap: 8 },
  logoutText: { fontSize: 15, fontWeight: "500", color: "#ef4444" },
});
