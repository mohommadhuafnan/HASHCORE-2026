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

export function buildTicketVerificationUrl(rawToken, baseUrl, participantData = {}) {
  const domain = (baseUrl || process.env.FRONTEND_URL || 'https://hashcoreseu2026.vercel.app').replace(/\/+$/, '');
  const params = new URLSearchParams();
  if (participantData.ticketId) params.set('ticket', participantData.ticketId);
  if (participantData.regNo) params.set('reg', participantData.regNo);
  if (participantData.name) params.set('name', participantData.name);
  if (participantData.track) params.set('track', participantData.track);
  if (participantData.email) params.set('email', participantData.email);
  if (participantData.batch) params.set('batch', participantData.batch);
  if (participantData.faculty) params.set('faculty', participantData.faculty);

  const queryStr = params.toString();
  if (queryStr) {
    return `${domain}/scan?${queryStr}`;
  }
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
export async function createSecureTicket(baseUrl, participantData = {}) {
  const rawToken = generateRawTicketToken();
  const tokenHash = hashTicketToken(rawToken);
  const verificationUrl = buildTicketVerificationUrl(rawToken, baseUrl, participantData);
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
