# Git Multi-Remote Setup

## Tổng quan

Dự án được cấu hình để push code lên 2 remote repositories cùng lúc:

- **origin**: `git@github.com:TheTerminalVietNam/savi-ecommerce-fullstack-turborepo.git`
- **xirothedev**: `git@github.com:xirothedev/webdevstudios.git`

## Cách sử dụng

### 1. Git Alias (Khuyến nghị)

Sử dụng Git alias để push lên cả 2 remotes:

```bash
# Push branch hiện tại
git push-all

# Push branch cụ thể
git push-all main
```

**Cài đặt alias** (đã được cấu hình tự động trong repo):

```bash
git config alias.push-all '!f() { branch=${1:-$(git symbolic-ref --short HEAD)}; git push origin $branch && git push xirothedev $branch; }; f'
```

### 2. NPM Script

Sử dụng script trong package.json:

```bash
# Push branch hiện tại
pnpm push:all

# Hoặc chỉ định branch
bash scripts/push-all.sh main
```

### 3. Push từng remote riêng

```bash
# Chỉ push lên origin
pnpm push:origin
# hoặc
git push origin

# Chỉ push lên xirothedev
pnpm push:xirothedev
# hoặc
git push xirothedev
```

## Cấu trúc

### Git Alias

Git alias `push-all` được cấu hình để push lên cả 2 remotes cùng lúc.

### Script

File `scripts/push-all.sh` cho phép push thủ công lên cả 2 remotes.

### Git Hook (Optional)

File `.git/hooks/pre-push` có thể được sử dụng để tự động push, nhưng Git alias được khuyến nghị hơn.

## Lưu ý

- Git alias `push-all` sẽ dừng nếu push lên `origin` thất bại
- Nếu push lên `xirothedev` thất bại, alias sẽ dừng và báo lỗi
- Script `push-all.sh` sẽ dừng nếu push lên `origin` thất bại, nhưng sẽ tiếp tục nếu chỉ `xirothedev` thất bại
- Git hook có thể được sử dụng nhưng không được khuyến nghị vì có thể gây ra vấn đề với workflow

## Troubleshooting

### Hook không chạy

Kiểm tra quyền thực thi:

```bash
chmod +x .git/hooks/pre-push
```

### Push thất bại

Kiểm tra remote đã được cấu hình đúng:

```bash
git remote -v
```

### Tắt hook tạm thời

Đổi tên file hook:

```bash
mv .git/hooks/pre-push .git/hooks/pre-push.disabled
```

Bật lại:

```bash
mv .git/hooks/pre-push.disabled .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```
