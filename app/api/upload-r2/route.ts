import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Cấu hình S3 Client kết nối tới Cloudflare R2
const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file tải lên" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Đặt tên file độc nhất kết hợp với thư mục riêng cho xác thực cư dân
    const fileName = `verification-images/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    await S3.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'oceanapp',
        Key: fileName,
        Body: buffer,
        ContentType: file.type || 'image/jpeg',
      })
    );

    // Trả về URL public của ảnh trên R2
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Lỗi upload R2:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}