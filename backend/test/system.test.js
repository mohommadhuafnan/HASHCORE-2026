import assert from 'node:assert';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { connectDB } from '../config/db.js';
import { Event } from '../models/Event.js';
import { Registration } from '../models/Registration.js';
import { getOrCreateDefaultEvent } from '../routes/eventRoutes.js';
import {
  createSecureTicket,
  hashTicketToken,
  generateRawTicketToken,
} from '../services/ticketService.js';
import { triggerAttendanceEmailForRegistration } from '../services/attendanceNotificationWorker.js';

async function runTests() {
  console.log('\n============================================================');
  console.log('🧪 RUNNING COMPREHENSIVE CITADEL BACKEND AUTOMATED TESTS');
  console.log('============================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(e);
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(e);
    }
  }

  try {
    // 1. Database Connection & Index Initialization
    await asyncTest('1. Connects to MongoDB successfully & initializes indexes', async () => {
      await connectDB();
      await Registration.init();
      assert.strictEqual(mongoose.connection.readyState, 1);
    });

    // 2. Default Event
    let event;
    await asyncTest('2. Retrieves or seeds default event', async () => {
      event = await getOrCreateDefaultEvent();
      assert.ok(event);
      assert.strictEqual(event.slug, 'hashcore-2026');
      assert.strictEqual(event.registrationOpen, true);
    });

    // 3. Cryptographic Token & Local QR Generation
    let ticketPkg;
    await asyncTest('3. Generates secure random 32-byte token and local QR code', async () => {
      ticketPkg = await createSecureTicket('http://localhost:5173');
      assert.ok(ticketPkg.rawToken);
      assert.strictEqual(ticketPkg.rawToken.length, 64); // 32 bytes hex = 64 chars
      assert.ok(ticketPkg.tokenHash);
      assert.strictEqual(ticketPkg.tokenHash.length, 64); // SHA-256 = 64 chars
      assert.ok(ticketPkg.qrDataUrl.startsWith('data:image/png;base64,'));
      assert.ok(Buffer.isBuffer(ticketPkg.qrBuffer));

      // Deterministic hash check
      const recomputedHash = hashTicketToken(ticketPkg.rawToken);
      assert.strictEqual(recomputedHash, ticketPkg.tokenHash);
    });

    // 4. Save Registration in MongoDB
    const testRegNo = `TEST/SYS/${Date.now()}`;
    const testEmail = `tester_${Date.now()}@test.com`;
    let savedReg;

    await asyncTest('4. Saves new registration with hashed token in MongoDB', async () => {
      savedReg = await Registration.create({
        eventId: event._id,
        participantName: 'Automated Test Participant',
        email: testEmail,
        universityRegNo: testRegNo,
        batch: '2021/2022',
        faculty: 'Technology',
        competition: 'Web Development Competition',
        track: 'WEB',
        registrationReference: `WEB-2026-${String(Math.floor(10000 + Math.random() * 90000))}`,
        registrationStatus: 'registered',
        ticket: {
          tokenHash: ticketPkg.tokenHash,
          qrDataUrl: ticketPkg.qrDataUrl,
          status: 'active',
          issuedAt: new Date(),
          version: 1,
        },
        attendance: {
          status: 'not_checked_in',
        },
        emailNotifications: {
          registrationEmailStatus: 'sent',
        },
      });

      assert.ok(savedReg._id);
      assert.strictEqual(savedReg.universityRegNo, testRegNo);
      assert.strictEqual(savedReg.attendance.status, 'not_checked_in');
    });

    // 5. Duplicate Prevention Test
    await asyncTest('5. Rejects duplicate registration for same regNo or email', async () => {
      let threw = false;
      try {
        await Registration.create({
          eventId: event._id,
          participantName: 'Duplicate Person',
          email: testEmail,
          universityRegNo: testRegNo,
          registrationReference: 'WEB-DUP-001',
          ticket: {
            tokenHash: hashTicketToken(generateRawTicketToken()),
          },
        });
      } catch (err) {
        threw = true;
      }
      assert.strictEqual(threw, true, 'Expected duplicate key error');
    });

    // 6. Atomic QR Attendance Check-In Test
    await asyncTest('6. Atomically marks attendance as checked_in on first scan', async () => {
      const hashedToken = hashTicketToken(ticketPkg.rawToken);
      const updated = await Registration.findOneAndUpdate(
        {
          'ticket.tokenHash': hashedToken,
          'ticket.status': 'active',
          registrationStatus: 'registered',
          'attendance.status': 'not_checked_in',
        },
        {
          $set: {
            'attendance.status': 'checked_in',
            'attendance.checkedInAt': new Date(),
            'attendance.checkedInBy': 'Automated Test Runner',
            'attendance.checkInMethod': 'qr_scan',
            'emailNotifications.attendanceEmailStatus': 'pending',
          },
        },
        { new: true }
      );

      assert.ok(updated, 'Expected atomic update to succeed on first scan');
      assert.strictEqual(updated.attendance.status, 'checked_in');
      assert.ok(updated.attendance.checkedInAt);
    });

    // 7. Duplicate Scan Rejection Test
    await asyncTest('7. Rejects duplicate scan and prevents double check-in', async () => {
      const hashedToken = hashTicketToken(ticketPkg.rawToken);
      const duplicateAttempt = await Registration.findOneAndUpdate(
        {
          'ticket.tokenHash': hashedToken,
          'ticket.status': 'active',
          registrationStatus: 'registered',
          'attendance.status': 'not_checked_in', // Cannot match because already checked_in!
        },
        {
          $set: {
            'attendance.status': 'checked_in',
          },
        },
        { new: true }
      );

      assert.strictEqual(duplicateAttempt, null, 'Second check-in must return null');
    });

    // 8. Attendance Email Dispatch & Recovery Test
    await asyncTest('8. Dispatches attendance confirmation email safely without breaking attendance', async () => {
      const emailResult = await triggerAttendanceEmailForRegistration(savedReg._id);
      assert.ok(emailResult);
      // Verify attendance remains checked_in regardless of transport
      const checkDoc = await Registration.findById(savedReg._id);
      assert.strictEqual(checkDoc.attendance.status, 'checked_in');
    });

    // Clean up test document
    await Registration.deleteOne({ _id: savedReg._id });

    console.log('\n============================================================');
    console.log(`📊 TEST RESULTS: ${passed}/${total} PASSED`);
    console.log('============================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
