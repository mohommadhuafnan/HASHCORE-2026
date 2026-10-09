import express from 'express';
import { Event } from '../models/Event.js';

const router = express.Router();

/**
 * Returns the primary active event (creates default if none exists)
 */
export async function getOrCreateDefaultEvent() {
  let event = await Event.findOne({ slug: 'hashcore-2026' });
  if (!event) {
    event = await Event.create({
      name: "SEUSL HASHCORE '26",
      slug: 'hashcore-2026',
      description: 'Flagship Cyber Citadel & Hackathon Championship hosted by Faculty of Technology, SEUSL.',
      date: new Date('2026-10-25T08:30:00Z'),
      startTime: '08:30 AM',
      venue: 'Faculty of Technology, South Eastern University of Sri Lanka (SEUSL), Oluvil',
      status: 'active',
      registrationOpen: true,
      organizerContact: process.env.OFFICIAL_EMAIL || 'hashcore@seu.ac.lk',
    });
    console.log('[Event] Seeded default event:', event.name);
  }
  return event;
}

router.get('/', async (req, res) => {
  try {
    const event = await getOrCreateDefaultEvent();
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
