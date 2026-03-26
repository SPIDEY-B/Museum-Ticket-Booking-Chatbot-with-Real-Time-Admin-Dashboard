# 🚀 Email + PDF Ticket - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Verify Dependencies (Already Added)
```bash
cd backend
mvn clean install
# Should complete without errors
```

### Step 2: Configure Gmail
1. Visit: https://myaccount.google.com/apppasswords
2. Select: Mail + Windows Computer
3. Copy generated 16-character password
4. Update `application.properties`:
```properties
spring.mail.username=your_email@gmail.com
spring.mail.password=your_16_char_password_here
```

### Step 3: Configure Razorpay (for testing)
- Dashboard: https://dashboard.razorpay.com
- Settings → API Keys
- Copy Test Key ID & Secret
- Update `application.properties`:
```properties
razorpay.key.id=rzp_test_your_key_id
razorpay.key.secret=your_secret_key
```

### Step 4: Start Backend
```bash
cd backend
mvn spring-boot:run
# Wait for "Started TicketBookingApplication"
```

### Step 5: Start Frontend
```bash
cd frontend
npm start
# http://localhost:5173
```

---

## ✅ Test Payment Flow (2 Minutes)

1. **Go to**: http://localhost:5173
2. **Click**: "Book Ticket"
3. **Enter**: test@example.com
4. **Select**: 2 tickets
5. **Click**: "Pay ₹200 & Book"
6. **Razorpay Modal Opens**
7. **Use Test Card**:
   - Number: 4111 1111 1111 1111
   - Expiry: 12/25
   - CVV: 123
8. **Click**: "Pay"
9. **Expect**: ✅ "Payment Successful! Booking Confirmed"
10. **Check Email**: Look for "museum-ticket.pdf" attachment

---

## 📋 Files Changed Summary

### Create (New)
- `PdfService.java` - PDF generation with QR codes
- `QrService.java` - QR code generation

### Enhance (Modified)
- `pom.xml` - Added iText7 dependency
- `EmailService.java` - Added PDF sending methods
- `BookingService.java` - Integrated PDF/Email workflow
- `BookingFlow.jsx` - Enhanced error handling & validation

### Existing (Already Configured)
- `application.properties` - Mail settings ready
- `PaymentWebhookController.java` - Webhook handling
- `index.html` - Razorpay script included

---

## 🎯 What Each Service Does

### PdfService
```java
// Generate beautiful PDF with QR code
byte[] pdf = pdfService.generateTicket(
    bookingId,
    "Museum Name",
    "user@email.com",
    2 // ticket count
);
```
**Output**: PDF file with:
- Museum info
- Booking details
- QR code (200x200px)
- Footer instructions

### QrService
```java
// Generate QR code from text
byte[] qr = qrService.generateQR("BookingID:123");

// Or with custom size
byte[] qr = qrService.generateQR("BookingID:123", 300, 300);
```
**Output**: PNG image byte array

