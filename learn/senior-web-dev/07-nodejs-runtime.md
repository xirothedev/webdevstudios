# L7 — Node.js runtime (backend)

## 7.1 Process model

Event loop 6 phase: timers → pending → idle → poll (I/O) → check (setImmediate) → close. Microtask queue drain GIỮA MỖI callback.

```js
// CPU-bound giết cả loop — 1 thread phục vụ MỌI request
app.get('/pdf', (req, res) => res.send(hugeSyncParse(buf)));  // 800ms block → mọi request khác chờ
// đúng:
const worker = new Worker('./parse.js', { workerData: buf }); // worker_threads: thread riêng + event loop riêng
```
Cluster = N process × 1 core, chia qua IPC. Multi-core không tự có — 1 process Node = 1 core.

## 7.2 Streams & backpressure

Backpressure = tốc độ đọc > tốc độ ghi; stream cho phép bên chậm bảo bên nhanh CHỜ.

```js
import { pipeline } from 'node:stream/promises';
await pipeline(
  fs.createReadStream('huge.csv'),
  csvParser(),
  dbInsertStream(),          // mỗi batch await, không nạp hết RAM
);
// pipe() cũ: error giữa đường = leak fd. pipeline() luôn cleanup.
```
Interview: "vì sao export 1GB CSV không được `res.send(rows)`" → RAM spike + không có backpressure → OOM. Stream = RAM không đổi theo kích thước file.

## 7.3 Buffer

```js
Buffer.from('abc');        // OK
Buffer.alloc(1024);        // zero-filled — an toàn
Buffer.allocUnsafe(1024);  // nhanh hơn nhưng chứa RÁC bộ nhớ cũ — đọc được nếu quên ghi = leak dữ liệu người khác
```

## 7.4 fs

```js
fs.readFileSync(path);                     // block loop — production path: cấm
await fs.promises.readFile(path);          // async thread pool (L1.7: pool 4 thread)
fs.watch(path, ...)                        // OS-level, cần debounce
```
Upload file: KHÔNG ghi tạm rồi đọc lại — `pipeline(req.file.stream, fs.createWriteStream(dest))` từ stream multipart (L8.5/L10.7).

## 7.5 Child process

`spawn` (stream output, long-running) vs `exec` (buffer output, có giới hạn, command injection nếu nối chuỗi input!) vs `fork` (Node↔Node + IPC channel).
Khi nào thoát Node: CPU-heavy persist (ffmpeg, resize ảnh hàng loạt) → service Python/C hoặc queue worker, không phải thread nào trong API.

## 7.6 Memory trong container

Container limit 512MB, Node thấy HOST 16GB → heap lớn → OOMKilled bởi kernel, không phải V8.

```
node --max-old-space-size=450 server.js   hoặc NODE_OPTIONS=--max-old-space-size=450
```
Chẩn đoán OOM: `node --inspect` → DevTools heap snapshot → so 2 snapshot sau 200 request → object tăng không giảm = leak (khớp L1.9).

## 7.7 Offload pattern

Metric quyết định: event loop lag (metric của Node itself: `perf_hooks.monitorEventLoopDelay`). lag p99 > 100ms = có task dài trong loop → profile tìm thủ phạm, đẩy ra worker/queue.

## 7.8 Observability runtime

```js
// async context — Nest dùng cái này cho per-request logger
import { AsyncLocalStorage } from 'node:async_hooks';
const als = new AsyncLocalStorage();
als.run({ reqId: crypto.randomUUID() }, () => handle(req));
als.getStore().reqId;   // đọc được ở BẤT KỲ đâu trong chain, kể cả hàm sâu không nhận tham số
```
`process.env` đọc mỗi request trong hot path: chậm + config đổi âm thầm giữa chừng — đọc 1 lần lúc boot (L8.9).

## 7.9 Security runtime

- Prototype pollution: `Object.assign({}, JSON.parse(userJson))` với `{"__proto__":{"isAdmin":true}}` — guard: không merge JSON không tin cậy vào object dùng chung; bật `Object.freeze(Object.prototype)` nếu cần belt.
- `exec(`convert ${userInput}`)` = command injection. Dùng `execFile` + args array.
- Dependency có postinstall script = thực thi code lúc `npm install` (L11.8).

**Check:** giải thích vì sao `bcrypt.hashSync` trong request handler là bug ngay cả khi máy mạnh — trả lời bằng L1.7 (chung thread pool với fs).
