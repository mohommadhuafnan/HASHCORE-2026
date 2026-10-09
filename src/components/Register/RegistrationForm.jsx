import { useState } from 'react';
import { registerParticipant } from '../../services/apiService';
import { submitToGoogleForm } from '../../services/googleFormService';

/**
 * RegistrationForm:
 * Connects the website registration form to Google Form in the background.
 * Exact Requirements:
 * - No red warning banner at top
 * - Automatically set competition value to "CTF Competition" or "Web Development Competition"
 * - Fields: Initial with Name, Batch, Faculty (Technology only), University Reg No (SEU/IS/XX/XXX/XXX),
 *   Email Address, Contact Number, WhatsApp Number
 * - 3 Consent checkboxes (all required)
 * - Submit button: "Submit Registration", loading: "Submitting...", duplicate click protection
 * - Below button: "⚠ Only one submission is allowed per participant."
 * - Background submission to Google Form (https://forms.gle/fwiHPJk2DrYo7zyE9)
 * - Error message: "Registration could not be submitted. Please try again." without clearing data
 */
export default function RegistrationForm({ track, onBackToCategories, onSuccess }) {
  const isCTF = track === 'CTF';
  const competitionValue = isCTF ? 'Workshop 01: CTF: From Awareness to Challenge' : 'Workshop 02: From Idea to Impact (Web Dev)';

  const [formData, setFormData] = useState({
    initialsWithName: '',
    batch: '',
    faculty: 'Technology', // As specified: ONLY "Technology"
    universityRegNo: '',
    email: '',
    contactNo: '',
    whatsappNo: '',
    competition: competitionValue,
    consentGuidelines: false,
    consentAccurate: false,
    consentUpdates: false,
  });

  const [sameAsContact, setSameAsContact] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionPhase, setSubmissionPhase] = useState(0);
  const [submitError, setSubmitError] = useState('');

  const submissionSteps = [
    { title: 'Submitting Registration...', progress: 32 },
    { title: 'Generating your registration...', progress: 68 },
    { title: 'Sending confirmation email...', progress: 95 },
  ];
  const currentStepInfo = submissionSteps[Math.min(submissionPhase, 2)] || submissionSteps[0];

  const batches = [
    '2019/2020',
    '2020/2021',
    '2021/2022',
    '2022/2023',
    '2023/2024',
    '2024/2025',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'contactNo' && sameAsContact) {
        updated.whatsappNo = value;
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSameAsContactToggle = (e) => {
    const checked = e.target.checked;
    setSameAsContact(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, whatsappNo: prev.contactNo }));
      if (errors.whatsappNo) {
        setErrors((prev) => ({ ...prev, whatsappNo: null }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Initial with Name
    if (!formData.initialsWithName.trim()) {
      newErrors.initialsWithName = 'Initial with Name is required.';
    }

    // 2. Batch
    if (!formData.batch.trim()) {
      newErrors.batch = 'Batch is required.';
    }

    // 3. Faculty
    if (!formData.faculty) {
      newErrors.faculty = 'Faculty is required (Technology).';
    }

    // 4. University Registering Number
    const regNoClean = formData.universityRegNo.trim().toUpperCase();
    if (!regNoClean) {
      newErrors.universityRegNo = 'University Registering Number is required.';
    } else {
      // Validate reasonable format like SEU/IS/XX/XXX/XXX or similar SEU registration number
      const regPattern = /^SEU\/[A-Z0-9/_-]+$/i;
      if (!regPattern.test(regNoClean) && regNoClean.length < 8) {
        newErrors.universityRegNo = 'Please enter a valid Registration Number format (Ex: SEU/IS/XX/XXX/XXX).';
      }
    }

    // 5. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // 6. Contact Number (Sri Lankan format)
    const cleanContact = formData.contactNo.replace(/[\s-]/g, '');
    const slPhoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
    if (!formData.contactNo.trim()) {
      newErrors.contactNo = 'Contact Number is required.';
    } else if (!slPhoneRegex.test(cleanContact) && cleanContact.length < 9) {
      newErrors.contactNo = 'Please enter a valid Sri Lankan contact number (e.g. 077 123 4567).';
    }

    // 7. WhatsApp Number (Sri Lankan format)
    const cleanWhatsapp = formData.whatsappNo.replace(/[\s-]/g, '');
    if (!formData.whatsappNo.trim()) {
      newErrors.whatsappNo = 'WhatsApp Number is required.';
    } else if (!slPhoneRegex.test(cleanWhatsapp) && cleanWhatsapp.length < 9) {
      newErrors.whatsappNo = 'Please enter a valid Sri Lankan WhatsApp number (e.g. 077 123 4567).';
    }

    // 8. Consent Checkboxes
    if (!formData.consentGuidelines) {
      newErrors.consentGuidelines = 'This consent checkbox is required.';
    }
    if (!formData.consentAccurate) {
      newErrors.consentAccurate = 'This consent checkbox is required.';
    }
    if (!formData.consentUpdates) {
      newErrors.consentUpdates = 'This consent checkbox is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent multiple clicks

    if (!validateForm()) {
      const firstError = document.querySelector('.form-field-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Duplicate check in localStorage based on University Registering Number
    const regNoUpper = formData.universityRegNo.trim().toUpperCase();
    const cleanEmail = formData.email.trim().toLowerCase();
    try {
      const existing = localStorage.getItem('hashcore26_registered_student');
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.universityRegNo && parsed.universityRegNo.toUpperCase() === regNoUpper) {
          setSubmitError(`You have already registered for this event.${parsed.ticketId ? ` (Existing Ticket ID: ${parsed.ticketId})` : ''}`);
          return;
        }
      }
    } catch (err) {
      console.warn('LocalStorage duplicate check exception:', err);
    }

    setIsSubmitting(true);
    setSubmitError('');

    // Ticket ID format: CTF-2026-XXXXX or WEB-2026-XXXXX
    const compPrefix = isCTF ? 'CTF-2026' : 'WEB-2026';
    const fallbackTicketId = `${compPrefix}-${String(Math.floor(10000 + Math.random() * 90000))}`;
    const timestamp = new Date().toISOString();

    const submissionPayload = {
      ...formData,
      email: cleanEmail,
      universityRegNo: regNoUpper,
      track,
      competition: competitionValue,
      regId: fallbackTicketId,
      ticketId: fallbackTicketId,
      submittedAt: timestamp,
    };

    try {
      // Step timer:
      const t1 = setTimeout(() => setSubmissionPhase(1), 600);
      const t2 = setTimeout(() => setSubmissionPhase(2), 1250);

      const backendResult = await registerParticipant(submissionPayload);

      clearTimeout(t1);
      clearTimeout(t2);

      const finalTicketId = backendResult?.ticketId || fallbackTicketId;
      const finalPayload = {
        ...submissionPayload,
        regId: finalTicketId,
        ticketId: finalTicketId,
        qrDataUrl: backendResult?.qrDataUrl || null,
        emailSent: backendResult?.emailSent !== false,
      };

      // Save to localStorage for single-submission policy
      try {
        localStorage.setItem('hashcore26_registered_student', JSON.stringify(finalPayload));
      } catch (storageErr) {
        console.warn('LocalStorage write warning:', storageErr);
      }

      // Phase 3: Celebration Checkmark & Welcome Greeting Animation right in the loading flow
      setSubmissionPhase(3);

      // Display the confirmation animation for 2.2s, then transition to view ONLY the ticket
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(finalPayload);
      }, 2200);
    } catch (err) {
      console.error('Registration submission error:', err);
      setIsSubmitting(false);
      setSubmissionPhase(0);
      if (err.message && err.message.includes('already registered')) {
        setSubmitError('You have already registered for this event.');
      } else {
        setSubmitError(err.message || 'Registration could not be submitted. Please try again.');
      }
    }
  };

  return (
    <div className="registration-form-wrapper">
      {/* High-Tech Submission Transit Overlay Animation */}
      {isSubmitting && (
        <div className="submit-transit-overlay">
          <div className="submit-transit-backdrop" />
          <div className={`submit-transit-card ${submissionPhase === 3 ? 'is-celebration' : ''}`}>
            {submissionPhase === 3 ? (
              /* Phase 3: Celebration Checkmark & Welcome greeting requested by user */
              <div className="transit-celebration-block">
                <div className="success-checkmark-circle">
                  <svg viewBox="0 0 52 52" className="checkmark-svg">
                    <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle" />
                    <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check" />
                  </svg>
                </div>
                <h2 className="celebrate-title">Registration Successful</h2>
                <h3 className="celebrate-welcome">
                  Welcome, <span className="highlight-emerald">{formData.initialsWithName || 'Participant'}</span>!
                </h3>
                <p className="celebrate-sub">Your registration has been successfully confirmed.</p>
                <div className="celebrate-pill font-mono">
                  <span>PREPARING YOUR OFFICIAL PASS...</span>
                </div>
              </div>
            ) : (
              /* Phases 0, 1, 2: Cyber transit progress */
              <>
                <div className="transit-emblem-wrap">
                  <div className="transit-ring-outer" />
                  <div className="transit-ring-inner" />
                  <div className="transit-core-shield">
                    <svg viewBox="0 0 24 24" fill="none" className="transit-shield-icon">
                      <path d="M12 2L3 7V12C3 17.5 6.8 22.3 12 23.5C17.2 22.3 21 17.5 21 12V6L12 2Z" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M12 7V17M8 11L12 7L16 11" stroke="currentColor" strokeWidth="1.8"/>
                    </svg>
                  </div>
                </div>

                <div className="transit-badge font-mono">
                  <span>CITADEL REGISTRATION UPLINK ACTIVE</span>
                </div>

                <h3 className="transit-title">
                  Transmitting <span className={isCTF ? 'highlight-cyan' : 'highlight-emerald'}>{competitionValue}</span>
                </h3>

                <div className="transit-telemetry-box font-mono">
                  <div className="transit-signal-row">
                    <span className="signal-dot pulsing" />
                    <span className="signal-text">{currentStepInfo.title}</span>
                  </div>
                  <div className="transit-meta-row">
                    <span>CANDIDATE: {formData.initialsWithName || 'AUTHENTICATING'}</span>
                    <span>REG NO: {formData.universityRegNo || 'VERIFYING'}</span>
                  </div>
                </div>

                <div className="transit-progress-wrap">
                  <div className="transit-progress-bar">
                    <div 
                      className="transit-progress-fill" 
                      style={{ width: `${currentStepInfo.progress}%` }} 
                    />
                  </div>
                  <div className="transit-progress-info font-mono">
                    <span>PROGRESS: {currentStepInfo.progress}%</span>
                    <span>STATUS: SECURING CITADEL ACCESS</span>
                  </div>
                </div>

                <p className="transit-sub-caution font-mono">
                  Please do not close this window. Finalizing your official pass...
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="reg-form-nav">
        <button 
          type="button" 
          onClick={onBackToCategories} 
          className="btn-switch-track"
          title="Switch workshop track"
        >
          <svg viewBox="0 0 24 24" fill="none" className="arrow-left">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Change Workshop</span>
        </button>

        <div className={`selected-track-pill ${isCTF ? 'ctf' : 'web'}`}>
          <span className="font-mono">{competitionValue.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Glass Form Card */}
      <div className="reg-form-card">
        {/* Form Title & Context */}
        <div className="form-head-block">
          <span className="form-kicker font-mono">SEUSL HASHCORE v0.1 – 2026 // WORKSHOP REGISTRATION</span>
          <h2 className="form-title">
            Register for <span className={isCTF ? 'highlight-cyan' : 'highlight-emerald'}>{competitionValue}</span>
          </h2>
          <p className="form-subtext">
            Complete the form below to register for the awareness workshop. Participation is free. Prior registration is required for students of the Department of ICT.
          </p>
        </div>

        {/* Submission Error Banner (if error occurred during submit) */}
        {submitError && (
          <div className="submission-error-alert" role="alert">
            <svg viewBox="0 0 24 24" fill="none" className="err-icon">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="reg-form-fields" noValidate>
          <div className="form-grid">
            {/* Workshop Field (Pre-filled / Auto-set) */}
            <div className="form-field full-width">
              <label htmlFor="competition" className="field-label">
                <span>Selected Workshop</span>
              </label>
              <div className="input-wrap">
                <input
                  id="competition"
                  name="competition"
                  type="text"
                  value={competitionValue}
                  readOnly
                  disabled
                  className="field-input font-mono input-locked"
                />
              </div>
            </div>

            {/* 1. Initial with Name */}
            <div className="form-field full-width">
              <label htmlFor="initialsWithName" className="field-label">
                <span>Initial with Name</span>
                <span className="req-star">*</span>
              </label>
              <div className="input-wrap">
                <input
                  id="initialsWithName"
                  name="initialsWithName"
                  type="text"
                  placeholder="Ex: M.A. Afnan or K.L. Fernando"
                  value={formData.initialsWithName}
                  onChange={handleInputChange}
                  className={`field-input ${errors.initialsWithName ? 'has-error' : ''}`}
                />
              </div>
              {errors.initialsWithName && (
                <p className="form-field-error">{errors.initialsWithName}</p>
              )}
            </div>

            {/* 2. Batch */}
            <div className="form-field">
              <label htmlFor="batch" className="field-label">
                <span>Batch</span>
                <span className="req-star">*</span>
              </label>
              <div className="input-wrap select-wrap">
                <select
                  id="batch"
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  className={`field-input field-select ${errors.batch ? 'has-error' : ''}`}
                >
                  <option value="">Select your batch...</option>
                  {batches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <div className="select-arrow-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {errors.batch && (
                <p className="form-field-error">{errors.batch}</p>
              )}
            </div>

            {/* 3. Faculty (Only "Technology") */}
            <div className="form-field">
              <label htmlFor="faculty" className="field-label">
                <span>Faculty</span>
                <span className="req-star">*</span>
                <span className="faculty-lock-tag font-mono">Technology Only</span>
              </label>
              <div className="input-wrap select-wrap">
                <select
                  id="faculty"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleInputChange}
                  className="field-input field-select locked-select"
                >
                  {/* Exactly as requested: ONLY show "Technology" */}
                  <option value="Technology">Technology</option>
                </select>
                <div className="select-arrow-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 15V17M6 21H18C19.1 21 20 20.1 20 19V11C20 9.9 19.1 9 18 9H6C4.9 9 4 9.9 4 11V19C4 20.1 4.9 21 6 21ZM16 9V7C16 4.8 14.2 3 12 3C9.8 3 8 4.8 8 7V9H16Z" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                </div>
              </div>
              {errors.faculty && (
                <p className="form-field-error">{errors.faculty}</p>
              )}
            </div>

            {/* 4. University Registering Number */}
            <div className="form-field full-width">
              <label htmlFor="universityRegNo" className="field-label">
                <span>University Registering Number</span>
                <span className="req-star">*</span>
                <span className="format-hint-pill font-mono">Ex: SEU/IS/XX/XXX/XXX</span>
              </label>
              <div className="input-wrap">
                <input
                  id="universityRegNo"
                  name="universityRegNo"
                  type="text"
                  placeholder="SEU/IS/XX/XXX/XXX"
                  value={formData.universityRegNo}
                  onChange={handleInputChange}
                  className={`field-input font-mono ${errors.universityRegNo ? 'has-error' : ''}`}
                />
              </div>
              {errors.universityRegNo ? (
                <p className="form-field-error">{errors.universityRegNo}</p>
              ) : (
                <p className="field-hint">Enter your official SEUSL Registration Number accurately.</p>
              )}
            </div>

            {/* 5. Email Address */}
            <div className="form-field full-width">
              <label htmlFor="email" className="field-label">
                <span>Email Address</span>
                <span className="req-star">*</span>
              </label>
              <div className="input-wrap">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. yourname@seu.ac.lk or personal@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`field-input ${errors.email ? 'has-error' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="form-field-error">{errors.email}</p>
              )}
            </div>

            {/* 6. Contact Number */}
            <div className="form-field">
              <label htmlFor="contactNo" className="field-label">
                <span>Contact Number</span>
                <span className="req-star">*</span>
              </label>
              <div className="input-wrap">
                <input
                  id="contactNo"
                  name="contactNo"
                  type="tel"
                  placeholder="077 123 4567 or +94 77 123 4567"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  className={`field-input ${errors.contactNo ? 'has-error' : ''}`}
                />
              </div>
              {errors.contactNo && (
                <p className="form-field-error">{errors.contactNo}</p>
              )}
            </div>

            {/* 7. WhatsApp Number */}
            <div className="form-field">
              <div className="label-with-toggle">
                <label htmlFor="whatsappNo" className="field-label">
                  <span>WhatsApp Number</span>
                  <span className="req-star">*</span>
                </label>
                <label className="same-as-contact-toggle">
                  <input
                    type="checkbox"
                    checked={sameAsContact}
                    onChange={handleSameAsContactToggle}
                  />
                  <span>Same as Contact</span>
                </label>
              </div>
              <div className="input-wrap">
                <input
                  id="whatsappNo"
                  name="whatsappNo"
                  type="tel"
                  placeholder="077 123 4567 or +94 77 123 4567"
                  value={formData.whatsappNo}
                  onChange={handleInputChange}
                  disabled={sameAsContact}
                  className={`field-input ${errors.whatsappNo ? 'has-error' : ''} ${sameAsContact ? 'input-synced' : ''}`}
                />
              </div>
              {errors.whatsappNo && (
                <p className="form-field-error">{errors.whatsappNo}</p>
              )}
            </div>
          </div>

          {/* ==================================================================
              Consent Section (3 Checkboxes - All Required)
              ================================================================== */}
          <div className="form-consent-section">
            <h4 className="consent-heading">
              <span className="consent-icon">☑️</span>
              <span>Consent & Agreements</span>
            </h4>

            <div className="consent-checkbox-list">
              {/* Consent 1 */}
              <label className={`consent-item ${errors.consentGuidelines ? 'consent-error' : ''}`}>
                <input
                  type="checkbox"
                  name="consentGuidelines"
                  checked={formData.consentGuidelines}
                  onChange={handleCheckboxChange}
                  className="consent-box"
                />
                <span className="consent-text">
                  I have read the pre-workshop preparation guidelines and understand that I am responsible 
                  for setting up my laptop and required software before attending the workshop.
                </span>
              </label>
              {errors.consentGuidelines && (
                <p className="form-field-error pad-left">{errors.consentGuidelines}</p>
              )}

              {/* Consent 2 */}
              <label className={`consent-item ${errors.consentAccurate ? 'consent-error' : ''}`}>
                <input
                  type="checkbox"
                  name="consentAccurate"
                  checked={formData.consentAccurate}
                  onChange={handleCheckboxChange}
                  className="consent-box"
                />
                <span className="consent-text">
                  I confirm that the information provided is accurate.
                </span>
              </label>
              {errors.consentAccurate && (
                <p className="form-field-error pad-left">{errors.consentAccurate}</p>
              )}

              {/* Consent 3 */}
              <label className={`consent-item ${errors.consentUpdates ? 'consent-error' : ''}`}>
                <input
                  type="checkbox"
                  name="consentUpdates"
                  checked={formData.consentUpdates}
                  onChange={handleCheckboxChange}
                  className="consent-box"
                />
                <span className="consent-text">
                  I agree to receive workshop-related updates and announcements.
                </span>
              </label>
              {errors.consentUpdates && (
                <p className="form-field-error pad-left">{errors.consentUpdates}</p>
              )}
            </div>
          </div>

          {/* ==================================================================
              Submit Section
              ================================================================== */}
          <div className="form-submit-area">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn-form-submit ${isSubmitting ? 'is-loading' : ''} ${isCTF ? 'btn-ctf-submit' : 'btn-web-submit'}`}
            >
              <span className="btn-glow-aura" />
              <span className="btn-label">
                {isSubmitting ? (
                  <>
                    <span className="spinner-dots" />
                    <span>{currentStepInfo.title}</span>
                  </>
                ) : (
                  <>
                    <span>Submit Registration</span>
                    <svg viewBox="0 0 24 24" fill="none" className="submit-arrow">
                      <path d="M5 12H19M19 12L12 5M19 12L12 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </span>
            </button>

            {/* Exactly as requested: Below the button display: "⚠ Only one submission is allowed per participant." */}
            <div className="single-submission-caption">
              <span>⚠ Only one submission is allowed per participant.</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
