const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const crypto = require("crypto");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(
  "mongodb+srv://aniban:RICKBAND@diversion.6s7yb0t.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// User model
const User = mongoose.model(
  "User",
  {
    username: String,
    password: String,
    secret: String,
    encryptedPassword: String,
    encryptedAESKey: String,
    encryptedIV: String,
  },
  "mydb"
);

// Step 1: Generate RSA Keys
const rsaKeyPair = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

// Step 2: Generate AES Key and Initialization Vector (IV)
function generateAESKeyAndIV() {
  const aesKey = crypto.randomBytes(32); // 256 bits key
  const iv = crypto.randomBytes(16); // 128 bits IV
  return { aesKey, iv };
}

// Step 3: Encrypt and Decrypt Functions
function encryptAES(message, aesKey, iv) {
  const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
  let encryptedMessage = cipher.update(message, "utf-8", "hex");
  encryptedMessage += cipher.final("hex");
  return encryptedMessage;
}

function decryptAES(encryptedMessage, aesKey, iv) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);
  let decryptedMessage = decipher.update(encryptedMessage, "hex", "utf-8");
  decryptedMessage += decipher.final("utf-8");
  return decryptedMessage;
}

// Step 4: RSA Encrypt and Decrypt Functions
function encryptRSA(data, publicKey) {
  const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(data));
  return encryptedData.toString("base64");
}

function decryptRSA(encryptedData, privateKey) {
  const decryptedData = crypto.privateDecrypt(
    privateKey,
    Buffer.from(encryptedData, "base64")
  );
  return decryptedData.toString("utf-8");
}

// Endpoint to register a new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Generate a secret for the user
  const secret = speakeasy.generateSecret({ length: 20 });

  // Generate AES key and IV
  const { aesKey, iv } = generateAESKeyAndIV();
  const encryptedPassword = encryptAES(password, aesKey, iv);

  // RSA encryption of AES key and IV
  const encryptedAESKey = encryptRSA(
    aesKey.toString("base64"),
    rsaKeyPair.publicKey
  );
  const encryptedIV = encryptRSA(iv.toString("base64"), rsaKeyPair.publicKey);

  try {
    const present = await User.findOne({ username });

    if (present) {
      return res.status(401).json({ message: "Username already present" });
    }
    // Save user data to MongoDB
    const user = new User({
      username,
      encryptedPassword,
      encryptedAESKey,
      encryptedIV,
      secret: secret.base32,
    });
    await user.save();

    // Return the secret and QR code for the user to scan
    const otpAuthUrl = secret.otpauth_url;

    qrcode.toDataURL(otpAuthUrl, (err, dataUrl) => {
      if (err) {
        return res.status(500).send("Error generating QR code");
      }
      res.json({ secret: secret.base32, qrcode: dataUrl });
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user");
  }
});

// Endpoint to authenticate a user
app.post("/login", async (req, res) => {
  const { username, password, token } = req.body;

  try {
    // Find the user in MongoDB
    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // RSA decryption of AES key and IV
    const aesKey = Buffer.from(
      decryptRSA(user.encryptedAESKey, rsaKeyPair.privateKey),
      "base64"
    );
    const iv = Buffer.from(
      decryptRSA(user.encryptedIV, rsaKeyPair.privateKey),
      "base64"
    );

    const decryptedPassword = decryptAES(user.encryptedPassword, aesKey, iv);

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: "base32",
      token,
    });

    if (verified || password === decryptedPassword) {
      res.json({ message: "Authentication successful" });
    } else {
      res.status(401).json({ error: "Authentication failed" });
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ error: "Error authenticating user" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
