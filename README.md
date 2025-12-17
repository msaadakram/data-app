# Secure File Vault

A secure, password-protected file storage vault built with Next.js, MongoDB, and AWS S3. Upload, manage, and download your files with a simple PIN-based authentication system.

## Features

- 🔐 4-digit PIN authentication
- 📁 Secure file upload and storage via AWS S3
- 📥 Secure file downloads with presigned URLs
- 🗑️ File deletion from both database and S3
- 🎨 Modern, responsive UI with smooth animations
- ⚡ Fast and optimized for production
- 🚀 Ready for Vercel deployment

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB (via Mongoose)
- **Storage**: AWS S3
- **Authentication**: bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas recommended)
- AWS account with S3 bucket and IAM credentials

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd secure-file-vault
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_BUCKET_NAME=your-bucket-name

# Default password (4 digits) - Only used on first run
DEFAULT_PASSWORD=1234
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### MongoDB Setup

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and replace the placeholder in `.env.local`

### AWS S3 Setup

1. Create an S3 bucket in your AWS account
2. Create an IAM user with the following permissions:
   - `s3:PutObject`
   - `s3:GetObject`
   - `s3:DeleteObject`
3. Generate access keys for the IAM user
4. Add the credentials to your `.env.local` file

### Default Password

On first run, the system will use the `DEFAULT_PASSWORD` environment variable (default: "1234"). After the first successful login, you can change the password through the change password API endpoint.

## Deploy on Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com/new)
3. Add all environment variables in the Vercel dashboard:
   - `MONGODB_URI`
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_BUCKET_NAME`
   - `DEFAULT_PASSWORD` (optional)
4. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables:
```bash
vercel env add MONGODB_URI
vercel env add AWS_REGION
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_BUCKET_NAME
vercel env add DEFAULT_PASSWORD
```

4. Redeploy:
```bash
vercel --prod
```

## API Endpoints

### Authentication

- `POST /api/auth/verify` - Verify PIN and authenticate
- `POST /api/auth/change-password` - Change the PIN

### Files

- `GET /api/files` - Get list of all files
- `POST /api/files` - Create file record (after S3 upload)
- `DELETE /api/files?id=<fileId>` - Delete file from database and S3
- `POST /api/files/presign-upload` - Get presigned URL for uploading to S3
- `GET /api/files/download-url?id=<fileId>` - Get presigned URL for downloading from S3

## Project Structure

```
secure-file-vault/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── files/        # File management endpoints
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── vault/
│   │   ├── Dashboard.tsx # Main dashboard component
│   │   └── LoginScreen.tsx # Login screen component
│   └── VaultApp.tsx      # Main app component
├── lib/
│   ├── db.ts            # MongoDB connection
│   └── models.ts        # Mongoose models
└── public/              # Static assets
```

## Security Considerations

- Passwords are hashed using bcrypt with a salt rounds of 10
- Files are stored in AWS S3 with presigned URLs for secure access
- Database connection is cached for serverless environments
- Input validation on all API endpoints
- Filenames are sanitized to prevent directory traversal

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
