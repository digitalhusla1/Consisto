# Consistent Character Generator

A professional web application for generating consistent character images using AI. Upload a reference image and generate multiple images of the same character in different poses and scenarios using Replicate's AI models.

## 🌟 Features

### Core Functionality
- **Image Upload**: Support for JPG, PNG, WebP formats (up to 10MB)
- **AI Generation**: Generate 1-20 consistent character images per session
- **Professional Interface**: Clean, modern design optimized for productivity
- **Reference Preview**: Live preview of uploaded images above the prompt area
- **Flexible Settings**: Customizable prompts, output formats, and quality controls
- **Real-time Status**: Server connection monitoring with live status indicators

### Advanced Options
- **Pose Randomization**: Generate varied poses automatically
- **Quality Control**: Adjustable output quality (0-100)
- **Format Selection**: WebP, JPG, or PNG output formats
- **Batch Generation**: Multiple images per pose (1-4 variations)
- **Safety Controls**: Optional safety checker for content filtering
- **Download Support**: Individual image downloads with preview popup

### User Interface
- **Professional Design**: Clean, intuitive interface with modern styling
- **Responsive Design**: Works on desktop and mobile devices
- **Drag & Drop**: Easy file upload with drag-and-drop support
- **Live Preview**: Instant image preview with detailed file information
- **Interactive Examples**: Built-in examples showing transformation capabilities

## 🚀 Quick Start

1. **Install Dependencies**
   ```powershell
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file:
   ```env
   REPLICATE_API_TOKEN=your_replicate_token_here
   PORT=3002
   ```

3. **Start Server**
   ```powershell
   npm start
   ```

4. **Access Application**
   - Main Interface: `http://localhost:3002/index.html` or `http://localhost:3002/`

## 📁 Project Structure

```
consistent-images/
├── 📄 Frontend Files
│   ├── index.html              # Main application interface
│   ├── style.css               # Application styles
│   └── script.js               # Application functionality
├── 🖥️ Backend Files
│   ├── server.js               # Express server with API endpoints
│   ├── package.json            # Dependencies and scripts
│   └── .env                    # Environment variables (API keys)
├── 📁 Assets & Data
│   ├── img/                    # Example images and generated results
│   │   ├── ref_*.webp          # Reference image examples
│   │   └── gen_*.webp          # Generated example results
│   └── uploads/                # Temporary upload storage
├── 🧪 Testing Files
│   ├── test-health.js          # Health endpoint testing
│   ├── test-preview.html       # Preview functionality testing
│   └── upload-test.html        # Upload functionality testing
└── 📚 Documentation
    └── README.md               # This file
```

## 🛠️ Technical Details

### Dependencies
```json
{
  "cors": "^2.8.5",           // Cross-origin resource sharing
  "dotenv": "^16.3.1",        // Environment variable management
  "express": "^4.18.2",       // Web server framework
  "multer": "^1.4.5-lts.1",   // File upload handling
  "replicate": "^0.25.2"      // AI model API client
}
```

### API Endpoints
- **`GET /api/health`**: Server health check and API token validation
- **`POST /api/generate`**: Image generation with file upload support
- **`GET /`**: Serves static files (HTML, CSS, JS, images)

### File Upload Configuration
- **Max Size**: 10MB per file
- **Formats**: JPG, JPEG, PNG, WebP
- **Storage**: Temporary upload folder with automatic cleanup
- **Validation**: MIME type and extension checking

## 💡 Usage Guide

### Basic Workflow
1. **Access Interface**: Open the main application interface
2. **Upload Reference**: Drag & drop or click to upload your reference image
3. **Preview Confirmation**: Review the reference image preview above the prompt area
4. **Configure Generation**:
   - Enter descriptive prompt (include clothing/hairstyle for better consistency)
   - Set negative prompt to exclude unwanted elements
   - Choose number of outputs (1-20)
   - Select output format and quality
5. **Generate**: Click "Generate Images" and wait for AI processing
6. **Download**: Preview and download individual results

### Best Practices
- ✅ **Use clear, well-lit reference images**
- ✅ **Square or close-up face photos work best**
- ✅ **Include specific clothing and hairstyle details in prompts**
- ✅ **Start with fewer outputs to test prompts**
- ✅ **Use pose randomization for variety**
- ⚠️ **Avoid blurry or low-quality reference images**
- ⚠️ **Keep file sizes reasonable (under 5MB preferred)**

### Example Prompts
- "A professional headshot photo of a person in business attire"
- "A fantasy character in medieval clothing, cinematic lighting"
- "A person in casual clothing, outdoor setting, natural lighting"
- "Portrait photography, studio lighting, professional makeup"

## 🔧 Configuration

