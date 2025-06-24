import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

let client: S3Client | null = null;

function getClient() {
  if (!client) {
    if (!process.env.R2_ENDPOINT) {
      throw new Error('R2_ENDPOINT is missing');
    }

    client = new S3Client({
      region: process.env.R2_REGION || 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return client;
}

export async function uploadAvatar(
  key: string,
  data: Buffer,
  contentType = 'image/png'
) {
  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: data,
      ContentType: contentType,
      ACL: 'public-read',
    })
  );
  const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');
  return base ? `${base}/${key}` : key;
}