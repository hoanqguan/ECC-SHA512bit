# ECC (Brainpool P-512) — README

## **Tổng quan**

Thư mục này chứa một triển khai thuần JS cho Brainpool P-512 (RFC 5639). Tính năng chính:
- **Sinh khoá**: private/public (BigInt scalar, điểm EC).
- **Ký/Chứng thực**: ECDSA với SHA-512.
- **Mã hoá/giải mã**: ECIES-style (ephemeral ECDH → SHA-512 KDF → AES-256-CBC + HMAC-SHA256).
- **File Operations**: Mã hoá, giải mã, ký, xác minh file với metadata lưu trữ.
- **Encode/Decode**: PEM-like export/import cho private/public (public uncompressed 0x04||X||Y).

File chính: [src/lib/brainpool.js](src/lib/brainpool.js#L1-L400)

## **Đường cong**

- **Tên**: brainpoolP512r1
- **Tiêu chuẩn**: RFC 5639
- **Kích thước**: 512-bit (tọa độ X/Y = 64 bytes)

## **API — Hàm chính và mô tả**

### Core Cryptography Functions

- **generateAndExportKeyPair()**: Sinh cặp khoá. Trả về object với `privateKeyPem` và `publicKeyPem` (PEM-like). Private là 64-byte scalar; public là uncompressed point (129 bytes).

- **sign(message, privateKeyPem)**: Ký ECDSA SHA-512. Tham số: `message` (string hoặc Uint8Array), `privateKeyPem` (PEM-like). Trả về signature base64 (128 bytes: r||s).

- **verify(message, signatureB64, publicKeyPem)**: Xác minh ECDSA. Trả `true|false`.

- **encrypt(plaintext, publicKeyPem)**: ECIES-style encrypt. Trả base64 gồm R||IV||ciphertext||MAC.

- **decrypt(ciphertextB64, privateKeyPem)**: Giải mã ECIES-style. Trả plaintext string hoặc ném lỗi khi MAC/định dạng sai.

- **computeFingerprint(publicKeyPem)**: SHA-256 fingerprint của public key, trả chuỗi hex dạng AA:BB:CC...

### File Operations Functions

- **encryptFile(file, publicKeyPem)**: Mã hoá file với metadata (filename, size, type, timestamp). Trả base64 encrypted data.

- **decryptFile(encryptedB64, privateKeyPem)**: Giải mã file được mã hoá. Trả object với `{filename, data (Uint8Array), size, type, timestamp}`.

- **signFile(file, privateKeyPem)**: Ký file với ECDSA. Trả JSON string chứa metadata, signature, và file base64.

- **verifyFile(signedDataJson, publicKeyPem)**: Xác minh file đã ký. Trả object `{isValid, filename, size, type, timestamp, fileData}`.

- **downloadEncryptedFile(encryptedB64, filename)**: Tải xuống file `.encrypted` (JSON format).

- **downloadSignedFile(signedDataJson, filename)**: Tải xuống file `.signed` (JSON format).

- **importEncryptedFile(file)**: Đọc file `.encrypted` và trích encrypted data.

- **importSignedFile(file)**: Đọc file `.signed` và trích signed data.

## **Chi tiết kỹ thuật ngắn**

- Toán học: toàn bộ bằng `BigInt` và toán modular tùy biến (mod, modInv, pointAdd/pointDouble, pointMul).
- Public key encode: uncompressed form `0x04 || X (64) || Y (64)`.
- ECIES derivation: `K = SHA-512(S.x)` → `encKey = K[0..31]` (AES-256), `macKey = K[32..63]` (HMAC-SHA256).
- AES mode: AES-256-CBC, IV 16 bytes; HMAC bao phủ `IV||ciphertext`.
- File encoding: Tất cả dữ liệu file được convert sang Base64 để lưu trữ trong JSON.

## **Ví dụ sử dụng (tóm tắt)**

### 1. Sinh khoá và xuất:

```js
import { generateAndExportKeyPair } from './src/lib/brainpool.js'
const { privateKeyPem, publicKeyPem } = generateAndExportKeyPair()
```

### 2. Ký và xác minh text:

```js
const sig = await sign('message', privateKeyPem)
const ok = await verify('message', sig, publicKeyPem)
```

### 3. Mã hoá / giải mã text:

```js
const ct = await encrypt('hello', publicKeyPem)
const pt = await decrypt(ct, privateKeyPem)
```

### 4. Mã hoá file:

```js
import { encryptFile, downloadEncryptedFile } from './src/utils/fileOperations.js'

const file = document.querySelector('input[type=file]').files[0]
const encrypted = await encryptFile(file, publicKeyPem)
downloadEncryptedFile(encrypted, 'document.pdf.encrypted')
```

### 5. Giải mã file:

```js
import { decryptFile, importEncryptedFile } from './src/utils/fileOperations.js'

const encryptedFile = document.querySelector('input[type=file]').files[0]
const encryptedB64 = await importEncryptedFile(encryptedFile)
const result = await decryptFile(encryptedB64, privateKeyPem)

// result.filename, result.data (Uint8Array), result.timestamp
```

### 6. Ký file:

```js
import { signFile, downloadSignedFile } from './src/utils/fileOperations.js'

const file = document.querySelector('input[type=file]').files[0]
const signed = await signFile(file, privateKeyPem)
downloadSignedFile(signed, 'document.pdf.signed')
```

### 7. Xác minh file:

```js
import { verifyFile, importSignedFile } from './src/utils/fileOperations.js'

const signedFile = document.querySelector('input[type=file]').files[0]
const signedData = await importSignedFile(signedFile)
const result = await verifyFile(signedData, publicKeyPem)

if (result.isValid) {
  console.log('File valid:', result.filename)
  // result.fileData (Uint8Array) có thể download
} else {
  console.error('Signature invalid')
}
```

## **Định dạng File**

### Encrypted File (.encrypted)

```json
{
  "version": "1.0",
  "encrypted": "base64_encrypted_data_here",
  "timestamp": "2026-05-16T00:00:00.000Z"
}
```

### Signed File (.signed)

```json
{
  "filename": "document.pdf",
  "size": 12345,
  "type": "application/pdf",
  "timestamp": "2026-05-16T00:00:00.000Z",
  "signature": "base64_ecdsa_signature_here",
  "fileBase64": "base64_file_content_here"
}
```

## **Lưu ý bảo mật**

- Hiện tại hàm `sign` dùng `k` ngẫu nhiên; xem xét dùng RFC 6979 để tránh rủi ro nếu RNG có vấn đề.
- AES-CBC cần cẩn trọng với padding oracle — thư viện kiểm tra MAC trước khi decrypt, tránh leak lỗi chi tiết.
- Triển khai BigInt bằng JS có thể chậm so với thư viện native / WebCrypto. Sử dụng cho tính năng client-side hoặc fallback.
- File size có giới hạn do RAM availability (browser không thể handle files > vài GB).

## **Web UI**

Ứng dụng cung cấp giao diện web tại http://localhost:5173/ với các tab:
- **Sign**: Ký text/message
- **Verify**: Xác minh signature
- **Encrypt**: Mã hoá text
- **Decrypt**: Giải mã text
- **File**: Mã hoá/giải mã/ký/xác minh file
