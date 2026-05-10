// Import ECC functions from brainpool.js
import {
    generateAndExportKeyPair,
    sign,
    verify,
    encrypt,
    decrypt,
    computeFingerprint
} from './src/lib/brainpool.js';

// ============================================
// Tab Navigation
// ============================================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and tabs
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

        // Add active class to clicked button
        btn.classList.add('active');

        // Show corresponding tab
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// ============================================
// Utility Functions
// ============================================

/**
 * Show alert notification
 */
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    
    let icon = '';
    switch(type) {
        case 'success': icon = '✓'; break;
        case 'error': icon = '✕'; break;
        case 'info': icon = 'ℹ'; break;
        case 'warning': icon = '⚠'; break;
    }
    
    alertEl.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    alertContainer.appendChild(alertEl);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alertEl.style.opacity = '0';
        alertEl.style.transform = 'translateX(400px)';
        setTimeout(() => alertEl.remove(), 300);
    }, 5000);
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.value || element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Đã sao chép vào clipboard', 'success');
    }).catch(() => {
        // Fallback for older browsers
        element.select();
        document.execCommand('copy');
        showAlert('Đã sao chép vào clipboard', 'success');
    });
}

/**
 * Download file
 */
function downloadFile(elementId, filename) {
    const element = document.getElementById(elementId);
    const text = element.value || element.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showAlert(`Đã tải xuống: ${filename}`, 'success');
}

/**
 * Download key pair
 */
function downloadPrivateKey() {
    downloadFile('privateKeyOutput', 'private_key.pem');
}

function downloadPublicKey() {
    downloadFile('publicKeyOutput', 'public_key.pem');
}

/**
 * Set loading state on button
 */
function setButtonLoading(buttonId, isLoading) {
    const btn = document.getElementById(buttonId);
    const loader = btn.querySelector('.loader');
    
    if (isLoading) {
        btn.disabled = true;
        btn.classList.add('loading');
        loader.style.display = 'inline-block';
    } else {
        btn.disabled = false;
        btn.classList.remove('loading');
        loader.style.display = 'none';
    }
}

// ============================================
// Tab 1: Key Generation
// ============================================
document.getElementById('generateKeyBtn').addEventListener('click', async () => {
    try {
        setButtonLoading('generateKeyBtn', true);
        
        // Generate key pair
        const { privateKeyPem, publicKeyPem } = await generateAndExportKeyPair();
        
        // Compute fingerprint
        const fingerprint = await computeFingerprint(publicKeyPem);
        
        // Display results
        document.getElementById('privateKeyOutput').value = privateKeyPem;
        document.getElementById('publicKeyOutput').value = publicKeyPem;
        document.getElementById('fingerprintOutput').value = fingerprint;
        
        // Show sections
        document.getElementById('privateKeySection').style.display = 'block';
        document.getElementById('publicKeySection').style.display = 'block';
        document.getElementById('fingerprintSection').style.display = 'block';
        
        showAlert('✓ Sinh khoá thành công!', 'success');
    } catch (error) {
        showAlert(`✕ Lỗi: ${error.message}`, 'error');
        console.error('Error generating key:', error);
    } finally {
        setButtonLoading('generateKeyBtn', false);
    }
});

// Make functions available globally
window.copyToClipboard = copyToClipboard;
window.downloadFile = downloadFile;
window.downloadPrivateKey = downloadPrivateKey;
window.downloadPublicKey = downloadPublicKey;
window.showAlert = showAlert;

// ============================================
// Tab 2: Encryption
// ============================================
document.getElementById('encryptBtn').addEventListener('click', async () => {
    try {
        setButtonLoading('encryptBtn', true);
        
        const publicKey = document.getElementById('encryptPublicKey').value.trim();
        const plaintext = document.getElementById('encryptPlaintext').value.trim();
        
        if (!publicKey) {
            throw new Error('Vui lòng nhập public key');
        }
        if (!plaintext) {
            throw new Error('Vui lòng nhập tin nhắn cần mã hóa');
        }
        
        // Encrypt
        const ciphertext = await encrypt(plaintext, publicKey);
        
        // Display result
        document.getElementById('encryptOutput').value = ciphertext;
        document.getElementById('encryptOutputSection').style.display = 'block';
        
        showAlert('✓ Mã hóa thành công!', 'success');
    } catch (error) {
        showAlert(`✕ Lỗi: ${error.message}`, 'error');
        console.error('Error encrypting:', error);
    } finally {
        setButtonLoading('encryptBtn', false);
    }
});

