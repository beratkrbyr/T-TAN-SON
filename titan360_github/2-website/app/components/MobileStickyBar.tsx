"use client";

interface MobileStickyBarProps {
  phone: string;
  waLink: string;
}

export default function MobileStickyBar({ phone, waLink }: MobileStickyBarProps) {
  const handleScrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const formElement = document.getElementById("teklif-formu");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const phoneClean = phone.replace(/[^0-9+]/g, "");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-5px_20px_rgba(0,0,0,0.08)] px-4 py-3 md:hidden animate-slideUp">
      <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
        {/* Arama Butonu */}
        <a
          href={"tel:" + phoneClean}
          className="flex flex-col items-center justify-center py-2 bg-sky-50 text-sky-700 font-bold rounded-xl active:bg-sky-100 transition-colors gap-0.5 border border-sky-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-[10px] uppercase tracking-wider">Hemen Ara</span>
        </a>

        {/* WhatsApp Butonu */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl transition-colors gap-0.5 shadow-md shadow-emerald-500/20"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.417 9.863-9.864.001-2.639-1.03-5.12-2.905-6.995C16.556 1.871 14.075.84 11.44 1.838c-5.437 0-9.862 4.418-9.866 9.865-.001 1.765.487 3.488 1.414 5.016l-.99 3.618 3.71-.973zm13.048-7.042c-.326-.163-1.93-.953-2.229-1.062-.299-.108-.517-.163-.734.163-.217.325-.841 1.062-1.031 1.28-.19.217-.38.244-.706.081-.326-.162-1.375-.506-2.62-1.617-.968-.864-1.62-1.931-1.81-2.257-.19-.325-.02-.501.143-.663.146-.146.326-.38.489-.569.163-.189.217-.325.326-.54.109-.217.055-.407-.028-.57-.081-.162-.734-1.766-1.006-2.417-.265-.635-.53-.55-.735-.56-.19-.009-.408-.011-.625-.011-.218 0-.571.082-.87.407-.299.325-1.142 1.116-1.142 2.721 0 1.605 1.169 3.159 1.332 3.376.163.217 2.298 3.511 5.568 4.921.777.336 1.384.537 1.857.688.78.247 1.49.212 2.052.128.627-.094 1.93-.789 2.202-1.55.272-.76.272-1.41.19-1.551-.082-.14-.299-.223-.625-.386z" />
          </svg>
          <span className="text-[10px] uppercase tracking-wider">WhatsApp</span>
        </a>

        {/* Randevu / Teklif Al Butonu */}
        <button
          onClick={handleScrollToForm}
          className="flex flex-col items-center justify-center py-2 bg-gradient-to-r from-sky-600 to-sky-500 text-white font-bold rounded-xl active:from-sky-700 transition-colors gap-0.5 shadow-md shadow-sky-600/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] uppercase tracking-wider">Teklif Al</span>
        </button>
      </div>
    </div>
  );
}
