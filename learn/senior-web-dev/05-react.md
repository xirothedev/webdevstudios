# L5 — React

## 5.1 Render model & keys

UI = f(state). State đổi → React gọi lại f với state mới → diff cây mới/cũ → sửa DOM tối thiểu.

```jsx
// key sai: reorder list = React tưởng đổi nội dung
items.map((it, i) => <Row key={i} value={it} />)   // index-as-key
items.map(it => <Row key={it.id} value={it} />)    // id ổn định
```
Với `key={i}`: thêm item vào ĐẦU → mọi item lệch key → React re-render + reuse DOM sai chỗ, state của input trong Row dính nhầm dòng. Key = danh tính, không phải vị trí.

## 5.2 Fiber (đủ để nói chuyện senior)

React chia render thành các unit nhỏ (fiber = 1 unit công việc), rendering có thể bị CẮT GIỮA khi có update ưu tiên cao (typing thắng data fetch). 2 phase:
- render phase: tính toán, CÓ THỂ bị bỏ/hủy → vì vậy KHÔNG được có side effect trong render body
- commit phase: áp dụng lên DOM, đồng bộ, không bị ngắt

Đây là gốc của "render phải thuần khiết" — không phải lời khuyên thẩm mỹ.

## 5.3 State: không phải biến

```jsx
setCount(count + 1); setCount(count + 1);  // +1, vì count là GIÁ trị tại render này
setCount(c => c + 1); setCount(c => c + 1); // +2 — updater nhận giá trị mới nhất
```
Batch: cả 2 lời gọi gộp 1 render. `useState` không "sửa" gì — nó xếp lịch render kế tiếp với giá trị mới.

## 5.4 Effect — hiểu đúng trong 1 ví dụ

Effect = đồng bộ app với hệ thống ngoài (socket, DOM API, subscription). KHÔNG dùng cho: biến đổi dữ liệu, fetch dữ liệu server (dùng react-query/server component), "chạy sau render".

```jsx
// ĐÚNG: có cleanup vì effect chạy lại mỗi deps đổi
useEffect(() => {
  const id = setInterval(() => setT(t => t + 1), 1000);
  return () => clearInterval(id);       // cleanup là PHẦN CỦA effect
}, []);

// SAI kinh điển: derived state trong effect
useEffect(() => { setFullName(first + ' ' + last); }, [first, last]); // 2 render, 1 giá trị cũ
const fullName = first + ' ' + last;    // tính ngay trong render — hết effect
```

## 5.5 Ref

`ref.current` thay đổi không gây render. Dùng đúng: handle DOM (focus, scroll), giữ giá trị "phi render" (id của interval, giá trị trước để so sánh).

```jsx
const inputRef = useRef(null);
<button onClick={() => inputRef.current.focus()}>Focus</button>
```
React 19: function component nhận `ref` như prop thường — `forwardRef` hết bắt buộc.

## 5.6 Memoization — đo trước, đừng mù quáng

```jsx
const sorted = useMemo(() => heavySort(items), [items]);  // thắng khi items ổn định (referential equality)
```
Thua khi: `items` là array mới mỗi render (`props.items.filter(...)`) → memo recompute mọi lần + phí so sánh. `React.memo` thua khi prop là object/function khai báo inline. Rule: mặc định KHÔNG memo; thêm khi profiler chỉ ra render đắt.

## 5.7 Context

Context đổi = re-render MỌI consumer. Tách theo tần suất:

```jsx
<Ctx.Provider value={{ theme }}>      // theme đổi ít
<Ctx.Provider value={{ user, setUser }}>   // user đổi nhiều — tách 2 context
```
State đổi liên tục (cursor, drag): dùng zustand với selector (`useStore(s => s.x)`) thay vì context — selector chỉ re-render khi lát cắt đó đổi.

## 5.8 Suspense & concurrent

```jsx
const Chat = lazy(() => import('./Chat'));
<Suspense fallback={<Skeleton />}>        // fallback thay khi chưa xong
  <Chat />
</Suspense>
const [isPending, start] = useTransition();  // update background: UI cũ vẫn click được
start(() => setTab('settings'));
```
`use()` (React 19): unwrap promise/context ngay trong render, suspend tới khi resolve.

## 5.9 Forms với Actions

```jsx
function Search() {
  const [state, action] = useActionState(search, null);
  return (
    <form action={action}>
      <input name="q" defaultValue={state?.q} />
      {state?.pending && <Spinner />}
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
// server action / useActionState: form hoạt động cả khi JS chưa hydrate
```
Controlled khi cần validate từng keystroke; uncontrolled + FormData khi chỉ cần giá trị lúc submit (đỡ re-render mỗi phím).

## 5.10 Component API design (điểm senior)

Thay vì 20 boolean props:

```jsx
// props explosion
<Panel title icon showFooter footerText onClose />
// composition: children-as-slot
<Panel>
  <Panel.Header><Icon/><Title/></Panel.Header>
  <Panel.Body/>
  {onClose && <Panel.Footer onClose={onClose}/>}   // logic nằm chỗ NGƯỜI DÙNG quyết định
</Panel>
```

## 5.11 Anti-patterns nhận diện nhanh

- sync props vào state lúc mount (`useState(props.x)` — đổi props không theo) → stateless hoặc `key` reset
- fetch trong useEffect + loading state tự chế → server-state library hoặc RSC
- "prop drilling" sâu 5 tầng → context đúng loại (thường xuyên đổi? tách context) hoặc composition

## 5.12 Server components — ranh giới tư duy

Server component = chạy 1 lần lúc render server, output là serialized tree, KHÔNG gửi code xuống client. Client component = chạy trên browser. Đây là cầu nối sang L6.

**Check cuối tầng:** giải thích vì sao code chạy trong render body (fetch, log, random) là bug chứ không phải "code chạy mỗi render" bình thường — dựa trên 5.2.
