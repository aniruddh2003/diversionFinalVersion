const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const bodyParser = require('body-parser')

const app = express();
const port = 4000;

// Enable CORS
app.use(cors());

// Use bodyParser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use express-fileupload middleware
app.use(fileUpload());

app.post("/upload", async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const uploadedFile = req.files.file;
    const uploadPath = path.join(__dirname, "uploads", uploadedFile.name);

    await uploadedFile.mv(uploadPath);

    // Read the content of the uploaded file
    const fileContent = await fs.readFile(uploadPath, "utf-8");
    

    res.json({
      message: "File uploaded and content read successfully!",
      content: fileContent,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