### Environment Variables
```env
# Required
REPLICATE_API_TOKEN=r8_***     # Your Replicate API token
PORT=3002                      # Server port (default: 3002)

# Optional
NODE_ENV=production            # Environment mode
```

### Getting Replicate API Token
1. Visit [Replicate.com](https://replicate.com/)
2. Create an account and sign in
3. Go to Account Settings → API Tokens
4. Generate a new token
5. Copy to your `.env` file

## 🐛 Troubleshooting

### Server Issues
**Problem**: Server won't start / Port already in use
```powershell
# Check what's using port 3002
netstat -ano | findstr :3002

# Kill the process (replace [PID] with actual process ID)
taskkill /PID [PID] /F

# Or change port in .env file
echo "PORT=3003" >> .env
```

**Problem**: "Server offline" indicator
- Ensure Node.js server is running (`npm start`)
- Check console for server errors
- Verify port is not blocked by firewall

### API Issues
**Problem**: Generation fails with API errors
- Verify Replicate API token is correct and active
- Check internet connection
- Ensure sufficient API credits in Replicate account
- Try smaller images or fewer outputs

**Problem**: "Content warning" or blocked generations
- Review prompt for inappropriate content
- Try more general descriptions
- Disable safety checker (local development only)

### Upload Issues
**Problem**: File upload fails
- Check file size (max 10MB)
- Ensure file format is JPG, PNG, or WebP
- Try a different image file
- Check browser console for errors

### Browser Issues
**Problem**: Interface not loading correctly
- Clear browser cache and reload
- Try different browser (Chrome, Firefox, Edge)
- Check browser console for JavaScript errors
- Ensure JavaScript is enabled

## 🔒 Security & Privacy

### Data Handling
- **Temporary Storage**: Uploaded files are stored temporarily and automatically deleted
- **No Persistence**: No user data is permanently stored on the server
- **API Security**: Replicate API token is server-side only, not exposed to clients
- **Content Filtering**: Built-in safety checker prevents inappropriate content generation

### Deployment Considerations
- Never commit `.env` files to version control
- Use HTTPS in production environments
- Implement rate limiting for public deployments
- Consider implementing user authentication for production use

## 🔄 Backup & Restore

### Creating Backups
```powershell
# Create timestamped backup
$date = Get-Date -Format "yyyy-MM-dd_HHmm"
$backupDir = "c:\xampp\htdocs\consistent-images-backup_$date"
New-Item -ItemType Directory -Path $backupDir
Copy-Item "c:\xampp\htdocs\consistent-images\*" -Destination $backupDir -Recurse -Exclude "node_modules","uploads"

# Archive backup
Compress-Archive -Path $backupDir -DestinationPath "$backupDir.zip"
```

### Restoring from Backup
```powershell
# Stop server first
# Extract backup files to original location
# Reinstall dependencies
npm install

# Restart server
npm start
```

## 🎨 Customization

### Modifying the Interface
1. Edit `index.html` for structural changes
2. Modify `style.css` for visual styling updates
3. Update `script.js` for functionality changes
4. Test changes thoroughly before deployment

### Adding New Features
1. Add UI elements to `index.html`
2. Style new elements in `style.css`
3. Implement functionality in `script.js`
4. Update server endpoints in `server.js` if needed

### Modifying AI Parameters
Edit the generation request in `server.js`:
```javascript
// Modify default parameters in the /api/generate endpoint
const input = {
    prompt: prompt,
    negative_prompt: negativePrompt,
    // Add custom parameters here
};
```

## 📈 Performance Optimization

### Client-Side
- Images are automatically resized for upload
- Lazy loading for example images
- Efficient DOM manipulation
- Progressive enhancement approach

### Server-Side
- File cleanup after processing
- Memory-efficient file handling
- Error handling and recovery
- Request validation and sanitization

## 🆘 Support & Troubleshooting

### Quick Diagnostics
```powershell
# Test server health
curl http://localhost:3002/api/health

# Check dependencies
npm list

# Verify Node.js version
node --version

# Check server logs
npm start
```

### Common Error Messages
- **"No image file provided"**: Upload a reference image first
- **"Please enter a prompt"**: Add description text before generating
- **"Server offline"**: Start the Node.js server with `npm start`
- **"Rate limit exceeded"**: Wait before making more API requests
- **"Invalid file type"**: Use JPG, PNG, or WebP format only

### Getting Help
1. Check browser console for JavaScript errors
2. Check server terminal for Node.js errors  
3. Test API endpoints directly with curl
4. Verify all files are present and not corrupted
5. Try with different reference images and prompts

---

**Version**: 2.0.0 (Professional Interface)  
**Last Updated**: June 2025  
**AI Model**: Replicate Consistent Character API
