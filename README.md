# ConvertMaster - Document Conversion

A modern web application for converting documents between various formats.

## Features

- Convert documents to various formats:
  - PDF to DOCX, DOC, TXT, HTML
  - DOCX/DOC to PDF, TXT, HTML
  - HTML to PDF, TXT, MD
  - TXT to PDF, HTML, MD
  - And more!
- Modern, intuitive UI
- Real-time conversion status
- Clean, responsive design
- Error handling

## System Requirements

For document conversion to work, you need to install:

1. **LibreOffice** - Used for most document conversions
   - Download from: https://www.libreoffice.org/download/download-libreoffice/

2. **Pandoc** - Used for text-based format conversions
   - Download from: https://pandoc.org/installing.html

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open http://localhost:3000 in your browser

## API Endpoints

### Convert Document

```
POST /api/convert/document
```

Parameters (form-data):
- `file`: Document file to convert
- `targetFormat`: Format to convert to (pdf, docx, doc, txt, html, md, etc.)

Response:
```json
{
  "success": true,
  "conversionId": "uuid-string",
  "originalName": "document.pdf",
  "targetFormat": "docx",
  "downloadUrl": "/api/convert/document/download?id=uuid-string&name=document.docx"
}
```

### Check Conversion Status

```
GET /api/convert/document/status?id=[conversionId]&name=[filename].[format]
```

Response:
```json
{
  "id": "uuid-string",
  "status": "complete", // or "processing"
  "downloadUrl": "/api/convert/document/download?id=uuid-string&name=document.docx"
}
```

### Download Converted File

```
GET /api/convert/document/download?id=[conversionId]&name=[filename].[format]
```

Response: The converted file as a downloadable binary

## How It Works

1. File Upload: The user uploads a document file and selects the desired output format.
2. API Processing: The backend uses LibreOffice and Pandoc to convert the document.
3. Download: The user can download the converted file once processing is complete.

## Dependencies Used

- LibreOffice Convert: For document format conversion
- Pandoc: For text-based format conversion
- UUID: For generating unique conversion IDs
- Next.js: For the web framework and API routes
