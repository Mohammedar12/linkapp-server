import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format. Upload jpg, jpeg, or png"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }, // 1 MB limit
  fileFilter,
});

// Create middleware for handling both avatar and bgImage
const uploadFields = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "bgImage", maxCount: 1 },
]);

export { uploadFields };
