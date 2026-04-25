// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import config from "../../config";

// const s3Client = new S3Client({
//   region: config.s3_region,
//   credentials: {
//     accessKeyId: config.s3_access_key as string,
//     secretAccessKey: config.s3_secret_key as string,
//   },
// });

// export const generateUploadUrl = async (fileName: string, contentType: string) => {
//   const command = new PutObjectCommand({
//     Bucket: config.s3_bucket_name,
//     Key: `profile-images/${Date.now()}-${fileName}`,
//     ContentType: contentType,
//   });

//   // URL expires in 60 seconds
//   const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
//   return signedUrl;
// };



//* Controller

// auth.controller.ts
// import { Request, Response } from 'express';
// import { generateUploadUrl } from './s3.utils';

// const getS3UploadUrl = async (req: Request, res: Response) => {
//   const { fileName, contentType } = req.body;

//   // Generate the signed URL using your utility
//   const { signedUrl, fileUrl } = await generateUploadUrl(fileName, contentType);

//   res.status(200).json({
//     success: true,
//     message: 'Presigned URL generated successfully',
//     data: {
//       signedUrl,
//       fileUrl,
//     },
//   });
// };


// For Frontend: 

// const onSubmit = async (formData) => {
//   const file = formData.profileImage[0];
  
//   // 1. Upload to S3 first
//   const uploadedImageUrl = await handleFileUpload(file);

//   // 2. Register user with the S3 URL
//   const registrationData = {
//     ...formData,
//     profileImage: uploadedImageUrl,
//   };

//   const res = await fetch('http://localhost:5000/api/v1/auth/register', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(registrationData),
//   });
  
//   // Handle success/error...
// };



// const handleFileUpload = async (file) => {
//   try {
//     // Step 1: Get the Presigned URL from your Backend
//     const response = await fetch('http://localhost:5000/api/v1/auth/get-upload-url', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ 
//         fileName: file.name, 
//         contentType: file.type 
//       }),
//     });

//     const { data } = await response.json();
//     const { signedUrl, fileUrl } = data; // fileUrl is the permanent link

//     // Step 2: Upload the file directly to S3
//     const uploadResponse = await fetch(signedUrl, {
//       method: 'PUT',
//       body: file, // The raw file object from the input
//       headers: {
//         'Content-Type': file.type,
//       },
//     });

//     if (uploadResponse.ok) {
//       console.log('Upload successful!');
//       return fileUrl; // Send this to your register API
//     }
//   } catch (error) {
//     console.error('Error uploading file:', error);
//   }
// };