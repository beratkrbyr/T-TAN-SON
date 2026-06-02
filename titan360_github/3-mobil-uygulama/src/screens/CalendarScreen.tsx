import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from "../config";

const { width } = Dimensions.get("window");
const DAY_SIZE = (width - 80) / 7;

interface AvailabilityData {
  date: string;
  available: boolean;
  available_slots: string[];
  busy_slots: string[];
}

export default function CalendarScreen({ navigation }: any) {
  const [monthData, setMonthData] = useState<Record<string, AvailabilityData>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  useEffect(() => {
    loadAvailability();
  }, [currentMonth]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const y = currentMonth.getFullYear();
      const m = currentMonth.getMonth() + 1;
      const response = await fetch(`${API_URL}/availability/public?year=${y}&month=${m}`);
      if (response.ok) {
        const data: AvailabilityData[] = await response.json();
        const map: Record<string, AvailabilityData> = {};
        data.forEach((d) => { map[d.date] = d; });
        setMonthData(map);
      }
    } catch (error) {
      console.log("Error:", error);
    }
    setLoading(false);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    return { daysInMonth: lastDay.getDate(), startingDay: startDay };
  };

  const formatDateForDB = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  const { daysInMonth, startingDay } = getDaysInMonth();
  const today = new Date();

  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === currentMonth.getMonth() &&
    today.getFullYear() === currentMonth.getFullYear();

  const isPast = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate < todayStart;
  };

  const prevMonth = () => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)); setSelectedDate(null); };
  const nextMonth = () => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)); setSelectedDate(null); };

  const getDateStatus = (dateStr: string) => {
    const d = monthData[dateStr];
    if (!d || !d.available) return "empty";
    const busyCount = d.busy_slots.length;
    const availCount = d.available_slots.length;
    const total = busyCount + availCount;
    if (total > 0 && busyCount === total) return "full";
    if (busyCount > 0) return "partial";
    if (availCount > 0) return "open";
    return "empty";
  };

  const getDotColor = (status: string) => {
    switch (status) {
      case "open": return "#10b981";
      case "partial": return "#f59e0b";
      case "full": return "#ef4444";
      default: return "transparent";
    }
  };

  const callPhone = () => {
    Linking.openURL("tel:05523637425");
  };

  const openWhatsApp = (date: string, time: string) => {
    const msg = encodeURIComponent(`Merhaba, ${date} tarihinde saat ${time} için randevu almak istiyorum.`);
    Linking.openURL(`https://wa.me/905523637425?text=${msg}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  const selectedInfo = selectedDate ? monthData[selectedDate] : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Müsaitlik Takvimi</Text>
        <Text style={styles.subtitle}>Uygun gün ve saatleri görün</Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>Müsait</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
          <Text style={styles.legendText}>Kısmi Dolu</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
          <Text style={styles.legendText}>Dolu</Text>
        </View>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#0ea5e9" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#0ea5e9" />
          </TouchableOpacity>
        </View>

        <View style={styles.dayHeaders}>
          {dayNames.map((day) => (
            <Text key={day} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {Array.from({ length: startingDay }, (_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = formatDateForDB(day);
            const status = getDateStatus(dateStr);
            const dotColor = getDotColor(status);
            const isSelected = selectedDate === dateStr;
            const past = isPast(day);

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isToday(day) && styles.todayCell,
                  isSelected && styles.selectedCell,
                  past && styles.pastCell,
                  status === "full" && styles.fullCell,
                ]}
                onPress={() => !past && setSelectedDate(dateStr)}
                activeOpacity={0.7}
                disabled={past}
              >
                <Text style={[
                  styles.dayNumber,
                  isToday(day) && styles.todayNumber,
                  past && styles.pastNumber,
                  status === "full" && styles.fullNumber,
                ]}>
                  {day}
                </Text>
                {dotColor !== "transparent" && (
                  <View style={[styles.singleDot, { backgroundColor: dotColor }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selectedDate && (
        <View style={styles.selectedSection}>
          <View style={styles.selectedHeader}>
            <Ionicons name="calendar" size={20} color="#0ea5e9" />
            <Text style={styles.selectedTitle}>
              {selectedDate.split("-").reverse().join("/")}
            </Text>
          </View>

          {!selectedInfo || !selectedInfo.available ? (
            <View style={styles.emptyDay}>
              <Ionicons name="close-circle" size={48} color="#64748b" />
              <Text style={styles.closedTitle}>Bu gün için müsaitlik yok</Text>
              <Text style={styles.closedText}>Başka bir gün seçin veya bizi arayın</Text>
              <TouchableOpacity style={styles.callBtn} onPress={callPhone}>
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.callBtnText}>0552 363 74 25</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {selectedInfo.available_slots.length > 0 && (
                <View style={styles.slotSection}>
                  <Text style={styles.slotSectionTitle}>Müsait Saatler</Text>
                  <View style={styles.slotGrid}>
                    {selectedInfo.available_slots.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={styles.availableSlot}
                        onPress={() => openWhatsApp(selectedDate.split("-").reverse().join("/"), time)}
                      >
                        <Text style={styles.availableSlotText}>{time}</Text>
                        <Ionicons name="logo-whatsapp" size={14} color="#10b981" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {selectedInfo.busy_slots.length > 0 && (
                <View style={[styles.slotSection, { marginTop: 16 }]}>
                  <Text style={styles.busySectionTitle}>Dolu Saatler</Text>
                  <View style={styles.slotGrid}>
                    {selectedInfo.busy_slots.map((time) => (
                      <View key={time} style={styles.busySlot}>
                        <Text style={styles.busySlotText}>{time}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.callBtnFull} onPress={callPhone}>
                <LinearGradient colors={["#0ea5e9", "#06b6d4"]} style={styles.callBtnGradient}>
                  <Ionicons name="call" size={20} color="#fff" />
                  <Text style={styles.callBtnFullText}>Hemen Ara: 0552 363 74 25</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f1a" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0f1a" },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 15, color: "#64748b", marginTop: 4 },
  legend: { flexDirection: "row", justifyContent: "center", gap: 16, paddingVertical: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: "#94a3b8" },
  calendarCard: { margin: 16, borderRadius: 20, padding: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(14,165,233,0.2)" },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  navButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(14,165,233,0.1)", alignItems: "center", justifyContent: "center" },
  monthTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  dayHeaders: { flexDirection: "row", marginBottom: 8 },
  dayHeader: { width: DAY_SIZE, textAlign: "center", fontSize: 12, color: "#64748b", fontWeight: "600" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: DAY_SIZE, height: DAY_SIZE, alignItems: "center", justifyContent: "center", marginVertical: 2, borderRadius: 10 },
  todayCell: { backgroundColor: "rgba(14,165,233,0.2)", borderRadius: 12 },
  selectedCell: { borderWidth: 2, borderColor: "#0ea5e9", borderRadius: 12 },
  pastCell: { opacity: 0.3 },
  fullCell: { backgroundColor: "rgba(239,68,68,0.15)" },
  dayNumber: { fontSize: 15, color: "#fff", fontWeight: "500" },
  todayNumber: { color: "#0ea5e9", fontWeight: "bold" },
  pastNumber: { color: "#64748b" },
  fullNumber: { color: "#ef4444" },
  singleDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  selectedSection: { margin: 16, marginTop: 0 },
  selectedHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  selectedTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  emptyDay: { alignItems: "center", padding: 30, backgroundColor: "rgba(100,116,139,0.1)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(100,116,139,0.2)" },
  closedTitle: { fontSize: 18, fontWeight: "600", color: "#94a3b8", marginTop: 12 },
  closedText: { fontSize: 14, color: "#64748b", marginTop: 4 },
  callBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, backgroundColor: "#0ea5e9", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  callBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  slotSection: {},
  slotSectionTitle: { fontSize: 16, fontWeight: "600", color: "#10b981", marginBottom: 10 },
  busySectionTitle: { fontSize: 16, fontWeight: "600", color: "#ef4444", marginBottom: 10 },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  availableSlot: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(16,185,129,0.15)", borderWidth: 1, borderColor: "rgba(16,185,129,0.3)", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  availableSlotText: { fontSize: 14, fontWeight: "600", color: "#10b981" },
  busySlot: { backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  busySlotText: { fontSize: 14, color: "#ef4444", textDecorationLine: "line-through" },
  callBtnFull: { marginTop: 20 },
  callBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 14 },
  callBtnFullText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
});
