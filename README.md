# RanMet Web — bản thật đầu tiên

Đây là **app thật**, không còn state giả lập: Next.js 16 + Supabase (Postgres + Auth + Realtime). Phạm vi bản này: **Đăng ký/Đăng nhập → Hồ sơ → Trust → Ghép ngẫu nhiên → Chat thật (realtime)**. RanVideo/RanWorld/Creator Studio/Chat Bí Mật sẽ nối vào sau — UI của các phần đó đã có sẵn trong prototype (`RanMet_App.jsx`), chỉ cần cắm vào backend thật này ở các bước tiếp theo.

Đã build thật + lint thật, 0 lỗi (`npm run build`, `npx eslint .`) trước khi giao cho bạn.

## 1. Tạo project Supabase (miễn phí)

1. Vào [supabase.com](https://supabase.com) → tạo tài khoản → **New project**.
2. Đợi ~2 phút để project khởi tạo xong.
3. Vào **SQL Editor** (menu bên trái) → **New query** → dán toàn bộ nội dung file `supabase/schema.sql` → **Run**. Việc này tạo bảng, bật Row Level Security, và bật Realtime cho bảng tin nhắn.
4. Vào **Project Settings → API**. Copy 2 giá trị:
   - **Project URL**
   - **anon / publishable key** (Supabase gần đây đổi tên "anon key" thành "publishable key" — cùng một thứ, giao diện có thể hiện 1 trong 2 tên tuỳ thời điểm bạn đọc hướng dẫn này)

## 2. Cấu hình biến môi trường

```bash
cp .env.local.example .env.local
```
Mở `.env.local`, dán 2 giá trị vừa copy vào.

## 3. Tắt xác nhận email (để test nhanh — có thể bật lại sau)

Vào **Authentication → Providers → Email** trong Supabase Dashboard, tắt **"Confirm email"**. Nếu để bật, tài khoản mới đăng ký sẽ cần bấm link xác nhận trong email thật trước khi đăng nhập được — hợp cho bản chính thức, nhưng làm chậm việc bạn tự test.

## 4. Chạy thử ở máy

```bash
npm install
npm run dev
```
Mở `http://localhost:3000` → Đăng ký tài khoản mới → hoàn tất Onboarding → thử Ghép ngẫu nhiên.

**Lưu ý quan trọng:** thuật toán ghép cần **ít nhất 2 tài khoản** đã hoàn tất Onboarding để có người ghép cùng. Hãy đăng ký tài khoản thứ 2 (trình duyệt ẩn danh hoặc trình duyệt khác) để thấy Random Match + Chat hoạt động đầy đủ hai chiều.

## 5. Deploy lên Vercel (có link thật)

1. Đẩy code này lên GitHub (repo riêng hoặc trong repo hiện có).
2. Vào [vercel.com](https://vercel.com) → **New Project** → chọn repo vừa đẩy lên.
3. Ở bước cấu hình, thêm 2 biến môi trường giống hệt `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
4. Deploy. Xong sẽ có link dạng `https://ten-app.vercel.app` — chia sẻ được, cài lên điện thoại qua "Thêm vào màn hình chính" (Add to Home Screen) như 1 app thật.

## Cấu trúc chính

```
app/
  login/, register/     Đăng nhập / đăng ký (Server Actions)
  onboarding/            Hồ sơ 3 bước, ghi thật vào Postgres + cộng Trust
  home/                  Dashboard, hiện Trust thật
  match/                 Ghép ngẫu nhiên — gọi thuật toán thật trên dữ liệu thật
  chat/[chatId]/         Chat realtime qua Supabase Realtime (postgres_changes)
lib/
  supabase/client.js     Supabase client cho Client Component
  supabase/server.js     Supabase client cho Server Component / Server Action
  matching.js            Thuật toán ghép — giống hệt công thức trong prototype
  trust.js                Ngưỡng Trust Tier — giống hệt prototype
proxy.js                  Next.js 16 đổi tên "middleware.js" thành "proxy.js" — giữ đăng nhập
supabase/schema.sql        Toàn bộ schema + Row Level Security
```

## Việc tiếp theo (theo đúng lộ trình trong RanMet_Technical_Architecture.md)

1. **Xác minh email/tuổi thật** — bật lại "Confirm email", thêm bước xác minh giấy tờ cho Chế độ Không giới hạn.
2. **RanVideo/RanWorld** — thêm bảng `videos`, `communities` vào schema (đã có sẵn thiết kế trong tài liệu kiến trúc §4), nối UI đã có trong prototype vào Server Actions mới.
3. **Report/Trust nâng cao** — hàm `add_trust` đã sẵn sàng để nối vào luồng report 30 giây.
4. **Chat Bí Mật / E2E thật** — cần thêm thư viện mã hoá phía client (libsignal hoặc tương tự) trước khi tin nhắn rời trình duyệt; xem §6 trong tài liệu kiến trúc.
5. Khi cần app di động thật, dùng chính database Supabase này làm backend cho bản Expo/React Native — không cần xây lại phần backend.
