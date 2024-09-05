import { upload } from "./cloudinary.mjs";
import fs from "fs";
export default async function handleFileUpload(file, uploadDir) {
  if (!file) return null;

  try {
    const uploadedFile = await upload(file.path, uploadDir);
    await fs.unlink(file.path);
    return uploadedFile;
  } catch (error) {
    console.error(`Error uploading file to ${uploadDir}:`, error);
    throw error;
  }
}

// let avatar;
// if (req.files && req.files[0]) {
//   const { path } = req.files[0];
//   avatar = await upload(path, "app/avatar");
//   fs.unlinkSync(path);
// }
