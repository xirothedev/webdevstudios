# Nền tảng React vững, zero Vue

User xác nhận vững React: hooks (useState/useMemo/useEffect), react-hook-form, Next App Router — và vừa theo sát toàn bộ quá trình port apps/web → apps/web-vue (đọc được diff Vue do agent sinh, hỏi đúng chỗ: `<script setup>`, `v-if`, `v-for`, so sánh RHF).

Implication: dạy Vue theo chế độ "React → Vue mapping", bỏ qua mọi thứ HTML/JS căn bản. ZPD hiện tại: cơ chế reactivity (ref/computed) vì đó là chỗ tư duy React gây nhiễu nhiều nhất (mutation vs immutable, không có re-render).
