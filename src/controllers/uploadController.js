import { supabase, BUCKET } from '../config/supabase.js';

export async function uploadApk(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const file = req.file;
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `apks/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file.buffer, {
        contentType: 'application/vnd.android.package-archive',
        upsert: true,
        cacheControl: '3600'
      });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(fileName);

    res.json({
      success: true,
      url: urlData.publicUrl,
      publicId: fileName,
      size: file.size,
      format: 'apk'
    });
  } catch (err) {
    console.error('APK upload failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const file = req.file;
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `images/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
        cacheControl: '3600'
      });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(fileName);

    res.json({
      success: true,
      url: urlData.publicUrl,
      publicId: fileName
    });
  } catch (err) {
    console.error('Image upload failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}
