# ECC (Brainpool P-512) — README

## **Tổng quan**

Thư mục này chứa một triển khai thuần JS cho Brainpool P-512 (RFC 5639). Tính năng chính:
- **Sinh khoá**: private/public (BigInt scalar, điểm EC).
- **Ký/Chứng thực**: ECDSA với SHA-512.
- **Mã hoá/giải mã**: ECIES-style (ephemeral ECDH → SHA-512 KDF → AES-256-CBC + HMAC-SHA256).
- **Encode/Decode**: PEM-like export/import cho private/public (public uncompressed 0x04||X||Y).

File chính: [src/lib/brainpool.js](src/lib/brainpool.js#L1-L400)

## **Đường cong**

- **Tên**: brainpoolP512r1
- **Tiêu chuẩn**: RFC 5639
- **Kích thước**: 512-bit (tọa độ X/Y = 64 bytes)

## **API — Hàm chính và mô tả**

- **generateAndExportKeyPair()**: Sinh cặp khoá. Trả về object với `privateKeyPem` và `publicKeyPem` (PEM-like). Private là 64-byte scalar; public là uncompressed point (129 bytes).

- **sign(message, privateKeyPem)**: Ký ECDSA SHA-512. Tham số: `message` (string hoặc Uint8Array), `privateKeyPem` (PEM-like). Trả về signature base64 (128 bytes: r||s).

- **verify(message, signatureB64, publicKeyPem)**: Xác minh ECDSA. Trả `true|false`.

- **encrypt(plaintext, publicKeyPem)**: ECIES-style encrypt. Trả base64 gồm R||IV||ciphertext||MAC.

- **decrypt(ciphertextB64, privateKeyPem)**: Giải mã ECIES-style. Trả plaintext string hoặc ném lỗi khi MAC/định dạng sai.

- **computeFingerprint(publicKeyPem)**: SHA-256 fingerprint của public key, trả chuỗi hex dạng AA:BB:CC...

## **Chi tiết kỹ thuật ngắn**

- Toán học: toàn bộ bằng `BigInt` và toán modular tùy biến (mod, modInv, pointAdd/pointDouble, pointMul).
- Public key encode: uncompressed form `0x04 || X (64) || Y (64)`.
- ECIES derivation: `K = SHA-512(S.x)` → `encKey = K[0..31]` (AES-256), `macKey = K[32..63]` (HMAC-SHA256).
- AES mode: AES-256-CBC, IV 16 bytes; HMAC bao phủ `IV||ciphertext`.

## **Ví dụ sử dụng (tóm tắt)**

1. Sinh khoá và xuất:

```js
import { generateAndExportKeyPair } from './src/lib/brainpool.js'
const { privateKeyPem, publicKeyPem } = generateAndExportKeyPair()
```

2. Ký và xác minh:

```js
const sig = await sign('message', privateKeyPem)
const ok = await verify('message', sig, publicKeyPem)
```

3. Mã hoá / giải mã:

```js
const ct = await encrypt('hello', publicKeyPem)
const pt = await decrypt(ct, privateKeyPem)
```

## **Lưu ý bảo mật**

- Hiện tại hàm `sign` dùng `k` ngẫu nhiên; xem xét dùng RFC 6979 để tránh rủi ro nếu RNG có vấn đề.
- AES-CBC cần cẩn trọng với padding oracle — thư viện kiểm tra MAC trước khi decrypt, tránh leak lỗi chi tiết.
- Triển khai BigInt bằng JS có thể chậm so với thư viện native / WebCrypto. Sử dụng cho tính năng client-side hoặc fallback.

## **Muốn thêm**

(http://localhost:5173/)
