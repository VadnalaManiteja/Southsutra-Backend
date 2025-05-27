const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const admin = require("firebase-admin");
const serviceAccount = require("./southsutraecommerce.json"); 
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tickettracker-dedc6-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
const auth = admin.auth();


// ✅ Define transporter once globally


app.put('/api/users/:uid/password', async (req, res) => {
  const { uid } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ success: false, message: 'New password is required.' });
  }

  try {
    // 1. Update password in Firebase Auth
    await auth.updateUser(uid, { password: newPassword });

    // 2. Update password in Firestore
    const userDocRef = db.collection('customers').doc(uid);

    // Optional: check if the document exists
    const docSnapshot = await userDocRef.get();
    if (!docSnapshot.exists) {
      return res.status(404).json({ success: false, message: 'User document not found in Firestore.' });
    }

    // ⚠️ This sets the password field — you can hash this for production
    await userDocRef.update({
      password: newPassword
    });

    return res.status(200).json({ success: true, message: 'Password updated in Firebase Auth and Firestore.' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password.',
      error: error.message
    });
  }
});




app.get('/get-uid-by-email', async (req, res) => {
    const { email } = req.query;

    try {
        const userRecord = await auth.getUserByEmail(email);
        res.status(200).json({ success: true, uid: userRecord.uid });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(404).json({ success: false, message: 'User not found' });
    }
});



  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rajeshyanamadala2000@gmail.com',
        pass: 'thpr ipkp cubr hupw'  // Use App Password, not your real Gmail password
    },
    tls: {
        rejectUnauthorized: false
    }
});
// ✅ Welcome Email Route
app.post('/send-welcome-email', async (req, res) => {
    const { email, fullName, password } = req.body;

    try {
        const mailOptions = {
            from: 'rajeshyanamadala2000@gmail.com',
            to: email,
            subject: 'Welcome to SutraCart!',
            html: `
                <h2>Hi ${fullName},</h2>
                <p>Thank you for registering on SutraCart. We're excited to have you!</p>
                <p><strong>Your login credentials:</strong></p>
                <ul>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Password:</strong> ${password}</li>
                </ul>
                <p>We recommend changing your password after logging in for security purposes.</p>
                <br>
                <p>– SutraCart Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("Email send error:", error);
        res.status(500).send({ success: false, message: "Failed to send email" });
    }
});


// ✅ OTP Email Route
app.post('/send-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const mailOptions = {
            from: 'rajeshyanamadala2000@gmail.com',
            to: email,
            subject: 'SutraCart OTP Verification',
            html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error("Send OTP error:", error);
        res.status(500).send({ success: false, message: "Failed to send OTP" });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Email server running on port ${PORT}`);
});
