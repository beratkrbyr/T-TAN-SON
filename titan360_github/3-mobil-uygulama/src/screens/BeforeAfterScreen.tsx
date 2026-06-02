import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator,
  Dimensions, PanResponder, RefreshControl, TouchableOpacity
} from "react-native";
import { API_URL } from "../config";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;
const SLIDER_HEIGHT = 240;

interface GalleryItem {
  label: string;
  before_image: string;
  after_image: string;
}

interface BeforeAfterAlbumItem {
  title: string;
  images: GalleryItem[];
}

const defaultAlbums: BeforeAfterAlbumItem[] = [
  {
    title: "Koltuk Yıkama",
    images: [
      { before_image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80", after_image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", label: "Koltuk Temizliği" }
    ]
  },
  {
    title: "Halı Yıkama",
    images: [
      { before_image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80", after_image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80", label: "Halı Temizliği" }
    ]
  },
  {
    title: "Yatak Yıkama",
    images: [
      { before_image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80", after_image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80", label: "Yatak Temizliği" }
    ]
  }
];

interface SliderProps {
  item: GalleryItem;
}

function BeforeAfterItem({ item }: SliderProps) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const containerRef = useRef<View>(null);
  const containerLeft = useRef(0);

  const updatePosition = (pageX: number) => {
    const relativeX = pageX - containerLeft.current;
    let pct = (relativeX / CARD_WIDTH) * 100;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    setSliderPos(pct);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        updatePosition(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt) => {
        updatePosition(evt.nativeEvent.pageX);
      },
    })
  ).current;

  const handleLayout = () => {
    containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      containerLeft.current = pageX;
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.label || "Çalışmamız"}</Text>
      
      <View
        ref={containerRef}
        onLayout={handleLayout}
        style={styles.sliderContainer}
        {...panResponder.panHandlers}
      >
        {/* Right (After) Image - Stretches full container */}
        <Image
          source={{ uri: item.after_image }}
          style={styles.imageFull}
          resizeMode="cover"
        />
        <View style={styles.labelAfter}>
          <Text style={styles.labelText}>SONRA</Text>
        </View>

        {/* Left (Before) Image Container - Width controlled by sliderPos */}
        <View style={[styles.beforeContainer, { width: `${sliderPos}%` }]}>
          <Image
            source={{ uri: item.before_image }}
            style={[styles.imageFull, { width: CARD_WIDTH }]}
            resizeMode="cover"
          />
          <View style={styles.labelBefore}>
            <Text style={styles.labelText}>ÖNCE</Text>
          </View>
        </View>

        {/* Slider Divider Bar */}
        <View style={[styles.divider, { left: `${sliderPos}%` }]}>
          <View style={styles.handle}>
            <Ionicons name="swap-horizontal" size={16} color="#fff" />
          </View>
        </View>
      </View>
      <Text style={styles.cardInfo}>
        <Ionicons name="information-circle-outline" size={14} color="#64748b" /> Karşılaştırmak için resmi sola/sağa kaydırın
      </Text>
    </View>
  );
}

export default function BeforeAfterScreen() {
  const [albums, setAlbums] = useState<BeforeAfterAlbumItem[]>([]);
  const [activeAlbumIdx, setActiveAlbumIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const res = await fetch(`${API_URL}/website-content`);
      if (res.ok) {
        const data = await res.json();
        if (data.before_after_albums && data.before_after_albums.length > 0) {
          setAlbums(data.before_after_albums);
        } else if (data.gallery && data.gallery.length > 0) {
          setAlbums([{ title: "Çalışmalarımız", images: data.gallery }]);
        } else {
          setAlbums(defaultAlbums);
        }
      } else {
        setAlbums(defaultAlbums);
      }
    } catch (e) {
      console.log(e);
      setAlbums(defaultAlbums);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGallery();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Öncesi & Sonrası</Text>
        <Text style={styles.subtitle}>
          Titan 360 profesyonel temizlik ekibinin Antalya'da gerçekleştirdiği temizlik sonuçlarını albümlerden seçerek inceleyin.
        </Text>
      </View>

      {albums.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
          {albums.map((album, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setActiveAlbumIdx(idx)}
              style={[styles.tabButton, activeAlbumIdx === idx && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeAlbumIdx === idx && styles.tabTextActive]}>
                {album.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>Sonuçlar Yükleniyor...</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {albums[activeAlbumIdx]?.images?.map((item, index) => (
            <BeforeAfterItem key={index} item={item} />
          ))}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0f1a" },
  header: { padding: 20, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 6, lineHeight: 18 },
  loadingContainer: { paddingVertical: 40, alignItems: "center", justifyContent: "center", marginTop: 40 },
  loadingText: { color: "#64748b", marginTop: 12, fontSize: 14 },
  listContainer: { paddingHorizontal: 20, gap: 20 },
  tabScroll: { marginVertical: 10, paddingHorizontal: 20 },
  tabContent: { gap: 10, paddingRight: 40 },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  tabButtonActive: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  tabTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: 16,
    overflow: "hidden"
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 12 },
  sliderContainer: {
    width: CARD_WIDTH,
    height: SLIDER_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#111827"
  },
  imageFull: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0
  },
  beforeContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    overflow: "hidden",
    borderRightWidth: 0
  },
  divider: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#fff",
    marginLeft: -1,
    alignItems: "center",
    justifyContent: "center"
  },
  handle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4
  },
  labelBefore: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(239, 68, 68, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  labelAfter: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(16, 185, 129, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  labelText: { fontSize: 10, fontWeight: "bold", color: "#fff", letterSpacing: 0.5 },
  cardInfo: { fontSize: 11, color: "#64748b", marginTop: 8, textAlign: "center" }
});
