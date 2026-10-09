import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "SEUSL HASHCORE '26",
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      default: 'hashcore-2026',
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: 'Flagship Cyber Citadel & Hackathon Championship hosted by Faculty of Technology, SEUSL.',
    },
    date: {
      type: Date,
      default: () => new Date('2026-10-25T08:30:00Z'),
    },
    startTime: {
      type: String,
      default: '08:30 AM',
    },
    venue: {
      type: String,
      default: 'Faculty of Technology, South Eastern University of Sri Lanka (SEUSL), Oluvil',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    organizerContact: {
      type: String,
      default: 'hashcore@seu.ac.lk',
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
