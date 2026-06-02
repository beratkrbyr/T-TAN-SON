import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1a]">
      <Navbar />
      <div className="h-24"></div>
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-white mb-8">Gizlilik Politikasi</h1>
          
          <div className="space-y-8 text-slate-300">
            <p>Son guncelleme: 26 Subat 2025</p>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Toplanan Bilgiler</h2>
              <p className="mb-4">TiTAN 360 uygulamasi asagidaki bilgileri toplar:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ad ve soyad</li>
                <li>Telefon numarasi</li>
                <li>E-posta adresi - istege bagli</li>
                <li>Adres bilgileri - randevu icin</li>
                <li>Fotograflar - temizlik oncesi ve sonrasi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Bilgilerin Kullanimi</h2>
              <p className="mb-4">Toplanan bilgiler asagidaki amaclarla kullanilir:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Randevu olusturma ve yonetimi</li>
                <li>Musteri iletisimi</li>
                <li>Hizmet kalitesinin iyilestirilmesi</li>
                <li>Sadakat programi yonetimi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Bilgi Guvenligi</h2>
              <p>
                Kisisel bilgileriniz sifrelenmis baglanti uzerinden iletilir ve guvenli sunucularda saklanir. 
                Bilgileriniz ucuncu taraflarla paylasilmaz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Cerezler</h2>
              <p>Uygulamamiz oturum yonetimi icin cerezler kullanir. Bu cerezler sadece teknik amaclidir.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Haklariniz</h2>
              <p className="mb-4">KVKK kapsaminda asagidaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kisisel verilerinize erisim hakki</li>
                <li>Verilerin duzeltilmesini talep etme hakki</li>
                <li>Verilerin silinmesini talep etme hakki</li>
                <li>Veri islemesine itiraz etme hakki</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Iletisim</h2>
              <p>
                Gizlilik politikamiz hakkinda sorulariniz icin:<br />
                E-posta: info@titan360.com.tr
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
