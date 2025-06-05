const Replicate = require('replicate');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('🎯 POST /api/generate - Request received');
    const startTime = Date.now();
    
    try {
        const { prompt, subject, number_of_outputs, output_format, output_quality, randomise_poses, negative_prompt, seed, disable_safety_checker, number_of_images_per_pose } = req.body;

        if (!subject) {
            console.error('No image data provided');
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Add content moderation warning message
        console.log('Processing request with prompt:', prompt);
        if (prompt && (prompt.toLowerCase().includes('nude') || 
            prompt.toLowerCase().includes('naked') ||
            prompt.toLowerCase().includes('explicit'))) {
            return res.status(400).json({ 
                error: 'Content warning: Please avoid prompts that could generate inappropriate content.'
            });
        }

        // Initialize Replicate client
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });
        
        // Create prediction input
        const input = {
            prompt: prompt || "A headshot photo",
            subject: subject,
            number_of_outputs: parseInt(number_of_outputs || "3"),
            output_format: output_format || "webp",
            output_quality: parseInt(output_quality || "80"),
            randomise_poses: randomise_poses !== "false"
        };

        // Add optional parameters
        if (negative_prompt) {
            input.negative_prompt = negative_prompt;
        }
        if (seed) {
            input.seed = parseInt(seed);
        }
        if (disable_safety_checker !== undefined) {
            input.disable_safety_checker = disable_safety_checker === "true";
        }
        if (number_of_images_per_pose) {
            input.number_of_images_per_pose = parseInt(number_of_images_per_pose);
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
                error: result.error
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
    }
}
