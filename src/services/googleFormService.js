/**
 * Google Form & Apps Script Integration Service for SEUSL HASHCORE '26
 * Form URL: https://forms.gle/fwiHPJk2DrYo7zyE9
 * Form Action: https://docs.google.com/forms/d/e/1FAIpQLSf-zQtRjiFFSYXMorP7SWRQLsHCQxQStp_QxYfCQG48FZAKrA/formResponse
 */

export const GOOGLE_FORM_CONFIG = {
  formId: '1FAIpQLSf-zQtRjiFFSYXMorP7SWRQLsHCQxQStp_QxYfCQG48FZAKrA',
  formActionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSf-zQtRjiFFSYXMorP7SWRQLsHCQxQStp_QxYfCQG48FZAKrA/formResponse',
  viewFormUrl: 'https://forms.gle/fwiHPJk2DrYo7zyE9',
  
  // Real, verified field entry IDs for new Google Form
  entryIds: {
    initialsWithName: 'entry.4872230',
    universityRegNo: 'entry.1324525460',
    faculty: 'entry.1565242725',
    batch: 'entry.1725670981',
    email: 'entry.1758629376',
    contactNo: 'entry.1724561456',
    whatsappNo: 'entry.278691388',
    competition: 'entry.2098792527',
    consentGuidelines: 'entry.2038822511',
    consentAccuracy: 'entry.1965085977',
    consentUpdates: 'entry.297542819',
  },

  // Google Apps Script Web App Endpoint URL (configured via environment variable if deployed on new account)
  appsScriptUrl: import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '',
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

  const compOption = isCTF ? 'CTF' : 'Web';

  params.append(GOOGLE_FORM_CONFIG.entryIds.initialsWithName, formData.initialsWithName || '');
  params.append(GOOGLE_FORM_CONFIG.entryIds.universityRegNo, cleanRegNo);
  params.append(GOOGLE_FORM_CONFIG.entryIds.faculty, formData.faculty || 'Technology');
  params.append(GOOGLE_FORM_CONFIG.entryIds.batch, formData.batch || '');
  params.append(GOOGLE_FORM_CONFIG.entryIds.email, cleanEmail);
  params.append(GOOGLE_FORM_CONFIG.entryIds.contactNo, formData.contactNo || '');
  params.append(GOOGLE_FORM_CONFIG.entryIds.whatsappNo, formData.whatsappNo || '');
  params.append(GOOGLE_FORM_CONFIG.entryIds.competition, compOption);
  params.append(GOOGLE_FORM_CONFIG.entryIds.consentGuidelines, 'I have read the pre-workshop preparation guidelines and understand that I am responsible for setting up my laptop and required software before attending the workshop.');
  params.append(GOOGLE_FORM_CONFIG.entryIds.consentAccuracy, 'I confirm that the information provided is accurate.');
  params.append(GOOGLE_FORM_CONFIG.entryIds.consentUpdates, 'I agree to receive workshop-related updates and announcements.');

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
