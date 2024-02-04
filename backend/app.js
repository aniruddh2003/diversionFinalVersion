const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const session = require("express-session");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(
  "mongodb+srv://aniban:RICKBAND@diversion.6s7yb0t.mongodb.net/?retryWrites=true&w=majority",
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Use express-session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// User model
const User = mongoose.model(
  "User",
  {
    username: String,
    encryptedPassword: String,
    encryptedAESKey: String,
    encryptedIV: String,
    privateKey: String, // Add a field to store private key
  },
  "users"
);

// Middleware for checking authentication
const checkAuthentication = (req, res, next) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ message: "Unauthorized - User not logged in" });
  }

  next();
};



// Helper function to generate RSA key pair
const generateRSAKeyPair = () => {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
};

// Helper function to generate AES key and IV
const generateAESKeyAndIV = () => {
  const aesKey = crypto.randomBytes(32); // 256 bits key
  const iv = crypto.randomBytes(16); // 128 bits IV
  return { aesKey, iv };
};

// Register route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Generate RSA key pair
    const rsaKeyPair = generateRSAKeyPair();

    // Generate AES key and IV
    const { aesKey, iv } = generateAESKeyAndIV();

    // Encrypt the password with AES
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    let encryptedPassword = cipher.update(password, "utf-8", "hex");
    encryptedPassword += cipher.final("hex");

    // RSA encryption of AES key and IV
    const encryptedAESKey = crypto.publicEncrypt(
      rsaKeyPair.publicKey,
      Buffer.from(aesKey)
    );
    const encryptedIV = crypto.publicEncrypt(
      rsaKeyPair.publicKey,
      Buffer.from(iv)
    );

    // Save private key for later decryption
    const privateKey = rsaKeyPair.privateKey;

    // Save user to the database
    const newUser = new User({
      username,
      encryptedPassword,
      encryptedAESKey: encryptedAESKey.toString("base64"),
      encryptedIV: encryptedIV.toString("base64"),
      privateKey, // Save the private key
    });
    await newUser.save();

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in /register:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // RSA decryption of AES key and IV
    const decryptedAESKey = crypto.privateDecrypt(
      Buffer.from(user.privateKey, "utf-8"),
      Buffer.from(user.encryptedAESKey, "base64")
    );
    const decryptedIV = crypto.privateDecrypt(
      Buffer.from(user.privateKey, "utf-8"),
      Buffer.from(user.encryptedIV, "base64")
    );

    // Decrypt the password with AES
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      decryptedAESKey,
      decryptedIV
    );
    let decryptedPassword = decipher.update(
      user.encryptedPassword,
      "hex",
      "utf-8"
    );
    decryptedPassword += decipher.final("utf-8");

    if (password === decryptedPassword) {
      req.session.user = { username: user.username, userId: user._id };

      res.json({ message: "Login successful", username: user.username });
      
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    console.error("Error in /login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/logout", (req, res) => {
  if (req.session.user) {
    req.session.destroy();
    res.json({ message: "Logout successful" });
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
