import express from 'express';
import cors from 'cors';
import Replicate from 'replicate';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize Replicate client
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'), false);
        }
        const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const ext = file.originalname.split('.').pop().toLowerCase();
        if (!validExtensions.includes(ext)) {
            return cb(new Error('Invalid file type. Allowed: jpg, jpeg, png, webp'), false);
        }
        cb(null, true);
    }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
try {
    await fs.access(uploadsDir);
} catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const response = await fetch('https://api.replicate.com/v1/account', {
            headers: {
                'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
            }
        });
        const data = await response.json();
        
        res.json({ 
            status: response.ok ? 'ok' : 'error',
            timestamp: new Date().toISOString(),
            replicateAuth: response.ok,
            account: response.ok ? data : null,
            error: !response.ok ? data.detail : null
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// API Route for image generation
app.post('/api/generate', upload.single('image'), async (req, res) => {
    console.log('🎯 POST /api/generate - Request received');
    console.log('Request body:', {
        ...req.body,
        image: req.file ? 'File received' : 'No file'
    });
    const startTime = Date.now();
    
    try {
        if (!req.file) {
            console.error('No image file provided');
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Add content moderation warning message
        console.log('Processing request with prompt:', req.body.prompt);
        if (req.body.prompt.toLowerCase().includes('nude') || 
            req.body.prompt.toLowerCase().includes('naked') ||
            req.body.prompt.toLowerCase().includes('explicit')) {
            return res.status(400).json({ 
                error: 'Content warning: Please avoid prompts that could generate inappropriate content.'
            });
        }

        console.log('File details:', {
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Read and encode file as base64
        const imageBuffer = await fs.readFile(req.file.path);
        console.log('Image read successfully, size:', imageBuffer.length);
        const base64Image = imageBuffer.toString('base64');
        const imageDataUrl = `data:${req.file.mimetype};base64,${base64Image}`;
        
        // Create prediction input
        const input = {
            prompt: req.body.prompt || "A headshot photo",
            subject: imageDataUrl,
            number_of_outputs: parseInt(req.body.number_of_outputs || "3"),
            output_format: req.body.output_format || "webp",
            output_quality: parseInt(req.body.output_quality || "80"),
            randomise_poses: req.body.randomise_poses !== "false"
        };

        // Add optional parameters
        if (req.body.negative_prompt) {
            input.negative_prompt = req.body.negative_prompt;
        }
        if (req.body.seed) {
            input.seed = parseInt(req.body.seed);
        }
        if (req.body.disable_safety_checker !== undefined) {
            input.disable_safety_checker = req.body.disable_safety_checker === "true";
        }
        if (req.body.number_of_images_per_pose) {
            input.number_of_images_per_pose = parseInt(req.body.number_of_images_per_pose);
        }

        console.log('Creating prediction with input:', {
            ...input,
            subject: 'Base64 image data (truncated)'
        });

        // Create prediction
        const prediction = await replicate.predictions.create({
            version: "9c77a3c2f884193fcee4d89645f02a0b9def9434f9e03cb98460456b831c8772",
            input: input
        });

        console.log('Prediction created:', prediction.id);

        // Poll for the prediction result with better error handling
        let result;
        let attempts = 0;
        const maxAttempts = 120; // 2 minutes timeout
        
        while (attempts < maxAttempts) {
            result = await replicate.predictions.get(prediction.id);
            console.log(`Polling attempt ${attempts + 1}:`, {
                status: result.status,
                error: result.error,
                logs: result.logs
            });
            
            if (result.status === 'succeeded') {
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log('Generation successful:', {
                    duration,
                    imageCount: result.output.length
                });
                return res.json({ 
                    success: true,
                    images: result.output,
                    duration: duration
                });
            } 
            
            if (result.status === 'failed') {
                // Extract meaningful error message
                let errorMessage = result.error || 'Generation failed';
                
                // Check for safety filter triggers
                if (result.logs && result.logs.includes('safety')) {
                    errorMessage = 'The image generation was blocked by safety filters. Please try a different prompt or image.';
                }
                // Check for API rate limits
                else if (result.error && result.error.includes('rate')) {
                    errorMessage = 'Rate limit reached. Please wait a moment before trying again.';
                }
                
                throw new Error(errorMessage);
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        throw new Error('Generation timed out. Please try again.');

    } catch (error) {
        console.error('Generation error:', error);
        
        // Format user-friendly error message
        let userMessage = error.message;
        if (error.message.includes('safety')) {
            userMessage = 'Content warning: The request was blocked by safety filters. Please try a different prompt or image.';
        } else if (error.message.includes('rate')) {
            userMessage = 'Please wait a moment before generating more images.';
        }
        
        res.status(500).json({ error: userMessage });
        
    } finally {
        // Clean up uploaded file
        if (req.file) {
            await fs.unlink(req.file.path).catch(error => {
                console.error('Error deleting uploaded file:', error);
            });
        }
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
