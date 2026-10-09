import crypto from 'node:crypto';
import QRCode from 'qrcode';

/**
 * Ticket Service:
 * - Generates cryptographically secure random ticket tokens
 * - Produces deterministic SHA-256 token hashes for database storage
 * - Generates high-contrast QR codes locally without external APIs
 */

export function generateRawTicketToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashTicketToken(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new Error('Valid raw ticket token string is required for hashing');
  }
  return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
}

export function buildTicketVerificationUrl(rawToken, baseUrl) {
  const domain = (baseUrl || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  return `${domain}/#verify/${rawToken}`;
}

export async function generateQrCodeDataUrl(text) {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 4,
    width: 320,
    color: {
      dark: '#020905',
      light: '#ffffff',
    },
  });
}

export async function generateQrCodeBuffer(text) {
  return QRCode.toBuffer(text, {
    errorCorrectionLevel: 'M',
    margin: 4,
    width: 320,
    color: {
      dark: '#020905',
      light: '#ffffff',
    },
  });
}

/**
 * Complete ticket generation package
 */
export async function createSecureTicket(baseUrl) {
  const rawToken = generateRawTicketToken();
  const tokenHash = hashTicketToken(rawToken);
  const verificationUrl = buildTicketVerificationUrl(rawToken, baseUrl);
  const [qrDataUrl, qrBuffer] = await Promise.all([
    generateQrCodeDataUrl(verificationUrl),
    generateQrCodeBuffer(verificationUrl),
  ]);

  return {
    rawToken,
    tokenHash,
    verificationUrl,
    qrDataUrl,
    qrBuffer,
  };
}
