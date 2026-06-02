import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ detail: "Dosya seçilmedi" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Dizin yolunu belirle: public/static/uploads
    const uploadDir = path.join(process.cwd(), "public", "static", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Benzersiz dosya ismi oluştur
    const ext = path.extname(file.name);
    const filename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Dosyayı diske yaz
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/static/uploads/${filename}` });
  } catch (error: any) {
    return NextResponse.json(
      { detail: `Görsel kaydetme hatası: ${error.message}` },
      { status: 500 }
    );
  }
}