// ============================================
// Tab 3: Decryption
// ============================================
document.getElementById('decryptBtn').addEventListener('click', async () => {
    try {
        setButtonLoading('decryptBtn', true);
        
        const privateKey = document.getElementById('decryptPrivateKey').value.trim();
        const ciphertext = document.getElementById('decryptCiphertext').value.trim();
        
        if (!privateKey) {
            throw new Error('Vui lòng nhập private key');
        }
        if (!ciphertext) {
            throw new Error('Vui lòng nhập bản mã hóa');
        }
        
        // Decrypt
        const plaintext = await decrypt(ciphertext, privateKey);
        
        // Display result
        document.getElementById('decryptOutput').value = plaintext;
        document.getElementById('decryptOutputSection').style.display = 'block';
        
        showAlert('✓ Giải mã thành công!', 'success');
    } catch (error) {
        showAlert(`✕ Lỗi: ${error.message}`, 'error');
        console.error('Error decrypting:', error);
    } finally {
        setButtonLoading('decryptBtn', false);
    }
});

// ============================================
// Tab 4: Signing
// ============================================
document.getElementById('signBtn').addEventListener('click', async () => {
    try {
        setButtonLoading('signBtn', true);
        
        const privateKey = document.getElementById('signPrivateKey').value.trim();
        const message = document.getElementById('signMessage').value.trim();
        
        if (!privateKey) {
            throw new Error('Vui lòng nhập private key');
        }
        if (!message) {
            throw new Error('Vui lòng nhập tin nhắn cần ký');
        }
        
        // Sign
        const signature = await sign(message, privateKey);
        
        // Display result
        document.getElementById('signOutput').value = signature;
        document.getElementById('signOutputSection').style.display = 'block';
        
        showAlert('✓ Ký thành công!', 'success');
    } catch (error) {
        showAlert(`✕ Lỗi: ${error.message}`, 'error');
        console.error('Error signing:', error);
    } finally {
        setButtonLoading('signBtn', false);
    }
});

// ============================================
// Tab 5: Verification
// ============================================
document.getElementById('verifyBtn').addEventListener('click', async () => {
    try {
        setButtonLoading('verifyBtn', true);
        
        const publicKey = document.getElementById('verifyPublicKey').value.trim();
        const message = document.getElementById('verifyMessage').value.trim();
        const signature = document.getElementById('verifySignature').value.trim();
        
        if (!publicKey) {
            throw new Error('Vui lòng nhập public key');
        }
        if (!message) {
            throw new Error('Vui lòng nhập tin nhắn');
        }
        if (!signature) {
            throw new Error('Vui lòng nhập chữ ký');
        }
        
        // Verify
        const isValid = await verify(message, signature, publicKey);
        
        // Display result
        const resultDiv = document.getElementById('verifyResult');
        if (isValid) {
            resultDiv.className = 'alert alert-success';
            resultDiv.innerHTML = '<span>✓</span><span>Chữ ký hợp lệ! Tin nhắn chưa bị sửa đổi.</span>';
            showAlert('✓ Chữ ký hợp lệ!', 'success');
        } else {
            resultDiv.className = 'alert alert-error';
            resultDiv.innerHTML = '<span>✕</span><span>Chữ ký không hợp lệ! Tin nhắn hoặc chữ ký không chính xác.</span>';
            showAlert('✕ Chữ ký không hợp lệ!', 'error');
        }
        
        document.getElementById('verifyOutputSection').style.display = 'block';
    } catch (error) {
        showAlert(`✕ Lỗi: ${error.message}`, 'error');
        console.error('Error verifying:', error);
    } finally {
        setButtonLoading('verifyBtn', false);
    }
});

// ============================================
// Initialize App
// ============================================
console.log('✓ ECC-SHA512bit Web App loaded successfully');
console.log('Ready to use encryption, decryption, and signing features');
