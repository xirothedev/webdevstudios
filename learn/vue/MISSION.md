# Mission: Vue 3 (Composition API)

## Why
Hiếu muốn hiểu Vue ở tầng căn bản — mô hình reactivity, SFC, Composition API — vì tò mò trí tuệ và để đọc hiểu `apps/web-vue` (bản mirror Vue của `apps/web` do chính agent vừa port) thay vì chỉ tin nó chạy được.

## Success looks like
- Đọc một file `.vue` bất kỳ trong `apps/web-vue` và giải thích được từng dòng chạy lúc nào
- Giải thích được `ref`/`computed` khác `useState`/`useMemo` ở mức cơ chế
- Viết được component Vue nhỏ (form, list, condition) từ số 0 không cần copy pattern
- Port được một component React nhỏ sang Vue mà không cần tra từng bước

## Constraints
- Ngôn ngữ lesson: tiếng Việt
- Nền tảng: vững React (hooks, RHF, Next) — mọi khái niệm mới nên neo vào React tương đương
- Ví dụ nên lấy từ code thật trong repo (`apps/web-vue`) khi phù hợp

## Out of scope
- Nuxt / SSR (repo không dùng)
- Options API cũ, Vuex, JSX trong Vue
- Pinia (chưa dùng trong repo; có thể mở sau nếu mission đổi)
