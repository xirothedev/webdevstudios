<script lang="ts">
import {
  AvatarFallback as AvatarFallbackPrimitive,
  AvatarImage as AvatarImagePrimitive,
  AvatarRoot,
} from 'reka-ui';
import { h, type VNode } from 'vue';

import { cn } from 'cn';

function el(tag: any, base: string, slot: string) {
  return function (props: any, { attrs, slots }: any): VNode {
    return h(tag, { ...attrs, 'data-slot': slot, class: cn(base, attrs.class) }, slots.default?.());
  };
}

export const Avatar = el(
  AvatarRoot,
  'relative flex size-8 shrink-0 overflow-hidden rounded-full',
  'avatar',
);
export const AvatarImage = el(AvatarImagePrimitive, 'aspect-square size-full', 'avatar-image');
export const AvatarFallback = el(
  AvatarFallbackPrimitive,
  'bg-muted flex size-full items-center justify-center rounded-full',
  'avatar-fallback',
);

export default Avatar;
</script>
