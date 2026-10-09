import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    participantName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    universityRegNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    batch: {
      type: String,
      default: '',
      trim: true,
    },
    faculty: {
      type: String,
      default: 'Technology',
      trim: true,
    },
    contactNo: {
      type: String,
      default: '',
      trim: true,
    },
    whatsappNo: {
      type: String,
      default: '',
      trim: true,
    },
    competition: {
      type: String,
      default: 'Web Development Competition',
      trim: true,
    },
    track: {
      type: String,
      enum: ['CTF', 'WEB'],
      default: 'WEB',
      index: true,
    },
    registrationReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    registrationStatus: {
      type: String,
      enum: ['registered', 'cancelled'],
      default: 'registered',
      index: true,
    },
    ticket: {
      tokenHash: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },
      qrDataUrl: {
        type: String,
        default: '',
      },
      status: {
        type: String,
        enum: ['active', 'revoked', 'used'],
        default: 'active',
        index: true,
      },
      issuedAt: {
        type: Date,
        default: Date.now,
      },
      version: {
        type: Number,
        default: 1,
      },
    },
    attendance: {
      status: {
        type: String,
        enum: ['not_checked_in', 'checked_in'],
        default: 'not_checked_in',
        index: true,
      },
      checkedInAt: {
        type: Date,
        default: null,
      },
      checkedInBy: {
        type: String,
        default: null,
      },
      checkInMethod: {
        type: String,
        enum: ['qr_scan', 'manual', null],
        default: null,
      },
      notes: {
        type: String,
        default: '',
      },
    },
    emailNotifications: {
      registrationEmailStatus: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending',
      },
      registrationEmailSentAt: {
        type: Date,
        default: null,
      },
      attendanceEmailStatus: {
        type: String,
        enum: ['none', 'pending', 'sent', 'failed'],
        default: 'none',
        index: true,
      },
      attendanceEmailSentAt: {
        type: Date,
        default: null,
      },
      lastError: {
        type: String,
        default: '',
      },
      retryCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness of registration per event
registrationSchema.index({ eventId: 1, universityRegNo: 1 }, { unique: true });

export const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
