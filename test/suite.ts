import assert from 'assert';
import {
  normalizeAndValidatePhone,
  validateEnquiryInput,
  generateReferenceId,
  checkRateLimit,
} from '../server/validation.ts';
import {
  generateSessionToken,
  verifySessionToken,
  verifyAdminPassword,
} from '../server/auth.ts';
import { dbService } from '../server/db.ts';

async function runTests() {
  console.log('--- STARTING BIZORA TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // 1. Phone Normalization Tests
  test('Normalizes 10-digit Indian mobile number', () => {
    const res = normalizeAndValidatePhone('9876543210');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.normalized, '919876543210');
    assert.strictEqual(res.display, '+91 98765 43210');
  });

  test('Normalizes Indian mobile with +91 and spaces', () => {
    const res = normalizeAndValidatePhone('+91 81478 27430');
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.normalized, '918147827430');
    assert.strictEqual(res.display, '+91 81478 27430');
  });

  test('Rejects invalid phone number with too few digits', () => {
    const res = normalizeAndValidatePhone('12345');
    assert.strictEqual(res.valid, false);
  });

  // 2. Input Validation Tests
  test('Accepts valid enquiry payload', () => {
    const payload = {
      customer_name: 'Anand Sharma',
      business_name: 'Sharma Spices Wholesale',
      business_type: 'Wholesale Trade',
      phone: '9845012345',
      email: 'anand@sharmaspices.com',
      city: 'Hubballi',
      requested_service: 'digital_catalogue',
      project_description: 'We need an interactive product catalogue for 80 spice varieties with WhatsApp enquiry button.',
      budget_range: '₹15,000 - ₹30,000',
      preferred_contact_method: 'whatsapp',
      consent: true,
    };
    const res = validateEnquiryInput(payload);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(Object.keys(res.errors).length, 0);
    assert.strictEqual(res.normalizedData?.phone, '+91 98450 12345');
  });

  test('Rejects enquiry payload when consent is missing', () => {
    const payload = {
      customer_name: 'Anand Sharma',
      business_name: 'Sharma Spices',
      business_type: 'Wholesale',
      phone: '9845012345',
      city: 'Hubballi',
      requested_service: 'digital_catalogue',
      project_description: 'Need website and catalogue.',
      consent: false,
    };
    const res = validateEnquiryInput(payload);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(typeof res.errors.consent, 'string');
  });

  test('Rejects enquiry payload when description is too short', () => {
    const payload = {
      customer_name: 'Anand Sharma',
      business_name: 'Sharma Spices',
      business_type: 'Wholesale',
      phone: '9845012345',
      city: 'Hubballi',
      requested_service: 'website_dev',
      project_description: 'Short',
      consent: true,
    };
    const res = validateEnquiryInput(payload);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(typeof res.errors.project_description, 'string');
  });

  // 3. Reference ID Generator
  test('Generates reference ID with BIZ- prefix and 6 chars', () => {
    const ref = generateReferenceId();
    assert.strictEqual(ref.startsWith('BIZ-'), true);
    assert.strictEqual(ref.length, 10);
  });

  // 4. Rate Limiting Logic
  test('Rate limit allows initial requests and blocks beyond limit', () => {
    const testKey = 'test_ip_' + Date.now();
    for (let i = 0; i < 3; i++) {
      const check = checkRateLimit(testKey, 3, 60000);
      assert.strictEqual(check.allowed, true);
    }
    const blockedCheck = checkRateLimit(testKey, 3, 60000);
    assert.strictEqual(blockedCheck.allowed, false);
  });

  // 5. Admin Authentication & Session Token
  test('Verifies admin password correctly', () => {
    assert.strictEqual(verifyAdminPassword('bizora2026admin'), true);
    assert.strictEqual(verifyAdminPassword('wrongpassword'), false);
    assert.strictEqual(verifyAdminPassword(''), false);
  });

  test('Signs and verifies valid admin session token', () => {
    const token = generateSessionToken();
    const session = verifySessionToken(token);
    assert.ok(session);
    assert.strictEqual(session?.role, 'founder');
  });

  test('Rejects tampered or malformed session token', () => {
    const token = generateSessionToken();
    const tampered = token.slice(0, -3) + 'abc';
    assert.strictEqual(verifySessionToken(tampered), null);
    assert.strictEqual(verifySessionToken('completely.invalid.token'), null);
  });

  // 6. Database Lead Workflow (Create, Retrieve, Update Status, Notes)
  await (async () => {
    try {
      const refId = generateReferenceId();
      const created = await dbService.createEnquiry(
        {
          customer_name: 'Test Customer',
          business_name: 'Test Diagnostics Center',
          business_type: 'Healthcare',
          phone: '+91 99887 76655',
          city: 'Bengaluru',
          requested_service: 'appointment_enquiry',
          project_description: 'Automated booking schedule test for diagnostic appointments.',
          preferred_contact_method: 'whatsapp',
          consent: true,
        },
        refId
      );

      assert.strictEqual(created.reference_id, refId);
      assert.strictEqual(created.status, 'new');
      console.log(`  ✓ PASS: Database create enquiry [Ref: ${refId}]`);
      passed++;

      // Update status and internal notes
      const updated = await dbService.updateEnquiry(created.id, {
        status: 'contacted',
        internal_notes: 'Spoke on WhatsApp. Quoted ₹18,000.',
      });
      assert.strictEqual(updated?.status, 'contacted');
      assert.strictEqual(updated?.internal_notes, 'Spoke on WhatsApp. Quoted ₹18,000.');
      console.log(`  ✓ PASS: Database update status and internal notes`);
      passed++;

      // Retrieve stats and verify real counts
      const stats = await dbService.getStats();
      assert.ok(stats.total >= 1);
      assert.ok(stats.contacted >= 1);
      console.log(`  ✓ PASS: Database stats computation (Total: ${stats.total})`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: Database workflow test: ${err.message}`);
      failed++;
    }
  })();

  console.log(`\nTEST SUITE SUMMARY: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
