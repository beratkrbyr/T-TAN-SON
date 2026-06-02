import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Alert, Modal, ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from "../config";

interface Customer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyalty_points: number;
  referral_code: string;
}

export default function ProfileScreen({ navigation }: any) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCustomer(); }, []);

  const loadCustomer = async () => {
    try {
      const stored = await SecureStore.getItemAsync("customer");
      if (stored) setCustomer(JSON.parse(stored));
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        const res = await fetch(`${API_URL}/customers/my-points`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const updated = { ...JSON.parse(stored || "{}"), loyalty_points: data.points || 0, referral_code: data.referral_code || "" };
          setCustomer(updated as any);
        }
      }
    } catch (e) { console.log(e); }
  };

  const openEditModal = () => {
    setEditName(customer?.name || "");
    setEditEmail(customer?.email || "");
    setEditAddress(customer?.address || "");
    setShowEdit(true);
  };

  const saveProfile = async () => {
    if (!editName.trim()) { Alert.alert("Hata", "İsim boş olamaz"); return; }
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      const res = await fetch(`${API_URL}/customers/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName, email: editEmail, address: editAddress }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = { ...customer, name: data.name, email: data.email, address: data.address };
        setCustomer(updated as any);
        await SecureStore.setItemAsync("customer", JSON.stringify(updated));
        setShowEdit(false);
        Alert.alert("Başarılı", "Profiliniz güncellendi");
      } else {
        Alert.alert("Hata", "Profil güncellenemedi");
      }
    } catch (e) { Alert.alert("Hata", "Bağlantı hatası"); }
    setSaving(false);
  };

  const handleLogout = async () => {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: async () => {
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("customer");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }},
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <LinearGradient colors={["rgba(14,165,233,0.15)", "rgba(6,182,212,0.05)"]} style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{customer?.name?.charAt(0)?.toUpperCase() || "?"}</Text>
        </View>
        <Text style={styles.name}>{customer?.name || "Müşteri"}</Text>
        <Text style={styles.phone}>{customer?.phone}</Text>
        {customer?.email ? <Text style={styles.email}>{customer.email}</Text> : null}
        <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
          <Ionicons name="create-outline" size={16} color="#0ea5e9" />
          <Text style={styles.editBtnText}>Profili Düzenle</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Info Cards */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Ionicons name="star" size={24} color="#fbbf24" />
          <View style={styles.infoContent}>
            <Text style={styles.infoValue}>{customer?.loyalty_points || 0}</Text>
            <Text style={styles.infoLabel}>Sadakat Puanı</Text>
          </View>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="gift" size={24} color="#10b981" />
          <View style={styles.infoContent}>
            <Text style={styles.infoValue} numberOfLines={1}>{customer?.referral_code || "---"}</Text>
            <Text style={styles.infoLabel}>Referans Kodu</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <Text style={styles.sectionTitle}>Hesap</Text>
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={openEditModal}>
          <View style={[styles.menuIcon, { backgroundColor: "rgba(14,165,233,0.1)" }]}><Ionicons name="person" size={20} color="#0ea5e9" /></View>
          <Text style={styles.menuText}>Profili Düzenle</Text>
          <Ionicons name="chevron-forward" size={18} color="#4b5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Points")}>
          <View style={[styles.menuIcon, { backgroundColor: "rgba(251,191,36,0.1)" }]}><Ionicons name="star" size={20} color="#fbbf24" /></View>
          <Text style={styles.menuText}>Puanlarım</Text>
          <Ionicons name="chevron-forward" size={18} color="#4b5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Bookings")}>
          <View style={[styles.menuIcon, { backgroundColor: "rgba(16,185,129,0.1)" }]}><Ionicons name="calendar" size={20} color="#10b981" /></View>
          <Text style={styles.menuText}>Randevularım</Text>
          <Ionicons name="chevron-forward" size={18} color="#4b5563" />
        </TouchableOpacity>
      </View>

      {/* Contact */}
      <Text style={styles.sectionTitle}>İletişim</Text>
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL("tel:05523637425")}>
          <View style={[styles.menuIcon, { backgroundColor: "rgba(14,165,233,0.1)" }]}><Ionicons name="call" size={20} color="#0ea5e9" /></View>
          <View style={{ flex: 1 }}><Text style={styles.menuText}>Telefon</Text><Text style={styles.menuSubtext}>0552 363 74 25</Text></View>
          <Ionicons name="chevron-forward" size={18} color="#4b5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL("https://wa.me/905523637425")}>
          <View style={[styles.menuIcon, { backgroundColor: "rgba(16,185,129,0.1)" }]}><Ionicons name="logo-whatsapp" size={20} color="#10b981" /></View>
          <View style={{ flex: 1 }}><Text style={styles.menuText}>WhatsApp</Text><Text style={styles.menuSubtext}>Hızlı mesaj gönderin</Text></View>
          <Ionicons name="chevron-forward" size={18} color="#4b5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL("https://titan360.com.tr")}>
          <View style={[styles.menuIcon, { backgroundColor: "rgba(139,92,246,0.1)" }]}><Ionicons name="globe" size={20} color="#8b5cf6" /></View>
          <View style={{ flex: 1 }}><Text style={styles.menuText}>Web Sitesi</Text><Text style={styles.menuSubtext}>titan360.com.tr</Text></View>
          <Ionicons name="chevron-forward" size={18} color="#4b5563" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>TİTAN 360 v1.0.0</Text>
        <Text style={styles.copyright}>© 2025 Tüm hakları saklıdır.</Text>
      </View>

      {/* Edit Modal */}
      <Modal visible={showEdit} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profili Düzenle</Text>
              <TouchableOpacity onPress={() => setShowEdit(false)}><Ionicons name="close" size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Ad Soyad</Text>
              <TextInput style={styles.formInput} value={editName} onChangeText={setEditName} placeholder="Adınız Soyadınız" placeholderTextColor="#4b5563" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>E-posta (İsteğe Bağlı)</Text>
              <TextInput style={styles.formInput} value={editEmail} onChangeText={setEditEmail} placeholder="ornek@email.com" placeholderTextColor="#4b5563" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Adres (İsteğe Bağlı)</Text>
              <TextInput style={[styles.formInput, { minHeight: 80 }]} value={editAddress} onChangeText={setEditAddress} placeholder="Ev veya iş adresiniz" placeholderTextColor="#4b5563" multiline />
            </View>
            <View style={styles.formNote}>
              <Ionicons name="information-circle" size={16} color="#64748b" />
              <Text style={styles.formNoteText}>Telefon numaranız değiştirilemez.</Text>
            </View>
            <TouchableOpacity onPress={saveProfile} disabled={saving} style={{ opacity: saving ? 0.5 : 1 }}>
              <LinearGradient colors={["#0ea5e9", "#06b6d4"]} style={styles.saveBtn}>
                {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark" size={20} color="#fff" /><Text style={styles.saveBtnText}>Kaydet</Text></>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f1a" },
  profileCard: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 20, margin: 16, borderRadius: 20, borderWidth: 1, borderColor: "rgba(14,165,233,0.2)" },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#0ea5e9", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  name: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  phone: { fontSize: 16, color: "#94a3b8", marginTop: 4 },
  email: { fontSize: 14, color: "#64748b", marginTop: 2 },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "rgba(14,165,233,0.15)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(14,165,233,0.3)" },
  editBtnText: { color: "#0ea5e9", fontSize: 14, fontWeight: "600" },
  infoSection: { flexDirection: "row", paddingHorizontal: 16, gap: 12 },
  infoCard: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  infoContent: { flex: 1 },
  infoValue: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  infoLabel: { fontSize: 12, color: "#64748b", marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#fff", paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12 },
  menuSection: { paddingHorizontal: 16, gap: 8 },
  menuItem: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", gap: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuText: { flex: 1, fontSize: 15, fontWeight: "600", color: "#fff" },
  menuSubtext: { fontSize: 12, color: "#64748b", marginTop: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginTop: 24, padding: 14, backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  logoutText: { color: "#ef4444", fontSize: 15, fontWeight: "600" },
  appInfo: { alignItems: "center", paddingVertical: 30 },
  appVersion: { fontSize: 14, color: "#64748b" },
  copyright: { fontSize: 12, color: "#4b5563", marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#1e293b", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 14, fontWeight: "600", color: "#94a3b8", marginBottom: 6 },
  formInput: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, color: "#fff", fontSize: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  formNote: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16, padding: 10, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 10 },
  formNoteText: { color: "#64748b", fontSize: 13 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14 },
  saveBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
