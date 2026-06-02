import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, TextInput, Image, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../config";

const { width } = Dimensions.get("window");
const DAY_SIZE = (width - 100) / 7;

interface AvailabilityData {
  date: string;
  available: boolean;
  available_slots: string[];
  busy_slots: string[];
}

const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function NewBookingScreen({ route, navigation }: any) {
  const { service } = route.params || {};
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthAvailability, setMonthAvailability] = useState<Record<string, AvailabilityData>>({});
  const [loading, setLoading] = useState(true);
  const [customerPoints, setCustomerPoints] = useState(0);
  const [customerDiscount, setCustomerDiscount] = useState(10);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => { loadAvailability(); }, [currentMonth]);
  useEffect(() => { loadCustomerInfo(); }, []);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const y = currentMonth.getFullYear();
      const m = currentMonth.getMonth() + 1;
      const res = await fetch(`${API_URL}/availability/public?year=${y}&month=${m}`);
      if (res.ok) {
        const data: AvailabilityData[] = await res.json();
        const map: Record<string, AvailabilityData> = {};
        data.forEach(d => { map[d.date] = d; });
        setMonthAvailability(map);
      }
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const loadCustomerInfo = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return;
      const res = await fetch(`${API_URL}/customers/my-points`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerPoints(data.points || 0);
        const bookingCount = data.total_bookings || 0;
        if (bookingCount === 0) {
          setCustomerDiscount(20);
          setIsFirstTime(true);
        } else {
          setCustomerDiscount(data.total_discount || 10);
        }
      }
    } catch (e) { console.log(e); }
  };

  const formatDateForDB = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDateDisplay = (date: Date) =>
    `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

  const getDaysInMonth = () => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    let startDay = new Date(y, m, 1).getDay() - 1;
    if (startDay < 0) startDay = 6;
    return { daysInMonth: new Date(y, m + 1, 0).getDate(), startingDay: startDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth();

  const getDateStatus = (day: number) => {
    const dateStr = formatDateForDB(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    const d = monthAvailability[dateStr];
    if (!d || !d.available) return "empty";
    const busy = d.busy_slots.length;
    const avail = d.available_slots.length;
    const total = busy + avail;
    if (total > 0 && busy === total) return "full";
    if (busy > 0) return "partial";
    if (avail > 0) return "open";
    return "empty";
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    const status = getDateStatus(day);
    return status === "full";
  };

  const selectDate = (day: number) => {
    if (isDateDisabled(day)) return;
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    setSelectedTime(null);
  };

  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    const dateStr = formatDateForDB(selectedDate);
    const d = monthAvailability[dateStr];
    return d ? d.available_slots : [];
  };

  const getBusySlots = () => {
    if (!selectedDate) return [];
    const dateStr = formatDateForDB(selectedDate);
    const d = monthAvailability[dateStr];
    return d ? d.busy_slots : [];
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.5, base64: true });
    if (!result.canceled && result.assets[0].base64) {
      setPhotos([...photos, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const price = service?.price || 0;
  const discountAmount = Math.round(price * customerDiscount / 100);
  const finalPrice = price - discountAmount;

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) { Alert.alert("Hata", "Lütfen tarih ve saat seçin"); return; }
    if (!address) { Alert.alert("Hata", "Lütfen adres girin"); return; }

    setSubmitting(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) { Alert.alert("Hata", "Oturum süresi dolmuş. Lütfen tekrar giriş yapın."); setSubmitting(false); return; }

      const body = {
        service_id: service?.id || "",
        service_name: service?.name || "",
        date: formatDateForDB(selectedDate),
        time: selectedTime,
        address, notes: notes || "", photos,
        price: service?.price || 0,
        discount_pct: customerDiscount,
        discount_amount: discountAmount,
        final_price: finalPrice,
      };

      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Başarılı", `Randevunuz oluşturuldu!\n${isFirstTime ? "İlk randevu özel " : ""}%${customerDiscount} indirim uygulandı.`, [
          { text: "Tamam", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Hata", data.detail || "Randevu oluşturulamadı");
      }
    } catch (e) { Alert.alert("Hata", "Bağlantı hatası"); }
    setSubmitting(false);
  };

  if (!service) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Hizmet seçilmedi</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availSlots = getAvailableSlots();
  const busySlots = getBusySlots();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hizmet Bilgisi */}
      <View style={styles.serviceCard}>
        <LinearGradient colors={["rgba(14,165,233,0.2)", "rgba(6,182,212,0.1)"]} style={styles.serviceGradient}>
          <Text style={styles.serviceName} numberOfLines={3}>{service.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.servicePrice}>{service.price} TL</Text>
            <View style={styles.discountBadge}>
              <Ionicons name="pricetag" size={14} color={isFirstTime ? "#f59e0b" : "#10b981"} />
              <Text style={[styles.discountBadgeText, isFirstTime && { color: "#f59e0b" }]}>
                {isFirstTime ? "İlk Randevu %20" : `%${customerDiscount} İndirim`}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Takvim */}
      <View style={styles.section}>
        <Text style={styles.title}>Tarih Seçin</Text>
        <View style={styles.calendar}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={() => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)); setSelectedDate(null); }}>
              <Ionicons name="chevron-back" size={24} color="#0ea5e9" />
            </TouchableOpacity>
            <Text style={styles.monthText}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</Text>
            <TouchableOpacity onPress={() => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)); setSelectedDate(null); }}>
              <Ionicons name="chevron-forward" size={24} color="#0ea5e9" />
            </TouchableOpacity>
          </View>
          <View style={styles.dayHeaders}>{dayNames.map(d => <Text key={d} style={styles.dayHeader}>{d}</Text>)}</View>
          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}><ActivityIndicator color="#0ea5e9" /></View>
          ) : (
            <View style={styles.daysGrid}>
              {Array.from({ length: startingDay }, (_, i) => <View key={`e${i}`} style={styles.dayCell} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const disabled = isDateDisabled(day);
                const selected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth.getMonth() && selectedDate?.getFullYear() === currentMonth.getFullYear();
                const status = getDateStatus(day);
                const isPast = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < new Date(new Date().setHours(0,0,0,0));

                const dotColor = status === "open" ? "#10b981" : status === "partial" ? "#f59e0b" : status === "full" ? "#ef4444" : "transparent";

                return (
                  <TouchableOpacity key={day} style={[styles.dayCell, selected && styles.daySelected, (disabled || isPast) && styles.dayDisabled]}
                    onPress={() => selectDate(day)} disabled={disabled || isPast}>
                    <Text style={[styles.dayText, selected && styles.dayTextSelected, (disabled || isPast) && styles.dayTextDisabled]}>{day}</Text>
                    {dotColor !== "transparent" && <View style={[styles.dayDot, { backgroundColor: dotColor }]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: "#10b981" }]} /><Text style={styles.legendText}>Müsait</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} /><Text style={styles.legendText}>Kısmen Dolu</Text></View>
          <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} /><Text style={styles.legendText}>Dolu</Text></View>
        </View>
      </View>

      {/* Saat Seçimi */}
      {selectedDate && (
        <View style={styles.section}>
          <View style={styles.timeHeader}>
            <Text style={styles.title}>Saat Seçin</Text>
            <Text style={styles.availableText}>{availSlots.length} müsait saat</Text>
          </View>

          {availSlots.length === 0 && busySlots.length === 0 ? (
            <View style={styles.noSlots}>
              <Ionicons name="alert-circle-outline" size={32} color="#64748b" />
              <Text style={styles.noSlotsText}>Bu gün için henüz saat belirlenmemiş.{"\n"}Lütfen bizi arayın: 0552 363 74 25</Text>
            </View>
          ) : (
            <>
              {availSlots.length > 0 && (
                <View style={styles.timeGrid}>
                  {availSlots.map(t => (
                    <TouchableOpacity key={t} style={[styles.timeSlot, selectedTime === t && styles.timeSelected]} onPress={() => setSelectedTime(t)}>
                      <Text style={[styles.timeText, selectedTime === t && styles.timeTextSelected]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {busySlots.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.busyLabel}>Dolu Saatler:</Text>
                  <View style={styles.timeGrid}>
                    {busySlots.map(t => (
                      <View key={t} style={styles.timeBusy}>
                        <Text style={styles.timeBusyText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Adres */}
      <View style={styles.section}>
        <Text style={styles.title}>Adres</Text>
        <TextInput style={styles.input} placeholder="Adresinizi girin..." placeholderTextColor="#666" value={address} onChangeText={setAddress} multiline />
      </View>

      {/* Fotoğraf */}
      <View style={styles.section}>
        <Text style={styles.title}>Fotoğraf (İsteğe Bağlı)</Text>
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
          <Ionicons name="camera" size={24} color="#0ea5e9" />
          <Text style={styles.photoBtnText}>Fotoğraf Ekle</Text>
        </TouchableOpacity>
        {photos.length > 0 && (
          <View style={styles.photoGrid}>
            {photos.map((p, i) => (
              <View key={i} style={styles.photoItem}>
                <Image source={{ uri: p }} style={styles.photoImg} />
                <TouchableOpacity style={styles.photoRemove} onPress={() => setPhotos(photos.filter((_, idx) => idx !== i))}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Notlar */}
      <View style={styles.section}>
        <Text style={styles.title}>Notlar (İsteğe Bağlı)</Text>
        <TextInput style={styles.input} placeholder="Ek notlarınız..." placeholderTextColor="#666" value={notes} onChangeText={setNotes} multiline />
      </View>

      {/* Randevu Özeti + İndirim */}
      {selectedDate && selectedTime && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Randevu Özeti</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hizmet:</Text>
            <Text style={styles.summaryValue} numberOfLines={3}>{service.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tarih:</Text>
            <Text style={styles.summaryValue}>{formatDateDisplay(selectedDate)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Saat:</Text>
            <Text style={styles.summaryValue}>{selectedTime}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tutar:</Text>
            <Text style={styles.summaryValue}>{price} TL</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: "#10b981" }]}>İndirim (%{customerDiscount}):</Text>
            <Text style={[styles.summaryValue, { color: "#10b981" }]}>-{discountAmount} TL</Text>
          </View>
          {customerPoints > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: "#0ea5e9" }]}>Puanlarınız:</Text>
              <Text style={[styles.summaryValue, { color: "#0ea5e9" }]}>{customerPoints} puan</Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Ödenecek Tutar:</Text>
            <Text style={styles.summaryPrice}>{finalPrice} TL</Text>
          </View>
        </View>
      )}

      {/* Gönder */}
      <TouchableOpacity style={[styles.submitBtn, (!selectedDate || !selectedTime || submitting) && styles.submitDisabled]}
        onPress={handleSubmit} disabled={!selectedDate || !selectedTime || submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : (
          <>
            <Text style={styles.submitText}>Randevu Oluştur</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </>
        )}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f1a" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0f1a" },
  errorText: { color: "#ef4444", fontSize: 16, marginBottom: 16 },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#0ea5e9", borderRadius: 10 },
  backBtnText: { color: "#fff", fontWeight: "600" },
  serviceCard: { margin: 16 },
  serviceGradient: { padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "rgba(14,165,233,0.3)" },
  serviceName: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  serviceOption: { fontSize: 16, color: "#0ea5e9", marginTop: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  servicePrice: { fontSize: 28, fontWeight: "bold", color: "#10b981" },
  discountBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "rgba(16,185,129,0.3)" },
  discountBadgeText: { fontSize: 13, fontWeight: "600", color: "#10b981" },
  section: { padding: 16, paddingTop: 8 },
  title: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 12 },
  calendar: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16 },
  monthNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  monthText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  dayHeaders: { flexDirection: "row", marginBottom: 8 },
  dayHeader: { width: DAY_SIZE, textAlign: "center", fontSize: 12, color: "#64748b" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: DAY_SIZE, height: DAY_SIZE + 10, justifyContent: "center", alignItems: "center" },
  daySelected: { backgroundColor: "#0ea5e9", borderRadius: 10 },
  dayDisabled: { opacity: 0.3 },
  dayText: { fontSize: 15, color: "#fff" },
  dayTextSelected: { fontWeight: "bold" },
  dayTextDisabled: { color: "#666" },
  dayDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  legend: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: "#94a3b8" },
  timeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  availableText: { fontSize: 14, color: "#10b981", fontWeight: "600" },
  noSlots: { alignItems: "center", padding: 24, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 12 },
  noSlotsText: { color: "#64748b", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeSlot: { paddingVertical: 14, paddingHorizontal: 18, backgroundColor: "rgba(16,185,129,0.1)", borderWidth: 1, borderColor: "rgba(16,185,129,0.3)", borderRadius: 12, minWidth: 80, alignItems: "center" },
  timeSelected: { backgroundColor: "#0ea5e9", borderColor: "#0ea5e9" },
  timeText: { fontSize: 15, color: "#10b981", fontWeight: "600" },
  timeTextSelected: { color: "#fff" },
  timeBusy: { paddingVertical: 14, paddingHorizontal: 18, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", borderRadius: 12, minWidth: 80, alignItems: "center" },
  timeBusyText: { fontSize: 15, color: "#ef4444", textDecorationLine: "line-through" },
  busyLabel: { fontSize: 13, color: "#ef4444", marginBottom: 8, fontWeight: "600" },
  input: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 14, color: "#fff", fontSize: 15, minHeight: 50 },
  photoBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(14,165,233,0.1)", padding: 14, borderRadius: 12, justifyContent: "center" },
  photoBtnText: { color: "#0ea5e9", fontSize: 15 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  photoItem: { width: 70, height: 70, borderRadius: 10, overflow: "hidden" },
  photoImg: { width: "100%", height: "100%" },
  photoRemove: { position: "absolute", top: 4, right: 4, backgroundColor: "rgba(239,68,68,0.9)", borderRadius: 10, padding: 2 },
  summary: { backgroundColor: "rgba(16,185,129,0.1)", margin: 16, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" },
  summaryTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: "#64748b" },
  summaryValue: { fontSize: 14, color: "#fff", fontWeight: "500" },
  summaryTotalLabel: { fontSize: 16, color: "#fff", fontWeight: "bold" },
  summaryDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 8 },
  summaryPrice: { fontSize: 22, fontWeight: "bold", color: "#10b981" },
  submitBtn: { backgroundColor: "#0ea5e9", marginHorizontal: 16, padding: 18, borderRadius: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 17, fontWeight: "600", color: "#fff" },
});
