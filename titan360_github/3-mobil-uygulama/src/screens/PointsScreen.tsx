import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";

interface PointsData {
  points: number;
  total_spent: number;
  total_bookings: number;
  referral_code: string;
  base_discount: number;
  extra_discount: number;
  total_discount: number;
  available_discounts: { type: string; pct: number; earned_at: string; from_customer: string }[];
  points_history: { points: number; type: string; reason: string; created_at: string }[];
  referrals: { referee_name: string; status: string; created_at: string }[];
}

export default function PointsScreen() {
  const [data, setData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const res = await fetch(`${API_URL}/customers/my-points`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, []);

  const shareReferral = async () => {
    if (!data?.referral_code) return;
    await Share.share({
      message: `TiTAN 360 uygulamasını indir ve kayıt olurken referans kodumu kullan: ${data.referral_code}\n\nİlk randevunda özel indirim kazan!`,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={{ color: "#fff", marginTop: 12 }}>Veriler yüklenemedi</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />}
    >
      {/* Points Card */}
      <LinearGradient colors={["#0ea5e9", "#06b6d4"]} style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>Toplam Puanınız</Text>
        <Text style={styles.pointsValue}>{data.points}</Text>
        <Text style={styles.pointsSub}>1 puan = 1 TL</Text>
        <View style={styles.pointsStats}>
          <View style={styles.pointsStat}>
            <Text style={styles.statVal}>{data.total_bookings}</Text>
            <Text style={styles.statLbl}>Randevu</Text>
          </View>
          <View style={styles.pointsDivider} />
          <View style={styles.pointsStat}>
            <Text style={styles.statVal}>{data.total_spent.toLocaleString()} TL</Text>
            <Text style={styles.statLbl}>Toplam Harcama</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Discount Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İndirim Haklarınız</Text>
        <View style={styles.discountCard}>
          <View style={styles.discountRow}>
            <View style={styles.discountItem}>
              <Text style={styles.discountPct}>%{data.base_discount}</Text>
              <Text style={styles.discountLabel}>Temel İndirim</Text>
              <Text style={styles.discountNote}>Her zaman geçerli</Text>
            </View>
            <View style={styles.discountPlus}>
              <Ionicons name="add" size={20} color="#64748b" />
            </View>
            <View style={styles.discountItem}>
              <Text style={[styles.discountPct, { color: data.extra_discount > 0 ? "#10b981" : "#64748b" }]}>
                %{data.extra_discount}
              </Text>
              <Text style={styles.discountLabel}>Ekstra İndirim</Text>
              <Text style={styles.discountNote}>Tek kullanımlık</Text>
            </View>
            <View style={styles.discountPlus}>
              <Ionicons name="arrow-forward" size={20} color="#64748b" />
            </View>
            <View style={[styles.discountItem, styles.discountTotal]}>
              <Text style={[styles.discountPct, { color: "#0ea5e9", fontSize: 28 }]}>%{data.total_discount}</Text>
              <Text style={styles.discountLabel}>Toplam</Text>
              <Text style={styles.discountNote}>Maks %30</Text>
            </View>
          </View>
        </View>

        {data.available_discounts.length > 0 && (
          <View style={styles.bonusList}>
            {data.available_discounts.map((d, i) => (
              <View key={i} style={styles.bonusItem}>
                <Ionicons name="gift" size={18} color="#10b981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bonusText}>
                    +%{d.pct} {d.type === "referral" ? "Referans Bonusu" : "Büyük İş Bonusu"}
                  </Text>
                  {d.from_customer ? <Text style={styles.bonusSub}>{d.from_customer} sayesinde</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Referral Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Referans Kodunuz</Text>
        <View style={styles.referralCard}>
          <View style={styles.referralCodeBox}>
            <Text style={styles.referralCode}>{data.referral_code}</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={shareReferral}>
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={styles.shareBtnText}>Arkadaşa Gönder</Text>
          </TouchableOpacity>
          <Text style={styles.referralNote}>
            Davet ettiğiniz kişi 1.200 TL+ ilk randevusunu tamamladığında{"\n"}
            siz +%10 ekstra indirim kazanırsınız!
          </Text>
        </View>

        {data.referrals.length > 0 && (
          <View style={styles.referralList}>
            <Text style={styles.subTitle}>Davet Ettikleriniz</Text>
            {data.referrals.map((r, i) => (
              <View key={i} style={styles.referralItem}>
                <Ionicons
                  name={r.status === "completed" ? "checkmark-circle" : "time"}
                  size={18}
                  color={r.status === "completed" ? "#10b981" : "#fbbf24"}
                />
                <Text style={styles.referralName}>{r.referee_name}</Text>
                <Text style={[styles.referralStatus, { color: r.status === "completed" ? "#10b981" : "#fbbf24" }]}>
                  {r.status === "completed" ? "Tamamlandı" : "Bekliyor"}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Points History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Puan Geçmişi</Text>
        {data.points_history.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="receipt-outline" size={36} color="#64748b" />
            <Text style={styles.emptyText}>Henüz puan işlemi yok</Text>
          </View>
        ) : (
          data.points_history.map((h, i) => (
            <View key={i} style={styles.historyItem}>
              <View style={[styles.historyIcon, { backgroundColor: h.type === "earned" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }]}>
                <Ionicons
                  name={h.type === "earned" ? "arrow-down" : "arrow-up"}
                  size={16}
                  color={h.type === "earned" ? "#10b981" : "#ef4444"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyReason}>{h.reason}</Text>
                <Text style={styles.historyDate}>{h.created_at ? new Date(h.created_at).toLocaleDateString("tr-TR") : ""}</Text>
              </View>
              <Text style={[styles.historyPoints, { color: h.type === "earned" ? "#10b981" : "#ef4444" }]}>
                {h.type === "earned" ? "+" : ""}{h.points}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Nasıl Çalışır?</Text>
        <View style={styles.infoItem}>
          <View style={styles.infoBullet}><Text style={styles.infoBulletText}>1</Text></View>
          <Text style={styles.infoText}>Her randevuda otomatik %10 indirim</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.infoBullet}><Text style={styles.infoBulletText}>2</Text></View>
          <Text style={styles.infoText}>100 TL = 10 puan kazanın (1 puan = 1 TL)</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.infoBullet}><Text style={styles.infoBulletText}>3</Text></View>
          <Text style={styles.infoText}>Arkadaş davet edin, +%10 indirim kazanın</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.infoBullet}><Text style={styles.infoBulletText}>4</Text></View>
          <Text style={styles.infoText}>10.000 TL+ is = +%10 bonus indirim</Text>
        </View>
        <View style={styles.infoItem}>
          <View style={styles.infoBullet}><Text style={styles.infoBulletText}>5</Text></View>
          <Text style={styles.infoText}>Puanlarınızı sonraki randevularınızda kullanabilirsiniz</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f1a" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0f1a" },
  pointsCard: { margin: 16, borderRadius: 20, padding: 24, alignItems: "center" },
  pointsLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "500" },
  pointsValue: { color: "#fff", fontSize: 56, fontWeight: "bold", marginVertical: 4 },
  pointsSub: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  pointsStats: { flexDirection: "row", marginTop: 20, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 12, width: "100%" },
  pointsStat: { flex: 1, alignItems: "center" },
  pointsDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  statVal: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  statLbl: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 },
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  discountCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(14,165,233,0.2)" },
  discountRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  discountItem: { alignItems: "center", flex: 1 },
  discountTotal: { backgroundColor: "rgba(14,165,233,0.1)", borderRadius: 12, padding: 8 },
  discountPlus: { paddingHorizontal: 4 },
  discountPct: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  discountLabel: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
  discountNote: { fontSize: 9, color: "#64748b", marginTop: 1 },
  bonusList: { marginTop: 10, gap: 8 },
  bonusItem: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(16,185,129,0.1)", borderRadius: 10, padding: 12 },
  bonusText: { color: "#10b981", fontWeight: "600", fontSize: 14 },
  bonusSub: { color: "#64748b", fontSize: 12, marginTop: 2 },
  referralCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "rgba(14,165,233,0.2)" },
  referralCodeBox: { backgroundColor: "rgba(14,165,233,0.15)", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 30, marginBottom: 14, borderWidth: 1, borderColor: "rgba(14,165,233,0.3)" },
  referralCode: { color: "#0ea5e9", fontSize: 24, fontWeight: "bold", letterSpacing: 2 },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#25D366", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  shareBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  referralNote: { color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 14, lineHeight: 18 },
  referralList: { marginTop: 14 },
  subTitle: { color: "#94a3b8", fontSize: 14, fontWeight: "600", marginBottom: 8 },
  referralItem: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 12, marginBottom: 6 },
  referralName: { flex: 1, color: "#fff", fontSize: 14 },
  referralStatus: { fontSize: 12, fontWeight: "600" },
  emptyHistory: { alignItems: "center", padding: 30, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16 },
  emptyText: { color: "#64748b", marginTop: 8, fontSize: 14 },
  historyItem: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 14, marginBottom: 6 },
  historyIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  historyReason: { color: "#fff", fontSize: 13 },
  historyDate: { color: "#64748b", fontSize: 11, marginTop: 2 },
  historyPoints: { fontSize: 16, fontWeight: "bold" },
  infoSection: { margin: 16, marginTop: 24, backgroundColor: "rgba(14,165,233,0.08)", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "rgba(14,165,233,0.15)" },
  infoTitle: { color: "#0ea5e9", fontSize: 16, fontWeight: "bold", marginBottom: 14 },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  infoBullet: { width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(14,165,233,0.2)", alignItems: "center", justifyContent: "center" },
  infoBulletText: { color: "#0ea5e9", fontSize: 12, fontWeight: "bold" },
  infoText: { color: "#94a3b8", fontSize: 13, flex: 1 },
});