### EmailService (Enhanced)
```java
// Send PDF with attachment
emailService.sendTicketPdf(email, pdfBytes);

// Or with custom subject
emailService.sendTicketPdf(email, pdfBytes, "Your Ticket - Order #123");
```
**Features**:
- Async sending (doesn't block)
- HTML email template
- PDF attachment
- Error logging (doesn't fail booking)

### BookingService (Enhanced)
```java
// Original method, now does more:
Booking booking = createBooking("test@email.com", 2);
// Automatically:
// 1. Creates booking
// 2. Generates PDF with QR
// 3. Sends email with PDF
// 4. Returns booking
```

---

## 🎨 Payment Flow Diagram

```
User Input (Email + Tickets)
         ↓
   Validation Check
         ↓
Create Order (Backend)
         ↓
Razorpay Modal Opens
         ↓
Payment Processing
         ├─ Success → Handler Called
         ├─ Failed → Error Message
         └─ Cancelled → Dismiss Handler
         ↓
Signature Verification
         ├─ Valid → Create Booking
         └─ Invalid → Error Message
         ↓
Booking Created ← Triggers PDF + Email
         ├─ Generate PDF with QR
         └─ Send Email with Attachment
         ↓
Success Alert + Redirect
         ↓
User Receives Email with Ticket
```

---

## 📧 Email Received By User

```
From: your_email@gmail.com
To: test@example.com
Subject: Your Museum Ticket - PDF Attached
Attachments: museum-ticket.pdf

Email Body:
🎫 Your Museum Ticket

Your booking is confirmed! Please find your museum ticket attached.

✓ Payment Successful
  Your payment has been processed successfully.

How to Use Your Ticket:
1. Download the attached PDF
2. Show the QR code at entrance
3. Staff will verify your code
4. Enjoy your visit!
```

---

## 🎫 PDF Ticket Contents

```
┌─────────────────────────────────┐
│    MUSEUM TICKET                │
│═════════════════════════════════│
│ Museum: National Museum          │
│                                 │
│ Booking ID: 123                 │
│ Email: test@example.com         │
│ Tickets: 2                      │
│ Status: ACTIVE                  │
│ Issued On: 2024-01-15 10:30:00  │
│                                 │
│         QR Code                 │
│         [████]                  │
│         [████]  200x200 px      │
│         [████]                  │
│                                 │
│═════════════════════════════════│
│ Present this at entrance        │
│ for verification                │
└─────────────────────────────────┘
```

---

## 🧪 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:5173
- [ ] Can enter email & select tickets
- [ ] Razorpay modal opens on payment click
- [ ] Test payment processes successfully
- [ ] Success message appears
- [ ] Email received within 1-2 minutes
- [ ] PDF attachment present in email
- [ ] PDF contains QR code
- [ ] Booking exists in database
- [ ] Payment verification logs show success

---

## 🔥 Common Issues

### Email Not Sent
```
Check: Mail config in application.properties
Fix: Enable Gmail app password (2FA required)
```

### PDF Not Generated
```
Check: QrService logs
Fix: Verify ZXing dependency in pom.xml
```

### QR Code Missing from PDF
```
Check: QrService.generateQR() exception
Fix: Java version 17+ required
```

### Payment Verification Fails
```
Check: Razorpay keys in application.properties
Fix: Ensure correct test keys (rzp_test_*)
```

### Booking Not Created After Payment
```
Check: Email validation
Fix: Enter valid email format
```

---

## 🚀 Next Steps (For Production)

1. **Switch to Live Keys**
   ```properties
   razorpay.key.id=rzp_live_your_live_key_id
   razorpay.key.secret=your_live_secret_key
   ```

2. **Update Webhook URL**
   - In Razorpay Dashboard
   - Settings → Webhooks
   - Add: `https://yourdomain.com/api/webhooks/razorpay`

3. **Use Production Email**
   - Create Gmail with business domain
   - Set up SPF/DKIM records
   - Configure proper from address

4. **Test with Real Payment**
   - Use actual credit/debit card
   - Verify booking flow end-to-end
   - Check email delivery time

5. **Monitor & Log**
   - Set up error alerts
   - Monitor email deliverability
   - Track payment success rate

---

## 🎓 Code Snippet Reference

### Backend Usage
```java
// BookingService.java already does this automatically:

// 1. Create booking
Booking booking = bookingRepo.save(newBooking);

// 2. Generate PDF with QR
byte[] pdf = pdfService.generateTicket(
    booking.getId(),
    museum.getName(),
    email,
    count
);

// 3. Send via email
emailService.sendTicketPdf(email, pdf);
```

### Frontend Usage
```javascript
// BookingFlow.jsx already does this:

// 1. Create order
const orderResponse = await API.post(`/payments/create-order?amount=${total}`);

// 2. Open Razorpay
const rzp = new window.Razorpay(options);
rzp.open();

// 3. Verify payment (in handler)
await API.post(`/payments/verify-payment?orderId=...&paymentId=...&signature=...`);

// 4. Create booking
await API.post(`/booking/create?email=${email}&count=${count}`);
```

---

## 📞 Quick Support

**PDF not in email?**
- Check: `pdfService.generateTicket()` logs
- Check: `emailService.sendTicketPdf()` logs

**Email not arriving?**
- Check: Spam folder
- Check: `spring.mail.*` properties
- Check: Gmail app password

**Payment failing?**
- Use test card: `4111 1111 1111 1111`
- Check: Razorpay test keys configured
- Check: Order creation response

**QR code missing?**
- Check: ZXing dependency
- Check: Java 17+
- Check: QrService logs

---

**Status**: ✅ Ready to Use!

Run backend + frontend and test the complete flow.
