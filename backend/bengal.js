const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto")

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
const rsaKeyPair = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// Step 2: Generate AES Key and Initialization Vector (IV)
function generateAESKeyAndIV() {
  const aesKey = crypto.randomBytes(32); // 256 bits key
  const iv = crypto.randomBytes(16); // 128 bits IV
  return { aesKey, iv };
}

// Step 3: Encrypt and Decrypt Functions
function encryptAES(message, aesKey, iv) {
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  let encryptedMessage = cipher.update(message, 'utf-8', 'hex');
  encryptedMessage += cipher.final('hex');
  return encryptedMessage;
}

function decryptAES(encryptedMessage, aesKey, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
  let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8');
  decryptedMessage += decipher.final('utf-8');
  return decryptedMessage;
}

// Step 4: RSA Encrypt and Decrypt Functions
function encryptRSA(data, publicKey) {
  const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(data));
  return encryptedData.toString('base64');
}

function decryptRSA(encryptedData, privateKey) {
  const decryptedData = crypto.privateDecrypt(privateKey, Buffer.from(encryptedData, 'base64'));
  return decryptedData.toString('utf-8');
}

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (user) {
    return res.status(401).json({ message: "User already present." });
  }

  const { aesKey, iv } = generateAESKeyAndIV();
  const encryptedPassword = encryptAES(password, aesKey, iv);

  // RSA encryption of AES key and IV
  const encryptedAESKey = encryptRSA(aesKey.toString('base64'), rsaKeyPair.publicKey);
  const encryptedIV = encryptRSA(iv.toString('base64'), rsaKeyPair.publicKey);

  const newUser = new User({
    username,
    encryptedPassword,
    encryptedAESKey,
    encryptedIV,
  });
  await newUser.save();

  res.json({ message: 'User registered successfully' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ message: 'Invalid username' });
  }

  // RSA decryption of AES key and IV
  const aesKey = Buffer.from(decryptRSA(user.encryptedAESKey, rsaKeyPair.privateKey), 'base64');
  const iv = Buffer.from(decryptRSA(user.encryptedIV, rsaKeyPair.privateKey), 'base64');

  const decryptedPassword = decryptAES(user.encryptedPassword, aesKey, iv);

  if (password === decryptedPassword) {
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
