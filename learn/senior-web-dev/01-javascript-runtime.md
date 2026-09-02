# L1 — JavaScript runtime

## 1.1 Primitives vs object, tham chiếu vs giá trị

Primitives (string, number, boolean, null, undefined, symbol, bigint) copy theo giá trị. Object/array/function copy theo tham chiếu.

```js
const a = { n: 1 };
const b = a;          // b trỏ cùng object
b.n = 2;
console.log(a.n);     // 2 — không phải bản copy

const c = [1, [2]];
const d = [...c];     // shallow copy: d[1] vẫn cùng array với c[1]
d[1].push(3);
console.log(c[1]);    // [2,3] — mutate xuyên qua shallow copy
```
Deep copy thật: `structuredClone(c)` (không clone được function/DOM node).

## 1.2 `this` — quyết định tại call site, không phải lúc khai báo

```js
function who() { return this; }
who();                 // undefined (strict mode) / globalThis
const obj = { who };
obj.who();             // obj — call site là obj
const f = obj.who;
f();                   // undefined — đã mất call site
const g = f.bind(obj);
g();                   // obj — bind cố định
[1].map(obj.who);      // window/undefined — map gọi hàm trần, không qua obj
```
Arrow function: `this` lấy từ scope lexical chứa nó — vì vậy arrow không dùng làm method cần `this` của object.

Closure ví dụ interview kinh điển:
```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3,3,3 — 1 biến i
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0,1,2 — mỗi loop 1 binding
```

## 1.3 Prototype chain

`class` là sugar. Bản chất: object này delegate lên object kia.

```js
const animal = { eats() { return 'yum'; } };
const dog = Object.create(animal);
dog.barks = () => 'woof';
dog.eats();            // 'yum' — tìm không thấy ở dog → leo lên animal
Object.getPrototypeOf(dog) === animal; // true
```
`instanceof` = đi ngược prototype chain tìm `prototype` của constructor. Vì vậy `class` kế thừa = nối chain, không copy method.

## 1.4 Scope & hoisting / TDZ

```js
console.log(x);        // undefined — var được "hoist" nhưng chưa gán
var x = 1;
console.log(y);        // ReferenceError — TDZ: let tồn tại trong scope nhưng chưa tới dòng khai báo
let y = 2;
```
TDZ tồn tại để bắt lỗi dùng biến trước khi khởi tạo — `var` không có bảo vệ đó = nguồn bug kinh điển.

## 1.5 Event loop: microtask thắng macrotask

```js
console.log('1');
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
queueMicrotask(() => console.log('microtask'));
console.log('2');
// 1, 2, promise, microtask, timeout
```
Quy tắc: sau mỗi macrotask, drain HẾT microtask queue rồi mới sang việc tiếp. `setTimeout` là macrotask; `.then` là microtask.

## 1.6 Vì sao 1 thread chịu tải lớn

Vì I/O không chiếm thread: Node đăng ký socket với kernel (epoll), kernel báo khi có dữ liệu. Thread rảnh đi làm request khác.

Bug vì hiểu sai:
```js
app.get('/report', (req, res) => {
  const data = fs.readFileSync('/big.csv'); // BLOCK cả process ~3s
  res.send(data);                            // mọi request khác chờ 3s
});
// fix: await fs.promises.readFile(...) hoặc stream
```
`process.nextTick` chạy TRƯỚC cả microtask promise — dùng nội bộ Node, app code hiếm khi cần.

## 1.7 Libuv thread pool

`fs`, DNS, crypto (scrypt/bcrypt) KHÔNG chạy trên event loop — chúng mượn thread pool, mặc định 4.

Hệ quả interview: chạy bcrypt (CPU-bound) trên 20 req/s → pool 4 thread nghẽn → fs cũng chậm theo (chung pool). Fix: `UV_THREADPOOL_SIZE=16`, hoặc đẩy hashing sang worker/service riêng.

## 1.8 Async: error propagation & combinators

```js
// await trong loop = tuần tự CÓ Ý THỨC
for (const id of ids) results.push(await getUser(id));   // tổng = sum latency
await Promise.all(ids.map(id => getUser(id)));           // tổng = max latency, nhưng 1 fail → fail hết
await Promise.allSettled(ids.map(id => getUser(id)));    // không fail, tự xử lý từng result
```
```js
// unhandled rejection: promise không ai bắt
fetchUser(id).catch(handle);           // đúng
try { await fetchUser(id); } catch(e) {} // đúng
fetchUser(id);                          // SAI — crash Node 15+ default
```

## 1.9 GC & memory leak kinh điển

GC mark-sweep: object không còn reference từ root (stack, global) mới bị thu dọn. Leak = bạn còn giữ reference mà không biết.

```js
// leak 1: listener không remove (thường gặp khi component re-render/register lặp)
bus.on('tick', handler);            // mỗi lần setup thêm 1 handler
return () => bus.off('tick', handler); // cleanup mới là fixes

// leak 2: closure giữ object lớn
function makeCache() {
  const huge = loadBigData();       // 500MB
  return () => huge.version;        // huge không được GC vì closure giữ
}

// leak 3: Map làm cache không eviction
cache.set(req.url, res);            // không bao giờ xoá → fix: Map có TTL / lru-cache
```

## 1.10 JSON giới hạn & structuredClone

```js
JSON.parse(JSON.stringify({ d: new Date(), m: new Map(), fn: () => {} }));
// Date → string "2026-...", Map → {}, fn bị LOẠI BỎ. JSON không có kiểu này.
const cycle = {}; cycle.self = cycle;
JSON.stringify(cycle);              // TypeError
structuredClone(cycle);             // OK
```

## 1.11 Errors

```js
class DomainError extends Error {
  constructor(msg, public code) { super(msg); this.name = 'DomainError'; }
}
try { throw new DomainError('out of stock', 'OUT_OF_STOCK'); }
catch (e) {
  if (e instanceof DomainError) return handle(e.code); // lỗi nghiệp vụ: map code
  throw e;                        // lỗi lạ: ném tiếp, đừng swallow
}
finally { release(); }            // finally chạy kể cả có return trong try
```
Quy tắc senior: lỗi nghiệp vụ dự đoán được → Result/code; lỗi bất thường → exception + crash-loud + boundary transform ở L8.

**Check cuối tầng:** giải thích được vì sao
```js
for (const x of [1,2,3]) { await fetch(x); }        // chậm tổng = 3 lần
```
và khi nào bạn CHỌN giữ tuần tự (rate limit phía server, transaction thứ tự).
