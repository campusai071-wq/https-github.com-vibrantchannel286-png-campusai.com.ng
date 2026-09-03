import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebaseConfig";

export interface StorageUploadResult {
  success: boolean;
  downloadUrl?: string;
  storagePath?: string;
  error?: any;
}

/**
 * Uploads a PDF file or binary blob directly to Google Firebase Cloud Storage.
 * Includes graceful error handling so that if Firebase Storage is blocked by rules
 * or pending console activation, the app seamlessly falls back to the server disk vault.
 */
export async function uploadPdfToFirebaseStorage(
  pdfId: string,
  fileOrBlob: Blob | File,
  metadata?: { title?: string; author?: string; category?: string }
): Promise<StorageUploadResult> {
  try {
    if (!storage) {
      console.warn("[Firebase Storage] Storage instance not available.");
      return { success: false, error: new Error("Firebase Storage not initialized") };
    }

    const storagePath = `pdfs/${pdfId}.pdf`;
    const storageRef = ref(storage, storagePath);

    const customMetadata: Record<string, string> = {};
    if (metadata?.title) customMetadata["title"] = encodeURIComponent(metadata.title.slice(0, 100));
    if (metadata?.author) customMetadata["author"] = encodeURIComponent(metadata.author.slice(0, 60));
    if (metadata?.category) customMetadata["category"] = encodeURIComponent(metadata.category.slice(0, 50));

    const uploadResult = await uploadBytes(storageRef, fileOrBlob, {
      contentType: "application/pdf",
      customMetadata
    });

    const downloadUrl = await getDownloadURL(uploadResult.ref);
    console.log(`[Firebase Storage] Successfully uploaded PDF to ${storagePath}`);
    return {
      success: true,
      downloadUrl,
      storagePath
    };
  } catch (err: any) {
    console.warn(`[Firebase Storage] Direct upload notice (${err?.code || err?.message}):`, err);
    return {
      success: false,
      error: err
    };
  }
}

/**
 * Deletes a PDF file from Firebase Cloud Storage.
 */
export async function deletePdfFromFirebaseStorage(pdfId: string): Promise<boolean> {
  try {
    if (!storage) return false;
    const storageRef = ref(storage, `pdfs/${pdfId}.pdf`);
    await deleteObject(storageRef);
    console.log(`[Firebase Storage] Successfully deleted pdfs/${pdfId}.pdf`);
    return true;
  } catch (err) {
    console.warn("[Firebase Storage] Delete notice:", err);
    return false;
  }
}
