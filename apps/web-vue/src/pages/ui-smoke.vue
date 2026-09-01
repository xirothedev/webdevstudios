<script setup lang="ts">
import { User as UserIcon } from 'lucide-vue-next';
import { ref } from 'vue';

import { AnimatedBeam } from '@/components/ui/animated-beam.vue';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.vue';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid.vue';
import { Button } from '@/components/ui/button.vue';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.vue';
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.vue';
import { Input } from '@/components/ui/input.vue';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu.vue';
import { NumberTicker } from '@/components/ui/number-ticker.vue';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.vue';

const content = ref('');
const containerRef = ref<HTMLElement | null>(null);
const fromRef = ref<HTMLElement | null>(null);
const toRef = ref<HTMLElement | null>(null);
const chartConfig: ChartConfig = { revenue: { label: 'Revenue', color: '#F7931E' } };
</script>

<template>
  <div ref="containerRef" class="relative">
    <span ref="fromRef">A</span>
    <span ref="toRef">B</span>
    <AnimatedBeam :container-ref="containerRef" :from-ref="fromRef" :to-ref="toRef" />

    <Button>click</Button>
    <Input placeholder="x" />
    <NumberTicker :value="42" />

    <Avatar>
      <AvatarImage src="/a.png" />
      <AvatarFallback>U</AvatarFallback>
    </Avatar>

    <Card>
      <CardHeader>
        <CardTitle>t</CardTitle>
        <CardDescription>d</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>h</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>c</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button>menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>L</DropdownMenuLabel>
        <DropdownMenuItem>one</DropdownMenuItem>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>

    <NavigationMenu :viewport="false">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="/x">x</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>

    <BentoGrid>
      <BentoCard
        name="n"
        class-name="col-span-1"
        :background="null as any"
        :Icon="UserIcon"
        description="d"
        href="/x"
        cta="go"
      />
    </BentoGrid>

    <ChartContainer :config="chartConfig" class="h-[300px] w-full">
      <div>canvas slot</div>
    </ChartContainer>
    <ChartLegendContent :payload="[{ dataKey: 'revenue', value: 1, color: '#000' }]" />
    <ChartTooltipContent :payload="[{ dataKey: 'revenue', value: 1, color: '#000' }]" />

    <MarkdownEditor v-model="content" theme="dark" placeholder="hi" />
  </div>
</template>
