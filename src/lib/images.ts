import { supabase } from './supabase'

const BUCKET = 'trip-images'
const MAX_SIDE = 1280

// Phone photos are several MB; shrink to a JPEG before uploading.
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.8),
  )
}

// ponytail: removing an image from a place leaves the file in Storage (anon cannot delete);
// clean up orphans from the Supabase dashboard if the bucket ever fills up.
export async function uploadImage(file: File): Promise<string> {
  const blob = await shrink(file)
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' })
  if (error) throw error
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
