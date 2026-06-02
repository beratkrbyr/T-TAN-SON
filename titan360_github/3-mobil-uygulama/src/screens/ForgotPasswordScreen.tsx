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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export default function ForgotPasswordScreen({ onBack, onSuccess }: Props) {
  const [step, setStep] = useState<"phone" | "code" | "newPassword">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, "");
    let formatted = "";
    if (digits.length > 0) formatted = digits.substring(0, 4);
    if (digits.length > 4) formatted += " " + digits.substring(4, 7);
    if (digits.length > 7) formatted += " " + digits.substring(7, 11);
    return formatted;
  };

  const handlePhoneChange = (text: string) => setPhone(formatPhone(text));

  const handleSendCode = async () => {
    if (!phone) {
      Alert.alert("Hata", "Telefon numarası gerekli");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/customers/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Başarılı", "Doğrulama kodu telefonunuza gönderildi");
        setStep("code");
      } else {
        Alert.alert("Hata", data.detail || "Kod gönderilemedi");
      }
    } catch (error) {
      Alert.alert("Hata", "Bağlantı hatası. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  const handleVerifyAndReset = async () => {
    if (!code) {
      Alert.alert("Hata", "Doğrulama kodu gerekli");
      return;
    }

    if (code.length !== 6) {
      Alert.alert("Hata", "Kod 6 haneli olmalı");
      return;
    }

    setStep("newPassword");
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Hata", "Şifre alanları gerekli");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalı");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/customers/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone, 
          code, 
          new_password: newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Başarılı", "Şifreniz değiştirildi. Giriş yapabilirsiniz.", [
          { text: "Tamam", onPress: onSuccess }
        ]);
      } else {
        Alert.alert("Hata", data.detail || "Şifre değiştirilemedi");
      }
    } catch (error) {
      Alert.alert("Hata", "Bağlantı hatası. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      {/* Background Glows */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />
      
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="key-outline" size={40} color="#0ea5e9" />
          </View>
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            {step === "phone" && "Telefon numaranızı girin, size doğrulama kodu göndereceğiz."}
            {step === "code" && "Telefonunuza gönderilen 6 haneli kodu girin."}
            {step === "newPassword" && "Yeni şifrenizi belirleyin."}
          </Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.step, step === "phone" && styles.stepActive]} />
          <View style={[styles.stepLine, (step === "code" || step === "newPassword") && styles.stepLineActive]} />
          <View style={[styles.step, step === "code" && styles.stepActive]} />
          <View style={[styles.stepLine, step === "newPassword" && styles.stepLineActive]} />
          <View style={[styles.step, step === "newPassword" && styles.stepActive]} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {step === "phone" && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Telefon Numarası</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="0532 111 2233"
                    placeholderTextColor="#4b5563"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    maxLength={13}
                  />
                </View>
              </View>

              <TouchableOpacity onPress={handleSendCode} disabled={loading} activeOpacity={0.8}>
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
                      <Text style={styles.buttonText}>Kod Gönder</Text>
                      <Ionicons name="send" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          {step === "code" && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Doğrulama Kodu</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="keypad-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="000000"
                    placeholderTextColor="#4b5563"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              <TouchableOpacity onPress={handleVerifyAndReset} disabled={loading} activeOpacity={0.8}>
                <LinearGradient
                  colors={loading ? ["#64748b", "#475569"] : ["#0ea5e9", "#06b6d4"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Doğrula</Text>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSendCode} style={styles.resendButton}>
                <Text style={styles.resendText}>Kodu tekrar gönder</Text>
              </TouchableOpacity>
            </>
          )}

          {step === "newPassword" && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Yeni Şifre</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••"
                    placeholderTextColor="#4b5563"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Şifre Tekrar</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••"
                    placeholderTextColor="#4b5563"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity onPress={handleResetPassword} disabled={loading} activeOpacity={0.8}>
                <LinearGradient
                  colors={loading ? ["#64748b", "#475569"] : ["#10b981", "#059669"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Şifreyi Değiştir</Text>
                      <Ionicons name="checkmark-done" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1a",
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
    paddingHorizontal: 28,
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(14,165,233,0.1)",
    borderWidth: 1,
    borderColor: "rgba(14,165,233,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  step: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  stepActive: {
    backgroundColor: "#0ea5e9",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: "#0ea5e9",
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
    paddingVertical: 16,
    color: "#fff",
    fontSize: 16,
  },
  codeInput: {
    letterSpacing: 8,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
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
  resendButton: {
    alignItems: "center",
    marginTop: 16,
  },
  resendText: {
    color: "#0ea5e9",
    fontSize: 14,
    fontWeight: "500",
  },
});
