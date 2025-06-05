const Replicate = require('replicate');

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    console.log('🎯 POST /api/generate - Request received');
    const startTime = Date.now();
    
    try {
        const body = JSON.parse(event.body);
        const { prompt, subject, number_of_outputs, output_format, output_quality, randomise_poses, negative_prompt, seed, disable_safety_checker, number_of_images_per_pose } = body;

        if (!subject) {
            console.error('No image data provided');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'No image data provided' })
            };
        }

        // Enhanced content moderation with more keywords
        const inappropriateKeywords = ['nude', 'naked', 'explicit', 'nsfw', 'porn', 'sexual'];
        const promptLower = prompt ? prompt.toLowerCase() : '';
        
        if (prompt && inappropriateKeywords.some(keyword => promptLower.includes(keyword))) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Content warning: Please avoid prompts that could generate inappropriate content.'
                })
            };
        }

        // Check minimum prompt length
        if (prompt && prompt.length < 5) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Prompt must be at least 5 characters long.'
                })
            };
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

        // Add optional parameters if provided
        if (negative_prompt) input.negative_prompt = negative_prompt;
        if (seed) input.seed = parseInt(seed);
        if (disable_safety_checker !== undefined) input.disable_safety_checker = disable_safety_checker === "true";
        if (number_of_images_per_pose) input.number_of_images_per_pose = parseInt(number_of_images_per_pose);

        console.log('Running prediction with input:', JSON.stringify(input, null, 2));

        // Run the prediction
        const prediction = await replicate.run(
            "fofr/consistent-character:84a1e7099434e2e3b8e8c79e3a3b0b8ee5fee6b4c5a8df4c7b7a9c6b2a0b0f0",
            { input }
        );

        if (!prediction || prediction.length === 0) {
            throw new Error('No images generated');
        }

        console.log(`✅ Generated ${prediction.length} images in ${Date.now() - startTime}ms`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                images: prediction,
                metadata: {
                    prompt: input.prompt,
                    count: prediction.length,
                    processingTime: Date.now() - startTime
                }
            })
        };

    } catch (error) {
        console.error('❌ Error in generate function:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to generate images',
                details: error.message
            })
        };
    }
};
