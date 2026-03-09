# 🔍 SerialLens API

**SerialLens** adalah web service super ringan yang didukung oleh **Bun**, **Hono**, dan **Google Gemini AI** untuk mengekstraksi nomor seri (serial number) dari gambar secara otomatis dengan akurasi tinggi.

## 🚀 Fitur Utama
- **OCR Cerdas:** Menggunakan model Gemini terbaru (default: `gemini-2.0-flash`) untuk membaca gambar.
- **Ultra Cepat:** Berjalan di atas runtime **Bun** dan framework **Hono**.
- **Mudah Digunakan:** Cukup satu endpoint POST untuk mendapatkan hasil.
- **Konfigurasi Fleksibel:** Atur Port dan Model melalui environment variables.

## 🛠️ Persiapan

1. **Instal Dependensi**
   Pastikan Anda sudah menginstal [Bun](https://bun.sh).
   ```bash
   bun install
   ```

2. **Konfigurasi Environment**
   Salin file contoh `.env.example` ke `.env` dan masukkan API Key Gemini Anda.
   ```bash
   cp .env.example .env
   ```
   Isi `GOOGLE_API_KEY` di dalam file `.env`.

## 🏃 Menjalankan Server

Untuk mode pengembangan:
```bash
bun run index.ts
```

## 📮 API Endpoints

### 1. Welcome Message
- **URL:** `/`
- **Method:** `GET`
- **Response:** `SerialLens API is running! 🔍`

### 2. Extract Serial Number
- **URL:** `/extract-serial`
- **Method:** `POST`
- **Body:** `multipart/form-data`
- **Fields:** 
  - `image`: (File gambar JPG/PNG/WEBP)

#### Contoh Request (cURL):
```bash
curl -X POST -F "image=@/path/ke/foto_serial.jpg" http://localhost:3000/extract-serial
```

#### Contoh Response:
```json
{
  "success": true,
  "serial_number": "SN1234567890"
}
```

## ⚙️ Variabel Lingkungan (.env)
- `PORT`: Port server (default: 3000)
- `GOOGLE_API_KEY`: Kunci API dari Google AI Studio.
- `GEMINI_MODEL`: Model yang digunakan (default: `gemini-2.0-flash`).

---
Dibuat dengan ❤️ menggunakan [Bun](https://bun.sh) & [Hono](https://hono.dev).
