import { encrypt, decrypt, sign, verify } from '../lib/brainpool.js'

/**
 * Đọc file và chuyển thành Uint8Array
 */
export async function readFileAsUint8Array(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(new Uint8Array(e.target.result))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Chuyển Uint8Array thành Base64
 */
export function uint8ArrayToBase64(array) {
  let binary = ''
  for (let i = 0; i < array.byteLength; i++) {
    binary += String.fromCharCode(array[i])
  }
  return btoa(binary)
}

/**
 * Chuyển Base64 thành Uint8Array
 */
export function base64ToUint8Array(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Tạo file từ Uint8Array và download
 */
export function downloadFile(data, filename) {
  const blob = new Blob([data], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Mã hoá file
 */
export async function encryptFile(file, publicKeyPem) {
  try {
    const fileData = await readFileAsUint8Array(file)
    const fileBase64 = uint8ArrayToBase64(fileData)
    
    // Tạo payload: filename + base64 content
    const payload = JSON.stringify({
      filename: file.name,
      size: file.size,
      type: file.type,
      data: fileBase64,
      timestamp: new Date().toISOString()
    })
    
    const encryptedB64 = await encrypt(payload, publicKeyPem)
    return encryptedB64
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`)
  }
}

/**
 * Giải mã file
 */
export async function decryptFile(encryptedB64, privateKeyPem) {
  try {
    const decryptedPayload = await decrypt(encryptedB64, privateKeyPem)
    const payload = JSON.parse(decryptedPayload)
    
    const fileData = base64ToUint8Array(payload.data)
    return {
      filename: payload.filename,
      data: fileData,
      size: payload.size,
      type: payload.type,
      timestamp: payload.timestamp
    }
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`)
  }
}

/**
 * Ký file
 */
export async function signFile(file, privateKeyPem) {
  try {
    const fileData = await readFileAsUint8Array(file)
    const fileBase64 = uint8ArrayToBase64(fileData)
    
    const payload = JSON.stringify({
      filename: file.name,
      size: file.size,
      type: file.type,
      data: fileBase64,
      timestamp: new Date().toISOString()
    })
    
    const signature = await sign(payload, privateKeyPem)
    
    // Tạo file chứa signature metadata
    const signedData = {
      filename: file.name,
      size: file.size,
      type: file.type,
      timestamp: new Date().toISOString(),
      signature: signature,
      fileBase64: fileBase64
    }
    
    return JSON.stringify(signedData, null, 2)
  } catch (error) {
    throw new Error(`Signing failed: ${error.message}`)
  }
}

/**
 * Xác minh file đã ký
 */
export async function verifyFile(signedDataJson, publicKeyPem) {
  try {
    const signedData = JSON.parse(signedDataJson)
    
    const payload = JSON.stringify({
      filename: signedData.filename,
      size: signedData.size,
      type: signedData.type,
      data: signedData.fileBase64,
      timestamp: signedData.timestamp
    })
    
    const isValid = await verify(payload, signedData.signature, publicKeyPem)
    
    return {
      isValid,
      filename: signedData.filename,
      size: signedData.size,
      type: signedData.type,
      timestamp: signedData.timestamp,
      fileData: base64ToUint8Array(signedData.fileBase64)
    }
  } catch (error) {
    throw new Error(`Verification failed: ${error.message}`)
  }
}

/**
 * Export encrypted file
 */
export function downloadEncryptedFile(encryptedB64, filename = 'file.encrypted') {
  const payload = {
    version: '1.0',
    encrypted: encryptedB64,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Import encrypted file
 */
export async function importEncryptedFile(file) {
  try {
    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
    
    const payload = JSON.parse(text)
    return payload.encrypted
  } catch (error) {
    throw new Error(`Import failed: ${error.message}`)
  }
}

/**
 * Export signed file
 */
export function downloadSignedFile(signedDataJson, filename = 'file.signed') {
  const blob = new Blob([signedDataJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Import signed file
 */
export async function importSignedFile(file) {
  try {
    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
    
    return text
  } catch (error) {
    throw new Error(`Import failed: ${error.message}`)
  }
}
