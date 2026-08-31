<script setup lang="ts">
import { Motion } from 'motion-v';

interface SizeMeasurement {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
  sleeve: string;
}

const sizeChart: SizeMeasurement[] = [
  { size: 'S', chest: '48-50cm', length: '68cm', shoulder: '42cm', sleeve: '20cm' },
  { size: 'M', chest: '52-54cm', length: '70cm', shoulder: '44cm', sleeve: '21cm' },
  { size: 'L', chest: '56-58cm', length: '72cm', shoulder: '46cm', sleeve: '22cm' },
  { size: 'XL', chest: '60-62cm', length: '74cm', shoulder: '48cm', sleeve: '23cm' },
];

withDefaults(defineProps<{ title?: string; delay?: number }>(), {
  title: 'Bảng size',
  delay: 0.3,
});
</script>

<template>
  <Motion
    as="section"
    id="size-guide"
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.6, delay }"
    class="mt-20 scroll-mt-24"
  >
    <div class="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <h2 class="mb-6 text-2xl font-bold text-white">{{ title }}</h2>
      <p class="mb-6 text-sm text-white/60">
        Đo kích thước áo của bạn để chọn size phù hợp nhất. Tất cả số đo được tính bằng cm.
      </p>

      <!-- Size Chart Table -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-white/10">
              <th class="bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/90">
                Size
              </th>
              <th class="bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/90">
                Chiều rộng ngực
              </th>
              <th class="bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/90">
                Chiều dài áo
              </th>
              <th class="bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/90">
                Chiều rộng vai
              </th>
              <th class="bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/90">
                Chiều dài tay áo
              </th>
            </tr>
          </thead>
          <tbody>
            <Motion
              v-for="(row, index) in sizeChart"
              :key="row.size"
              as="tr"
              :initial="{ opacity: 0, x: -20 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ duration: 0.4, delay: delay + index * 0.1 }"
              class="border-b border-white/5 transition-colors hover:bg-white/5"
            >
              <td class="px-4 py-3">
                <span class="text-wds-accent font-semibold">{{ row.size }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-white/70">{{ row.chest }}</td>
              <td class="px-4 py-3 text-sm text-white/70">{{ row.length }}</td>
              <td class="px-4 py-3 text-sm text-white/70">{{ row.shoulder }}</td>
              <td class="px-4 py-3 text-sm text-white/70">{{ row.sleeve }}</td>
            </Motion>
          </tbody>
        </table>
      </div>

      <!-- Measurement Guide -->
      <div class="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 class="text-wds-accent mb-4 text-lg font-semibold">Hướng dẫn đo</h3>
        <ul class="space-y-3 text-sm text-white/70">
          <li class="flex items-start gap-3">
            <span class="text-wds-accent mt-1 font-semibold">•</span>
            <span>
              <strong class="text-white/90">Chiều rộng ngực:</strong> Đo vòng quanh phần rộng nhất
              của ngực, thường là dưới nách
            </span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-wds-accent mt-1 font-semibold">•</span>
            <span>
              <strong class="text-white/90">Chiều dài áo:</strong> Đo từ điểm cao nhất của vai xuống
              đến phần dưới cùng của áo
            </span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-wds-accent mt-1 font-semibold">•</span>
            <span>
              <strong class="text-white/90">Chiều rộng vai:</strong> Đo từ điểm cuối vai này sang
              điểm cuối vai kia
            </span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-wds-accent mt-1 font-semibold">•</span>
            <span>
              <strong class="text-white/90">Chiều dài tay áo:</strong> Đo từ điểm nối tay áo với
              thân áo xuống đến cổ tay
            </span>
          </li>
        </ul>
      </div>

      <!-- Note -->
      <div class="bg-wds-accent/10 mt-6 rounded-lg p-4">
        <p class="text-sm text-white/80">
          <strong class="text-wds-accent">Lưu ý:</strong> Số đo có thể chênh lệch ±2cm tùy thuộc vào
          cách đo. Nếu bạn ở giữa hai size, chúng tôi khuyên bạn chọn size lớn hơn để thoải mái hơn.
        </p>
      </div>
    </div>
  </Motion>
</template>
