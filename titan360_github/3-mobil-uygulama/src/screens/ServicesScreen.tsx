import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,
  TouchableOpacity, Image, Modal, Dimensions, Alert, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from "../config";

const { width } = Dimensions.get("window");

interface ServiceOption { id: string; name: string; price: number; }
interface Service { id: string; name: string; description: string; price: number; duration: number; image?: string; options?: ServiceOption[]; }
interface CartItem { service: Service; option?: ServiceOption; price: number; label: string; }

const serviceIcons: { [key: string]: string } = {
  "Ev Temizliği": "home", "Ofis Temizliği": "business", "Cam Temizliği": "grid",
  "Koltuk Yıkama": "bed", "Halı Yıkama": "layers", "Derin Temizlik": "sparkles",
  "Perde": "shirt", "Yatak Yıkama": "bed",
};

export default function ServicesScreen({ navigation }: any) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [m2Input, setM2Input] = useState("");
  const [m2Service, setM2Service] = useState<{service: Service, option?: ServiceOption} | null>(null);
  const [showM2Modal, setShowM2Modal] = useState(false);

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services`);
      const data = await response.json();
      setServices(data);
    } catch (error) { console.log("Error loading services:", error); }
    setLoading(false);
  };

  const onRefresh = async () => { setRefreshing(true); await loadServices(); setRefreshing(false); };
  const getIcon = (name: string) => serviceIcons[name] || "cube-outline";

  const handleServicePress = (service: Service) => {
    if (service.options && service.options.length > 0) {
      setSelectedService(service);
      setSelectedOption(null);
      setShowModal(true);
    } else {
      addToCart(service);
    }
  };

  const isM2Service = (name: string) => {
    const lower = name.toLowerCase();
    return lower.includes("halı") || lower.includes("hali") || lower.includes("perde") || lower.includes("m2");
  };

  const addToCart = (service: Service, option?: ServiceOption) => {
    const optName = option ? option.name : service.name;
    if (isM2Service(service.name) || isM2Service(optName)) {
      setM2Service({ service, option });
      setM2Input("");
      setShowM2Modal(true);
      return;
    }
    const item: CartItem = {
      service,
      option,
      price: option ? option.price : service.price,
      label: option ? `${service.name} (${option.name})` : service.name,
    };
    setCart([...cart, item]);
    Alert.alert("Sepete Eklendi", `${item.label} sepete eklendi.`);
  };

  const addM2ToCart = () => {
    const m2 = parseFloat(m2Input);
    if (!m2 || m2 <= 0 || !m2Service) { Alert.alert("Hata", "Lütfen geçerli bir m2 değeri girin."); return; }
    const { service, option } = m2Service;
    const unitPrice = option ? option.price : service.price;
    const totalPrice = Math.round(unitPrice * m2);
    const item: CartItem = {
      service,
      option,
      price: totalPrice,
      label: option ? `${service.name} (${option.name}) - ${m2} m²` : `${service.name} - ${m2} m²`,
    };
    setCart([...cart, item]);
    setShowM2Modal(false);
    setM2Service(null);
    Alert.alert("Sepete Eklendi", `${item.label} - ${totalPrice} TL`);
  };

  const handleOptionContinue = () => {
    if (selectedService && selectedOption) {
      setShowModal(false);
      addToCart(selectedService, selectedOption);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = () => {
    if (cart.length === 0) { Alert.alert("Sepet Boş", "Lütfen hizmet ekleyin."); return; }
    setShowCart(false);
    navigation.navigate("NewBooking", {
      service: {
        id: cart[0].service.id,
        name: cart.map(c => c.label).join(" + "),
        price: cartTotal,
        selectedOption: null,
        cartItems: cart,
      }
    });
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0ea5e9" /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />}>
        <View style={styles.header}>
          <Text style={styles.title}>Hizmetlerimiz</Text>
          <Text style={styles.subtitle}>Size en uygun hizmeti seçin</Text>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <TouchableOpacity key={service.id} style={styles.serviceCard} onPress={() => handleServicePress(service)} activeOpacity={0.8}>
              {service.image ? (
                <Image source={{ uri: service.image }} style={styles.serviceImage} />
              ) : (
                <LinearGradient colors={["rgba(14,165,233,0.3)", "rgba(6,182,212,0.1)"]} style={styles.serviceImagePlaceholder} />
              )}
              <LinearGradient colors={["transparent", "rgba(10,15,26,0.8)", "rgba(10,15,26,0.95)"]} style={styles.serviceOverlay} />
              <View style={styles.serviceContent}>
                <View style={styles.serviceIconContainer}>
                  <Ionicons name={getIcon(service.name) as any} size={24} color="#fff" />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                {service.description ? <Text style={styles.serviceDesc} numberOfLines={2}>{service.description}</Text> : null}
                <View style={styles.serviceFooter}>
                  <Text style={styles.servicePrice}>
                    {service.options && service.options.length > 0
                      ? `${Math.min(...service.options.map(o => o.price))} TL'den`
                      : `${service.price} TL`}
                  </Text>
                  <View style={styles.addCartBadge}>
                    <Ionicons name="cart-outline" size={16} color="#fff" />
                    <Text style={styles.addCartText}>Sepete Ekle</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => setShowCart(true)} activeOpacity={0.9}>
          <LinearGradient colors={["#0ea5e9", "#06b6d4"]} style={styles.cartBarGradient}>
            <View style={styles.cartBarLeft}>
              <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cart.length}</Text></View>
              <Text style={styles.cartBarText}>Sepeti Gör</Text>
            </View>
            <Text style={styles.cartBarPrice}>{cartTotal.toLocaleString()} TL</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Options Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedService?.name}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Lütfen bir seçenek belirleyin</Text>
            <ScrollView style={styles.optionsList}>
              {selectedService?.options?.map((option) => (
                <TouchableOpacity key={option.id} style={[styles.optionItem, selectedOption?.id === option.id && styles.optionItemSelected]} onPress={() => setSelectedOption(option)}>
                  <View style={styles.optionRadio}>{selectedOption?.id === option.id && <View style={styles.optionRadioInner} />}</View>
                  <View style={styles.optionInfo}><Text style={styles.optionName}>{option.name}</Text></View>
                  <Text style={styles.optionPrice}>{option.price} TL</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.continueBtn, !selectedOption && styles.continueBtnDisabled]} onPress={handleOptionContinue} disabled={!selectedOption}>
              <LinearGradient colors={selectedOption ? ["#0ea5e9", "#06b6d4"] : ["#475569", "#475569"]} style={styles.continueBtnGradient}>
                <Ionicons name="cart" size={20} color="#fff" />
                <Text style={styles.continueBtnText}>{selectedOption ? `${selectedOption.price} TL - Sepete Ekle` : "Seçenek Seçin"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cart Modal */}
      <Modal visible={showCart} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sepetim ({cart.length})</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}><Ionicons name="close" size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList}>
              {cart.map((item, i) => (
                <View key={i} style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartItemName}>{item.label}</Text>
                    <Text style={styles.cartItemPrice}>{item.price.toLocaleString()} TL</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(i)} style={styles.cartRemoveBtn}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={styles.cartTotalRow}>
              <Text style={styles.cartTotalLabel}>Toplam:</Text>
              <Text style={styles.cartTotalValue}>{cartTotal.toLocaleString()} TL</Text>
            </View>
            <TouchableOpacity onPress={handleCheckout}>
              <LinearGradient colors={["#10b981", "#059669"]} style={styles.continueBtnGradient}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.continueBtnText}>Randevu Oluştur</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* M2 Input Modal */}
      <Modal visible={showM2Modal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Metrekare Girin</Text>
              <TouchableOpacity onPress={() => setShowM2Modal(false)}><Ionicons name="close" size={24} color="#94a3b8" /></TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              {m2Service?.option ? `${m2Service.service.name} (${m2Service.option.name})` : m2Service?.service.name}
              {" - "}{m2Service?.option ? m2Service.option.price : m2Service?.service.price} TL/m²
            </Text>
            <View style={{ marginTop: 16 }}>
              <TextInput
                style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 14, padding: 16, color: "#fff", fontSize: 20, textAlign: "center", borderWidth: 1, borderColor: "rgba(14,165,233,0.3)" }}
                placeholder="Örn: 15"
                placeholderTextColor="#64748b"
                value={m2Input}
                onChangeText={setM2Input}
                keyboardType="numeric"
              />
              {m2Input && parseFloat(m2Input) > 0 && (
                <Text style={{ color: "#10b981", textAlign: "center", marginTop: 10, fontSize: 18, fontWeight: "bold" }}>
                  Toplam: {Math.round((m2Service?.option ? m2Service.option.price : (m2Service?.service.price || 0)) * parseFloat(m2Input))} TL
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={addM2ToCart} style={{ marginTop: 16 }}>
              <LinearGradient colors={["#0ea5e9", "#06b6d4"]} style={styles.continueBtnGradient}>
                <Ionicons name="cart" size={20} color="#fff" />
                <Text style={styles.continueBtnText}>Sepete Ekle</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f1a" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0f1a" },
  header: { padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 15, color: "#64748b", marginTop: 4 },
  servicesGrid: { padding: 16, gap: 16 },
  serviceCard: { height: 200, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "rgba(14,165,233,0.2)" },
  serviceImage: { position: "absolute", width: "100%", height: "100%", resizeMode: "cover" },
  serviceImagePlaceholder: { position: "absolute", width: "100%", height: "100%" },
  serviceOverlay: { position: "absolute", width: "100%", height: "100%" },
  serviceContent: { flex: 1, padding: 16, justifyContent: "flex-end" },
  serviceIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(14,165,233,0.3)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  serviceName: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  serviceDesc: { fontSize: 13, color: "#94a3b8", marginBottom: 8 },
  serviceFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  servicePrice: { fontSize: 20, fontWeight: "bold", color: "#0ea5e9" },
  addCartBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16,185,129,0.8)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addCartText: { fontSize: 12, color: "#fff", fontWeight: "bold" },
  cartBar: { position: "absolute", bottom: 16, left: 16, right: 16 },
  cartBarGradient: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16 },
  cartBarLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cartBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  cartBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  cartBarText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cartBarPrice: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  cartItem: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  cartItemName: { fontSize: 16, fontWeight: "600", color: "#fff" },
  cartItemPrice: { fontSize: 14, color: "#0ea5e9", marginTop: 4, fontWeight: "600" },
  cartRemoveBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(239,68,68,0.15)", alignItems: "center", justifyContent: "center" },
  cartTotalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", marginBottom: 10 },
  cartTotalLabel: { fontSize: 18, fontWeight: "600", color: "#94a3b8" },
  cartTotalValue: { fontSize: 24, fontWeight: "bold", color: "#10b981" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#1e293b", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  modalSubtitle: { fontSize: 14, color: "#64748b", marginBottom: 16 },
  optionsList: { maxHeight: 300 },
  optionItem: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, marginBottom: 10, borderWidth: 2, borderColor: "transparent" },
  optionItemSelected: { borderColor: "#0ea5e9", backgroundColor: "rgba(14,165,233,0.1)" },
  optionRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#64748b", alignItems: "center", justifyContent: "center", marginRight: 12 },
  optionRadioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#0ea5e9" },
  optionInfo: { flex: 1 },
  optionName: { fontSize: 16, fontWeight: "600", color: "#fff" },
  optionPrice: { fontSize: 18, fontWeight: "bold", color: "#0ea5e9" },
  continueBtn: { marginTop: 16 },
  continueBtnDisabled: { opacity: 0.5 },
  continueBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14 },
  continueBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
