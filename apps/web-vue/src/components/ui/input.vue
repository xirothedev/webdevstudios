<script lang="ts">
import { h, type VNode } from 'vue';

import { cn } from 'cn';

export function Input(props: any, { attrs }: any): VNode {
  return h('input', {
    ...attrs,
    'data-slot': 'input',
    class: cn(
      'flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-sm transition-all placeholder:text-white/40',
      'focus:border-wds-accent focus:ring-wds-accent/20 focus:bg-white/10 focus:ring-2 focus:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-50',
      attrs.class,
    ),
  });
}

export default Input;
</script>
