/**
 * Google Form & Apps Script Integration Service for SEUSL HASHCORE '26
 * Form URL: https://forms.gle/r5BmVKvHAaYGhiBf6
 * Form Action: https://docs.google.com/forms/d/e/1FAIpQLSfgltpwHS4ysB6RJj_aTU_G29pzHTWOr4EOyjugXGco13Rg-A/formResponse
 */

export const GOOGLE_FORM_CONFIG = {
  formId: '1FAIpQLSfgltpwHS4ysB6RJj_aTU_G29pzHTWOr4EOyjugXGco13Rg-A',
  formActionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfgltpwHS4ysB6RJj_aTU_G29pzHTWOr4EOyjugXGco13Rg-A/formResponse',
  viewFormUrl: 'https://forms.gle/r5BmVKvHAaYGhiBf6',
  
  // Real, verified field entry IDs
  entryIds: {
    initialsWithName: 'entry.76375722',
    batch: 'entry.31862707',
    faculty: 'entry.1767337826',
    universityRegNo: 'entry.2071694137',
    email: 'entry.1026507812',
    contactNo: 'entry.332798540',
    whatsappNo: 'entry.1465247396',
    competition: 'entry.893739711',
    consentGuidelines: 'entry.874966380',
    consentAccuracy: 'entry.1596152163',
    consentUpdates: 'entry.133352343',
  },

  // Google Apps Script Web App Endpoint URL (configured via environment variable or deployed script)
  appsScriptUrl: import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyevmhcY8Abn0GSPWPMBZb0QjENrfIPWTFlb8NgsHN-AC5sUJPxlk1vkyh6ojSCeRiwAg/exec',
};

/**
 * Submits the registration form.
 * Priority:
 * 1. Google Apps Script Web App (handles duplicate verification in Sheet, records row, and dispatches HTML confirmation email).
 * 2. Fallback to direct Google Form endpoint if Apps Script is not configured.
 */
export async function submitToGoogleForm(formData) {
  const isCTF = formData.track === 'CTF' || (formData.competition && formData.competition.includes('CTF'));
  const compPrefix = isCTF ? 'CTF-2026' : 'WEB-2026';
  const cleanEmail = (formData.email || '').trim().toLowerCase();
  const cleanRegNo = (formData.universityRegNo || '').trim().toUpperCase();

  // 1. If Google Apps Script Web App URL is configured
  if (GOOGLE_FORM_CONFIG.appsScriptUrl) {
    try {
      const response = await fetch(GOOGLE_FORM_CONFIG.appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          ...formData,
          email: cleanEmail,
          universityRegNo: cleanRegNo,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        if (result.duplicate) {
          throw new Error('You have already registered for this event.');
        }
        throw new Error(result.error || result.message || 'Registration could not be completed.');
      }
      return result;
    } catch (err) {
      // If it's a duplicate error, rethrow so the form displays it directly
      if (err.message && err.message.includes('already registered')) {
        throw err;
      }
      console.warn('Google Apps Script proxy error, falling back to direct endpoint:', err);
    }
  }

  // 2. Direct Background Submission to Google Forms
  const url = GOOGLE_FORM_CONFIG.formActionUrl;
  const params = new URLSearchParams();

  params.append(GOOGLE_FORM_CONFIG.entryIds.initialsWithName, formData.initialsWithName || '');
  params.append(GOOGLE_FORM_CONFIG.entryIds.batch, 'Option 1');
  params.append(GOOGLE_FORM_CONFIG.entryIds.faculty, 'Technology');
  params.append(GOOGLE_FORM_CONFIG.entryIds.universityRegNo, cleanRegNo);
  params.append(GOOGLE_FORM_CONFIG.entryIds.email, cleanEmail);
  params.append(GOOGLE_FORM_CONFIG.entryIds.contactNo, formData.contactNo || '');
  params.append(GOOGLE_FORM_CONFIG.entryIds.whatsappNo, formData.whatsappNo || '');
  params.append(GOOGLE_FORM_CONFIG.entryIds.competition, formData.competition || (isCTF ? 'CTF Competition' : 'Web Development Competition'));
  params.append(GOOGLE_FORM_CONFIG.entryIds.consentGuidelines, 'I agree');
  params.append(GOOGLE_FORM_CONFIG.entryIds.consentAccuracy, 'Option 1');
  params.append(GOOGLE_FORM_CONFIG.entryIds.consentUpdates, 'Option 1');

  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const generatedTicketId = `${compPrefix}-${String(Math.floor(10000 + Math.random() * 90000))}`;

  return {
    success: true,
    ticketId: generatedTicketId,
    emailSent: false, // Apps Script is required for automatic email dispatch
    email: cleanEmail,
    participantName: formData.initialsWithName,
    fallback: true,
  };
}
