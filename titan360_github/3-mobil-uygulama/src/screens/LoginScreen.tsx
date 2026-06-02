import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Hardcoded API URL to avoid any config issues
const API_URL = "https://titan360.com.tr/api";

interface Props {
  setIsLoggedIn: (value: boolean) => void;
}

export default function LoginScreen({ setIsLoggedIn }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formatPhone = (text: string) => {
    return text.replace(/\D/g, "");
  };

  const handlePhoneChange = (text: string) => setPhone(formatPhone(text));

  const handleLogin = async () => {
    if (!phone || !password) {
      setErrorMsg("Telefon ve şifre gerekli");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    
    const url = `${API_URL}/customers/login`;
    console.log("=== LOGIN REQUEST ===");
    console.log("URL:", url);
    console.log("Phone:", phone);
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ phone, password }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", JSON.stringify(Object.fromEntries(response.headers.entries())));
      
      const text = await response.text();
      console.log("Response text (first 200 chars):", text.substring(0, 200));
      
      // Check if response is HTML
      if (text.startsWith("<") || text.startsWith("<!DOCTYPE")) {
        setErrorMsg("Sunucu HTML döndü. API hatası.");
        setLoading(false);
        return;
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log("JSON parse error:", e);
        setErrorMsg("JSON parse hatası: " + text.substring(0, 50));
        setLoading(false);
        return;
      }

      if (response.ok && data.token) {
        await SecureStore.setItemAsync("token", data.token);
        await SecureStore.setItemAsync("customer", JSON.stringify(data.customer));
        setIsLoggedIn(true);
      } else {
        setErrorMsg(data.detail || "Giriş başarısız");
      }
    } catch (error: any) {
      console.log("=== LOGIN ERROR ===");
      console.log("Error name:", error.name);
      console.log("Error message:", error.message);
      console.log("Full error:", JSON.stringify(error));
      setErrorMsg("Bağlantı hatası: " + error.message);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !phone || !password) {
      setErrorMsg("İsim, telefon ve şifre gerekli");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Şifreler eşleşmiyor");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Şifre en az 6 karakter olmalı");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    
    const url = `${API_URL}/customers/register`;
    console.log("=== REGISTER REQUEST ===");
    console.log("URL:", url);
    console.log("Name:", name);
    console.log("Phone:", phone);
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          name, 
          phone, 
          email: email || null,
          password,
          referral_code: referralCode || null
        }),
      });

      console.log("Response status:", response.status);
      
      const text = await response.text();
      console.log("Response text (first 200 chars):", text.substring(0, 200));
      
      // Check if response is HTML
      if (text.startsWith("<") || text.startsWith("<!DOCTYPE")) {
        setErrorMsg("Sunucu HTML döndü. API hatası.");
        setLoading(false);
        return;
      }
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log("JSON parse error:", e);
        setErrorMsg("JSON parse hatası: " + text.substring(0, 50));
        setLoading(false);
        return;
      }

      if (response.ok && data.token) {
        await SecureStore.setItemAsync("token", data.token);
        await SecureStore.setItemAsync("customer", JSON.stringify(data.customer));
        Alert.alert("Başarılı", "Kayıt başarılı! Hoş geldiniz.", [
          { text: "Tamam", onPress: () => setIsLoggedIn(true) }
        ]);
      } else {
        setErrorMsg(data.detail || "Kayıt başarısız");
      }
    } catch (error: any) {
      console.log("=== REGISTER ERROR ===");
      console.log("Error name:", error.name);
      console.log("Error message:", error.message);
      console.log("Full error:", JSON.stringify(error));
      setErrorMsg("Bağlantı hatası: " + error.message);
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrorMsg("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setReferralCode("");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.glow1} />
      <View style={styles.glow2} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient colors={["#0ea5e9", "#06b6d4"]} style={styles.logoIcon}>
              <Ionicons name="flash" size={36} color="#fff" />
            </LinearGradient>
            <Text style={styles.logoText}>
              TiTAN <Text style={styles.logoAccent}>360</Text>
            </Text>
          </View>

          <Text style={styles.subtitle}>{isRegister ? "Kayıt Ol" : "Giriş Yap"}</Text>
          <Text style={styles.hint}>Randevu almak için {isRegister ? "kayıt olun" : "giriş yapın"}</Text>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {isRegister && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ad Soyad</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Adınız Soyadınız"
                    placeholderTextColor="#4b5563"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Telefon</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="05XX XXX XXXX"
                  placeholderTextColor="#4b5563"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            </View>

            {isRegister && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-posta (İsteğe Bağlı)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="ornek@email.com"
                    placeholderTextColor="#4b5563"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="******"
                  placeholderTextColor="#4b5563"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {isRegister && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Şifre Tekrar</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="******"
                    placeholderTextColor="#4b5563"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              </View>
            )}

            {isRegister && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Referans Kodu (İsteğe Bağlı)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="gift-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Varsa referans kodunu girin"
                    placeholderTextColor="#4b5563"
                    value={referralCode}
                    onChangeText={setReferralCode}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            )}

            <TouchableOpacity onPress={isRegister ? handleRegister : handleLogin} disabled={loading} activeOpacity={0.8}>
              <LinearGradient
                colors={loading ? ["#64748b", "#475569"] : ["#0ea5e9", "#06b6d4"]}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>{isRegister ? "Kayıt Ol" : "Giriş Yap"}</Text>
                    <Ionicons name={isRegister ? "person-add" : "arrow-forward"} size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Toggle Login/Register */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isRegister ? "Zaten hesabınız var mı?" : "Hesabınız yok mu?"}
            </Text>
            <TouchableOpacity onPress={toggleMode}>
              <Text style={styles.toggleLink}>
                {isRegister ? "Giriş Yap" : "Kayıt Ol"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1a",
  },
  scrollContent: {
    flexGrow: 1,
  },
  glow1: {
    position: "absolute",
    top: "15%",
    left: "-20%",
    width: 300,
    height: 300,
    backgroundColor: "rgba(14,165,233,0.15)",
    borderRadius: 150,
  },
  glow2: {
    position: "absolute",
    bottom: "20%",
    right: "-25%",
    width: 350,
    height: 350,
    backgroundColor: "rgba(6,182,212,0.1)",
    borderRadius: 175,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoIcon: {
    width: 70,
    height: 70,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  logoAccent: {
    color: "#0ea5e9",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    flex: 1,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 6,
  },
  toggleText: {
    color: "#64748b",
    fontSize: 14,
  },
  toggleLink: {
    color: "#0ea5e9",
    fontSize: 14,
    fontWeight: "600",
  },
});
