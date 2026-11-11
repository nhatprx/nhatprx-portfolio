# Developer Portfolio (React 19 + Tailwind CSS + Three.js + Ponytail Rules)

Dự án Portfolio dành cho Developer được tối ưu hóa với giao diện hiện đại, canvas 3D tương tác bằng Three.js và tích hợp sẵn **Ponytail Rules** để giữ cho code luôn tinh gọn, chuẩn senior và chống over-engineering.

---

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (hiệu năng cao, cú pháp `@import "tailwindcss"`)
- **3D Graphics**: [Three.js](https://threejs.org), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Icons**: [Lucide React](https://lucide.dev) & Semantic SVG primitives
- **AI Coding Guidelines**: [Ponytail Rules](https://github.com/DietrichGebert/ponytail) (Lazy Senior Dev Mode)

---

## ⚡ Bắt đầu phát triển

1. **Khởi chạy Development Server:**
   ```bash
   npm run dev
   ```
2. **Build Production:**
   ```bash
   npm run build
   ```
3. **Preview bản Build:**
   ```bash
   npm run preview
   ```

---

## 📂 Cấu trúc dự án

```text
nhatprx-portfolio/
├── AGENTS.md                  # Ponytail rules chính cho AI coding assistants
├── .agents/
│   └── rules/
│       └── ponytail.md        # Antigravity project rules
├── .cursor/
│   └── rules/
│       └── ponytail.mdc       # Cursor rules
├── src/
│   ├── components/
│   │   ├── ThreeCanvas.tsx    # Scene 3D tương tác (MeshDistort, Particles)
│   │   ├── Navbar.tsx         # Thanh điều hướng responsive
│   │   ├── Hero.tsx           # Hero section kết hợp 3D Canvas
│   │   ├── About.tsx          # Giới thiệu & thế mạnh cốt lõi
│   │   ├── Skills.tsx         # Danh mục kỹ năng & tech stack
│   │   ├── Projects.tsx       # Showcase dự án tiêu biểu
│   │   ├── Experience.tsx     # Timeline kinh nghiệm làm việc
│   │   ├── Contact.tsx        # Form liên hệ & social links
│   │   └── Footer.tsx         # Chân trang
│   ├── data/
│   │   └── portfolioData.ts   # Toàn bộ thông tin cá nhân, dự án, kỹ năng
│   ├── index.css              # Tailwind CSS imports & theme setup
│   ├── App.tsx                # Trang chủ tích hợp các components
│   └── main.tsx               # Entry point
└── vite.config.ts             # Cấu hình Vite & Tailwind plugin
```

---

## ✏️ Cách tùy biến Portfolio của bạn

Mọi thông tin về dự án, kỹ năng, kinh nghiệm và mạng xã hội được tách riêng tại **`src/data/portfolioData.ts`**. Bạn chỉ cần cập nhật file này để thay đổi thông tin portfolio:
- **`personal`**: Tên, role, bio, link GitHub, LinkedIn, email.
- **`skills`**: Các kỹ năng phân theo nhóm (Frontend, 3D, Backend, DevOps).
- **`projects`**: Danh sách dự án (tiêu đề, mô tả, tags, link github, live demo).
- **`experience`**: Quá trình làm việc / timeline.

Muốn đổi hiệu ứng hoặc vật thể 3D, hãy chỉnh sửa **`src/components/ThreeCanvas.tsx`**.

---

## 🧘‍♂️ Ponytail Rules là gì?

Dự án này đã được cài đặt sẵn bộ quy tắc **Ponytail** (`AGENTS.md`, `.agents/rules/ponytail.md`, `.cursor/rules/ponytail.mdc`).

Triết lý cốt lõi: *"The best code is the code never written"* (Code tốt nhất là dòng code không cần phải viết).
Khi bạn yêu cầu bất kỳ AI nào (Antigravity, Cursor, Claude Code, Copilot) code thêm tính năng:
1. AI sẽ ưu tiên giải pháp tinh gọn nhất, không thêm thư viện thừa, không tạo wrapper boilerplate không cần thiết.
2. Tận dụng tối đa native web primitives và Tailwind utility classes.
3. Luôn bảo toàn tính an toàn, bảo mật, xử lý lỗi và khả năng tiếp cận (Accessibility / a11y).
