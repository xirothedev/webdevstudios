# L2 — TypeScript

## 2.1 Structural typing, `unknown` vs `any` vs `never`

TS so sánh HÌNH DẠNG, không so tên. Object có đủ field thì nhận, không cần cùng "class".

```ts
type Point = { x: number; y: number };
const p: Point = { x: 1, y: 2, z: 3 }; // OK — thừa field khi gán trực tiếp mới bị chặn
declare const q: { x: number; y: number; z: number };
const r: Point = q; // OK — structural: q "to hơn" Point vẫn nhận

any     // tắt type-check, lan sang mọi thứ chạm vào → cấm dùng
unknown // giá trị chưa biết: buộc phải narrow trước khi dùng
never   // không có giá trị nào: return của function throw, exhaustive check
```
Dùng `never` để ép exhaustive:
```ts
function shapeArea(s: Circle | Square): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.r ** 2;
    case 'square': return s.side ** 2;
    default: { const _: never = s; return _; } // thêm Shape mới → compile error, không lọt
  }
}
```

## 2.2 Narrowing & type predicate

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function unwrap<T>(r: Result<T>): T {
  if (r.ok) return r.value;        // sau if: r được narrow còn nhánh ok:true
  throw new Error(r.error);
}

function isUser(x: unknown): x is { id: string } {   // type predicate
  return typeof x === 'object' && x !== null && 'id' in x;
}
```

## 2.3 Generics & conditional types

```ts
function last<T>(arr: T[]): T | undefined { return arr.at(-1); }

type Unwrap<T> = T extends Promise<infer U> ? Unwrap<U> : T;  // recursive infer
type A = Unwrap<Promise<Promise<string>>>; // string

type First<T extends readonly unknown[]> = T extends [infer F, ...unknown[]] ? F : never;
```

## 2.4 Utility types — phải tự viết lại được

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyOmit<T, K extends keyof any> = MyPick<T, Exclude<keyof T, K>>;
type MyAwaited<T> = T extends PromiseLike<infer U> ? MyAwaited<U> : T;
```
Interview hay hỏi: "Omit và Pick khác gì, viết Pick từ `keyof`".

## 2.5 Mapped & template literal types

```ts
type Keys<T> = keyof T;
type Val<T, K extends keyof T> = T[K];                 // indexed access
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };
type G = Getters<{ name: string }>;  // { getName: () => string }
```

## 2.6 strict flags — từng flag giải thích được

- `strictNullChecks`: `string` không nhận `null`. Bug nó chặn: `user.profile.name` khi profile undefined.
- `noUncheckedIndexedAccess`: `arr[i]` là `T | undefined`. Chặn giả định array đủ dài.
- `exactOptionalPropertyTypes`: `?` nghĩa là "có thể không có key", KHÔNG phải "được gán undefined".
- Bật cả 4 trong tsconfig base của monorepo — org rule, interview thấy bạn bật = điểm.

## 2.7 interface vs type

```ts
interface Cfg { url: string }
interface Cfg { retries?: number }   // merge tự động — type không làm được
type Cfg2 = { url: string };
// type Cfg2 = Cfg2 | string         // recursive union: type làm được
```
Rule of thumb: public API của package = interface (người khác merge được); nội bộ = type.

## 2.8 ESM vs CJS

```jsonc
// package.json
{ "type": "module" }        // .js = ESM; cần CJS thì đặt .cjs
```
```ts
import fs from 'node:fs';   // ESM
const fs = require('fs');   // CJS — không có trong "type":"module"
```
Dual package hazard: lib ship cả 2 bản, 2 instance của cùng class → `instanceof` fail. Senior đọc `exports` map trong package.json lib trước khi dùng.

## 2.9 tsconfig: 3 khóa không nhầm nhau

- `target` / `lib`: code sinh ra ES mấy / có sẵn type API nào (DOM, ES2022)
- `module`: cú pháp import/module nào được preserve
- `moduleResolution`: TÌM file trên đĩa bằng chiến lược nào (`bundler` cho Next, `node16` cho Nest ESM)

Project references: `composite: true` để build từng package độc lập + incremental.

## 2.10 Type erasure: type biến mất lúc chạy

```ts
enum Role { Admin }        // runtime sinh object Role — tree-shaking khó, prefer const object
const as = data as User;   // KHÔNG kiểm tra gì runtime. `as` không phải validator.
// Input thật từ HTTP: dùng zod/class-validator — org dùng class-validator pipeline (L8.5)
```

## 2.11 Declaration & augmentation

```ts
declare module 'fastify' { interface FastifyRequest { user?: User } } // thêm field vào lib
```

## 2.12 tsc vs transpile-only

SWC/esbuild chỉ XÓA type (nhanh, không đọc type). Type lỗi vẫn chạy được → CI bắt buộc chạy `tsc --noEmit` riêng, không tin "build pass".

## 2.13 Pattern thực chiến

```ts
type Brand<T, B> = T & { __brand: B };
type OrderId = Brand<string, 'OrderId'>;
function getOrder(id: OrderId) {}
getOrder('abc' as OrderId);  // chỗ cast duy nhất: ranh giới DB/HTTP
```

**Check:** viết `type Paths<T>` sinh mọi đường `"user.address.city"` cho object lồng nhau, không tra Google.
