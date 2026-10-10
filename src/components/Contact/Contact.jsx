import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [copied, setCopied] = useState(null);

  const whatsappNumber = '+94763029413';
  const whatsappDisplay = '+94 76 302 9413';
  const whatsappUrl = 'https://wa.me/94763029413';

  const emailAddress = 'mmbmushan@gmail.com';
  const emailUrl = 'mailto:mmbmushan@gmail.com';

  const handleCopy = (e, text, type) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section id="contact" className="contact-section">
      <div className="section-container">
        {/* Sleek Minimal Header */}
        <div className="contact-header text-center reveal-on-scroll">
          <span className="contact-mini-badge font-mono">DIRECT ASSISTANCE</span>
          <h2 className="contact-title">
            HAVE QUESTIONS? <span className="title-gradient">CONNECT WITH US</span>
          </h2>
        </div>

        {/* Compact Symmetrical Contact Bar */}
        <div className="contact-compact-grid reveal-on-scroll stagger-1">
          {/* WhatsApp Compact Card */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="compact-contact-card whatsapp-card"
            aria-label={`Chat on WhatsApp ${whatsappDisplay}`}
          >
            <div className="contact-icon-pill whatsapp-pill">
              <svg viewBox="0 0 24 24" fill="none" className="contact-svg" aria-hidden="true">
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.952 3.71 1.454 5.711 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.484-8.407"
                  fill="currentColor"
                />
              </svg>
            </div>

            <div className="contact-info-col">
              <span className="contact-label-tag">WhatsApp Support</span>
              <span className="contact-main-text font-mono">{whatsappDisplay}</span>
            </div>

            <div className="contact-action-group">
              <span className="action-pill-btn whatsapp-action">
                <span>Chat Now</span>
                <svg viewBox="0 0 24 24" fill="none" className="arrow-icon">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <button
                type="button"
                className={`compact-copy-btn ${copied === 'wa' ? 'is-copied' : ''}`}
                onClick={(e) => handleCopy(e, whatsappNumber, 'wa')}
                title={copied === 'wa' ? "Copied!" : "Copy WhatsApp number"}
                aria-label="Copy phone number"
              >
                {copied === 'wa' ? (
                  <svg viewBox="0 0 24 24" fill="none" className="btn-svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="btn-svg"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2"/></svg>
                )}
              </button>
            </div>
          </a>

          {/* Email Compact Card */}
          <a
            href={emailUrl}
            className="compact-contact-card email-card"
            aria-label={`Send email to ${emailAddress}`}
          >
            <div className="contact-icon-pill email-pill">
              <svg viewBox="0 0 24 24" fill="none" className="contact-svg" aria-hidden="true">
                <path
                  d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="contact-info-col">
              <span className="contact-label-tag">Official Inquiries</span>
              <span className="contact-main-text font-mono">{emailAddress}</span>
            </div>

            <div className="contact-action-group">
              <span className="action-pill-btn email-action">
                <span>Send Mail</span>
                <svg viewBox="0 0 24 24" fill="none" className="arrow-icon">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <button
                type="button"
                className={`compact-copy-btn ${copied === 'email' ? 'is-copied' : ''}`}
                onClick={(e) => handleCopy(e, emailAddress, 'email')}
                title={copied === 'email' ? "Copied!" : "Copy email address"}
                aria-label="Copy email address"
              >
                {copied === 'email' ? (
                  <svg viewBox="0 0 24 24" fill="none" className="btn-svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="btn-svg"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2"/></svg>
                )}
              </button>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
