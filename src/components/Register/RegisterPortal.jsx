import { useState } from 'react';
import AutoFramePlayer from './AutoFramePlayer';
import CategorySelection from './CategorySelection';
import WelcomeLoader from './WelcomeLoader';
import RegistrationForm from './RegistrationForm';
import RegistrationSuccess from './RegistrationSuccess';
import lastFrameImg from '../../frame/00240.webp';
import './RegisterPortal.css';

/**
 * RegisterPortal:
 * Master controller for the registration journey:
 * 1. Auto-Play 240 Frames smoothly from start to finish
 * 2. Land on Frame 240 as the background for the registration portal
 * 3. Choose between:
 *    - CTF Competition Awareness
 *    - Web Development Competition Awareness
 * 4. Welcome Loading Animation mentioning CTF or WEB
 * 5. Official Registration Form with single submission lock
 * 6. Access Pass Receipt
 */
export default function RegisterPortal({ onBackToHome, initialStage = 'autoplaying', initialTrack = null }) {
  const [stage, setStage] = useState(initialStage); // 'autoplaying' | 'categories' | 'welcome' | 'form' | 'success'
  const [selectedTrack, setSelectedTrack] = useState(initialTrack); // 'CTF' | 'WEB'
  const [prevInitialTrack, setPrevInitialTrack] = useState(initialTrack);
  const [existingRegistration, setExistingRegistration] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('hashcore26_registered_student') : null;
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.warn('Error reading stored registration:', err);
      return null;
    }
  });

  // Adjust selectedTrack if initialTrack prop changes
  if (initialTrack !== prevInitialTrack) {
    setPrevInitialTrack(initialTrack);
    if (initialTrack) {
      setSelectedTrack(initialTrack);
    }
  }

  // Handlers
  const handleAutoPlayComplete = () => {
    if (selectedTrack) {
      setStage('welcome');
    } else {
      setStage('categories');
    }
  };

  const handleSkipAutoPlay = () => {
    if (selectedTrack) {
      setStage('welcome');
    } else {
      setStage('categories');
    }
  };

  const handleSelectTrack = (trackKey) => {
    if (trackKey === 'VIEW_EXISTING') {
      setStage('success');
      return;
    }
    setSelectedTrack(trackKey);
    setStage('welcome');
  };

  const handleWelcomeComplete = () => {
    setStage('form');
  };

  const handleBackToCategories = () => {
    setStage('categories');
  };

  const handleRegistrationSuccess = (submissionData) => {
    setExistingRegistration(submissionData);
    setStage('success');
  };

  return (
    <div className="register-portal-root">
      {/* ==================================================================
          STAGE 1: Auto Frame Playback (1 to 240 without user scrolling)
          ================================================================== */}
      {stage === 'autoplaying' && (
        <AutoFramePlayer 
          onComplete={handleAutoPlayComplete} 
          onSkip={handleSkipAutoPlay} 
        />
      )}

      {/* ==================================================================
          STAGES 2, 3, 4, 5: Fixed Frame 240 Background Architecture
          As requested: Frame 240 is the background for the registration page!
          ================================================================== */}
      {stage !== 'autoplaying' && (
        <div className="portal-frame240-backdrop-container">
          {/* Untouched Frame 240 as Fixed Citadel Background */}
          <div className="portal-frame240-img-wrap">
            <img 
              src={lastFrameImg} 
              alt="SEUSL HASHCORE Frame 240 Citadel Background" 
              className="portal-frame240-img" 
            />
          </div>

          {/* Interactive Portal Content Area */}
          <div className="portal-content-layer">
            {/* Stage: Category Selection */}
            {stage === 'categories' && (
              <CategorySelection
                onSelectTrack={handleSelectTrack}
                onBackToHome={onBackToHome}
                existingRegistration={existingRegistration}
              />
            )}

            {/* Stage: Welcome Loading Animation (Mentioning CTF or WEB) */}
            {stage === 'welcome' && (
              <WelcomeLoader
                track={selectedTrack}
                onComplete={handleWelcomeComplete}
              />
            )}

            {/* Stage: Official Registration Form */}
            {stage === 'form' && (
              <RegistrationForm
                track={selectedTrack}
                onBackToCategories={handleBackToCategories}
                onSuccess={handleRegistrationSuccess}
              />
            )}

            {/* Stage: Registration Success & Citadel Pass */}
            {stage === 'success' && (
              <RegistrationSuccess
                registration={existingRegistration}
                onBackToHome={onBackToHome}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
