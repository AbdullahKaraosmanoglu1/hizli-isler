# Hızlı İşler — Çağrı Merkezi Servisi (NestJS + CQRS)

Vatandaş taleplerini kaydeden, durum geçişlerini yöneten ve çözülen talepler için anket daveti/yanıtlarını toplayan bir mikro servis. Gün sonunda anket yanıtlarını CSV olarak \`\` klasörüne yazar. Proje; **NestJS + CQRS**, **Prisma**, **PostgreSQL**, **Docker Compose** ve **Jest** kullanılarak geliştirildi.

---

## İçindekiler

- [Özet](#özet)
- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Mimari](#mimari)
- [Veri Modeli](#veri-modeli)
- [Kurulum](#kurulum)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Uygulamayı Çalıştırma](#uygulamayı-çalıştırma)
- [API](#api)
- [Güvenlik](#güvenlik)
- [Metrikler](#metrikler)
- [CSV Raporlama](#csv-raporlama)
- [Testler](#testler)
- [Sorun Giderme](#sorun-giderme)
- [Dizin Yapısı](#dizin-yapısı)
- [Lisans](#lisans)

---

## Özet

- Talepler oluşturulur, atanır ve **Açık → Atandı → Çözüldü** akışında yönetilir.
- Talep **Çözüldü** olduğunda in-process event bus üzerinden `RequestResolved` olayı yayınlanır.
- Olayı dinleyen **Anket** modülü davet kaydı açar; sonrasında kullanıcı yanıtı (`score 1–5`, `comment`) kaydedilir.
- Gün sonunda oluşan yanıtlar CSV dosyasına aktarılır.

## Özellikler

- **Talepler:** CRUD, atama, durum geçişleri
- **Olaylaşma:** In-process event (Nest `@nestjs/cqrs`)
- **Anketler:** Davet & yanıt toplama
- **Metrikler:** Ortalama çözüm süresi (saat), son 24 saatte çözülen sayısı, ortalama puan
- **Raporlama:** Gün sonu CSV (manuel endpoint + cron job)

## Teknolojiler

- **Backend:** NestJS (TypeScript), CQRS
- **ORM:** Prisma
- **DB:** PostgreSQL (Docker Compose ile)
- **Test:** Jest
- **Diğer:** date-fns, class-validator

## Mimari

- **domain/**: İş kuralları, entity/VO/event tanımları
- **application/**: Komut & sorgu handler’ları (CQRS), iş akışları
- **infrastructure/**: Prisma servisleri, dosya sistemi, guard’lar
- **api/**: Controller’lar

**Event Bus:** In-process (Nest `@nestjs/cqrs`).

## Veri Modeli

```sql
requests(id, citizen_name, phone, address, category, description, status, created_at, assigned_to, resolved_at)
surveys(id, request_id, invited_at, score, comment, answered_at)
```

> Gerçek şema ve indeksler Prisma migration dosyalarındadır.

## Kurulum

### Gereksinimler

- Docker & Docker Compose
- Node.js 18+

### Adımlar

1. Depoyu klonlayın ve kökte bir `.env` oluşturun (aşağıdaki şablona bakın).
2. Veritabanını başlatın:
   ```bash
   docker compose up -d
   ```
3. Prisma hazırlığı:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

## Ortam Değişkenleri

Örnek `.env` içeriği:

```
PORT=5000
OPERATOR_API_KEY=op-key-123
REPORT_API_KEY=rep-key-456
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hizliisler?schema=public
EXPORT_OUT_DIR=out/sftp
EXPORT_DELIMITER=;
TZ=Europe/Istanbul
```

Açıklamalar:

- **DATABASE\_URL:** Prisma bağlantı dizesi.
- **EXPORT\_OUT\_DIR:** CSV’nin yazılacağı göreli klasör.
- **EXPORT\_DELIMITER:** CSV ayırıcı (`;` önerilir).
- **TZ:** Cron ve tarih formatlaması için saat dilimi.

## Uygulamayı Çalıştırma

Geliştirme:

```bash
npm run start:dev
```

Prod:

```bash
npm run build
npm run start:prod
```

Uygulama: [**http://localhost:5000**](http://localhost:5000)

> Host makinede raporları görebilmek için API servisine `./out:/app/out` bind mount vermeniz önerilir.

## API

### Talepler

- **POST** `/api/requests` — Talep oluşturma
- **PATCH** `/api/requests/{id}/assign` — Atama
- **PATCH** `/api/requests/{id}/resolve` — Çözüldü yap (olay tetiklenir)

### Anketler

- **POST** `/api/surveys/{requestId}/answer` — Yanıt gönder (`{ score: 1..5, comment?: string }`)

### Metrikler

- **GET** `/api/metrics/summary` — `{ avg_resolution_hours, resolved_24h, avg_score }`

### Raporlama

- **POST** `/api/export/daily` — Gün sonu CSV üretimi

> PowerShell kullanıyorsanız `curl` alias’ı yerine `curl.exe` veya `Invoke-WebRequest` tercih edin.

## Güvenlik

- Header’da **X-Api-Key** beklenir.
  - **operator**: Talep uçları
  - **report**: Metrik & raporlama uçları
- Guard’lar: `AnyKeyGuard`, `ReportKeyGuard`

## Metrikler

- **avg\_resolution\_hours**: Çözülen talepler için ortalama çözüm süresi (saat)
- **resolved\_24h**: Son 24 saatte çözülen talep adedi
- **avg\_score**: Anket yanıtlarının ortalaması

## CSV Raporlama

- **Manuel:** `POST /api/export/daily`
- **Zamanlanmış:** Cron ile her gün **23:59**
- **Çıktı klasörü:** `./out/sftp/`
- **Dosya adı:** `YYYY-MM-DD_HHmmss_survey_report.csv`
- **Başlık:** `request_id;score;comment;answered_at`
- **Kaçışlama:** Çift tırnaklar CSV standardına göre iki kez yazılır (`""`).

> Dosya adını sadece tarih olacak şekilde değiştirmek isterseniz export handler’daki format satırını güncellemeniz yeterlidir.

## Testler

Jest ile birim ve basit entegrasyon testleri:

```bash
npm run test
# veya ayrıntılı çıktı
npm run test -- --verbose
```

