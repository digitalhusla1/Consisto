class ConsistentImageGenerator {
    constructor() {
        this.currentImageFile = null;
        this.currentImageUrl = null;
        this.isGenerating = false;
        this.isServerOnline = false;
        this.lastGenerationTime = 0;
        this.minTimeBetweenGenerations = 5000; // 5 seconds
        
        this.initializeElements();
        this.attachEventListeners();
        this.resetOnPageLoad();
        this.checkServerStatus();
    }    initializeElements() {
        // File upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImage = document.getElementById('previewImage');
        this.removeImageBtn = document.getElementById('removeImage');
          // Image info elements
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.imageDimensions = document.getElementById('imageDimensions');
        this.imageFormat = document.getElementById('imageFormat');
        
        // Reference preview elements (above prompt table)
        this.referencePreviewSection = document.getElementById('referencePreviewSection');
        this.referencePreviewImage = document.getElementById('referencePreviewImage');
        this.referenceFileName = document.getElementById('referenceFileName');
        this.referenceDimensions = document.getElementById('referenceDimensions');
        this.referenceSize = document.getElementById('referenceSize');
          console.log('Element initialization:', {
            uploadArea: !!this.uploadArea,
            imageInput: !!this.imageInput,
            uploadPlaceholder: !!this.uploadPlaceholder,
            imagePreview: !!this.imagePreview,
            previewImage: !!this.previewImage,
            removeImageBtn: !!this.removeImageBtn,
            fileName: !!this.fileName,
            fileSize: !!this.fileSize,
            imageDimensions: !!this.imageDimensions,
            imageFormat: !!this.imageFormat,
            resultsSection: !!this.resultsSection,
            imageGrid: !!this.imageGrid,
            generationInfo: !!this.generationInfo,
            errorMessage: !!this.errorMessage
        });// Input elements
        this.promptInput = document.getElementById('promptInput');
        this.negativePromptInput = document.getElementById('negativePromptInput');

        // Generation controls
        this.generateBtn = document.getElementById('generateBtn');
        this.generateText = document.getElementById('generateText');
        this.loadingSpinner = document.getElementById('loadingSpinner');        // Results section
        this.resultsSection = document.getElementById('resultsSection');
        this.imageGrid = document.getElementById('imageGrid');
        this.galleryGrid = this.imageGrid; // Alias for consistency
        this.errorMessage = document.getElementById('errorMessage');
        this.generationInfo = document.getElementById('generationInfo');

        // Settings
        this.numberOfOutputs = document.getElementById('numberOfOutputs');
        this.imagesPerPose = document.getElementById('imagesPerPose');
        this.outputFormat = document.getElementById('outputFormat');
        this.outputQuality = document.getElementById('outputQuality');
        this.qualityValue = document.getElementById('qualityValue');
        this.seed = document.getElementById('seed');
        this.randomisePoses = document.getElementById('randomisePoses');
        this.disableSafetyChecker = document.getElementById('disableSafetyChecker');
        this.serverStatus = document.getElementById('serverStatus');
        this.statusDot = this.serverStatus.querySelector('.status-dot');
        this.statusText = this.serverStatus.querySelector('.status-text');

        this.previewPopup = document.getElementById('previewPopup');
        this.popupPreviewImage = document.getElementById('popupPreviewImage');
        this.closePreviewBtn = document.getElementById('closePreview');
        
        // Examples section
        this.examplesSection = document.querySelector('.examples-section');
        
        // Initialize examples animations
        this.initializeExamples();
    }

    initializeExamples() {        
        // Add click handlers to example placeholders for demonstration
        const examplePlaceholders = document.querySelectorAll('.example-image-placeholder, .example-image-container');
        examplePlaceholders.forEach((placeholder, index) => {
            placeholder.addEventListener('click', () => {
                this.showExampleTooltip(placeholder, index);
            });
        });

        // Add specific handling for example images
        const exampleImages = document.querySelectorAll('.example-image');
        exampleImages.forEach((img, index) => {
            // Add click-to-zoom functionality
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showImagePreview(img);
            });

            // Add loading effects
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });

            // Handle loading errors
            img.addEventListener('error', () => {
                console.warn(`Failed to load example image: ${img.src}`);
                img.style.opacity = '0.5';
                img.alt = 'Image loading failed';
            });
        });
        
        // Add animation on scroll
        this.observeExamples();
    }

    observeExamples() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = `${Math.random() * 0.5}s`;
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.example-group').forEach(group => {
            observer.observe(group);
        });
    }

    showExampleTooltip(element, index) {
        // Create a simple tooltip showing what each placeholder represents
        const tooltips = [
            "Upload a clear photo like this as your reference image",
            "The AI will generate variations of your character in different poses",
            "Each generated image maintains the character's features while changing the pose",
            "You can generate multiple variations at once",
            "Upload any character photo to get started",
            "Fantasy and artistic styles work great too",
            "The AI adapts to different clothing and themes",
            "Consistent facial features across all generations"
        ];
        
        const tooltip = tooltips[index] || "Click 'Generate Images' to try it yourself!";
        
        // Simple alert for now - you could replace with a proper tooltip component
        const existingTooltip = document.querySelector('.example-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'example-tooltip';
        tooltipElement.textContent = tooltip;
        tooltipElement.style.cssText = `
            position: absolute;
            background: #1F2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            z-index: 1000;
            max-width: 200px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        const rect = element.getBoundingClientRect();
        tooltipElement.style.left = `${rect.left + rect.width / 2}px`;
        tooltipElement.style.top = `${rect.top - 10}px`;
        tooltipElement.style.transform = 'translate(-50%, -100%)';
        
        document.body.appendChild(tooltipElement);
        
        setTimeout(() => {
            if (tooltipElement.parentNode) {
                tooltipElement.remove();
            }
        }, 3000);
    }    attachEventListeners() {
        // File upload area click
        this.uploadArea.addEventListener('click', () => {
            this.imageInput.click();
        });

        // File input change
        this.imageInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Remove image button
        if (this.removeImageBtn) {
            this.removeImageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeImage();
            });
        }

        // Setup drag and drop
        this.setupDragAndDrop();

        // Quality slider
        this.outputQuality.addEventListener('input', (e) => {
            this.qualityValue.textContent = e.target.value;
        });

        // Update generate button state on input changes
        const inputs = [
            this.promptInput, this.negativePromptInput, this.numberOfOutputs,
            this.outputFormat, this.outputQuality, this.randomisePoses, 
            this.disableSafetyChecker
        ];
        
        inputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.updateGenerateButton());
                input.addEventListener('change', () => this.updateGenerateButton());
            }
        });

        // Generate button
        this.generateBtn.addEventListener('click', () => this.generateImages());

        // Preview popup event listeners
        if (this.closePreviewBtn) {
            this.closePreviewBtn.addEventListener('click', () => this.hidePreview());
        }
        if (this.previewPopup) {
            this.previewPopup.addEventListener('click', (e) => {
                if (e.target === this.previewPopup) {
                    this.hidePreview();
                }
            });
        }
    }    setupDragAndDrop() {
        if (!this.uploadArea) {
            return;
        }
        
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleFileSelect(file);
            }
        });
    }resetOnPageLoad() {        this.currentImageFile = null;
        this.currentImageUrl = null;
        this.imageInput.value = '';
        this.promptInput.value = '';
        this.showUploadPlaceholder();
        this.hideReferencePreview();
        this.hideResults();
        this.hideError();
        this.updateGenerateButton();
    }

    async checkServerStatus() {
        try {
            const response = await fetch('http://localhost:3002/api/health');
            const data = await response.json();
            
            if (response.ok && data.status === 'ok') {
                this.setServerStatus(true);
            } else {
                throw new Error(data.error || 'Server health check failed');
            }
        } catch (error) {
            console.error('Server health check failed:', error);
            this.setServerStatus(false);
            setTimeout(() => this.checkServerStatus(), 5000); // Retry every 5 seconds
        }
    }

    setServerStatus(online) {
        this.isServerOnline = online;
        this.statusDot.className = 'status-dot ' + (online ? 'online' : 'offline');
        this.statusText.className = 'status-text ' + (online ? 'online' : 'offline');
        this.statusText.textContent = online ? 'Server online' : 'Server offline';
        this.updateGenerateButton();
    }    handleFileSelect(file) {
        console.log('handleFileSelect called with:', file);
        
        if (!file || !file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }

        // Add file size validation (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size must be less than 10MB');
            return;
        }

        if (this.currentImageUrl) {
            URL.revokeObjectURL(this.currentImageUrl);
        }

        this.currentImageFile = file;
        this.currentImageUrl = URL.createObjectURL(file);
        
        console.log('Created URL:', this.currentImageUrl);
        console.log('Preview image element:', this.previewImage);
          // Set the image source and show preview
        if (this.previewImage) {
            this.previewImage.onload = () => {
                this.updateImageInfo(file, this.previewImage);
                this.showReferencePreview(file, this.previewImage);
                console.log('Image loaded successfully: ' + file.name);
            };
            this.previewImage.src = this.currentImageUrl;
            console.log('Set preview image src to:', this.currentImageUrl);
        } else {
            console.error('Preview image element not found!');
        }
        
        console.log('Calling showImagePreview...');
        this.showImagePreview();
        this.updateGenerateButton();
        this.hideError();
    }    removeImage() {
        if (this.currentImageUrl) {
            URL.revokeObjectURL(this.currentImageUrl);
        }
        
        this.currentImageFile = null;
        this.currentImageUrl = null;
        this.imageInput.value = '';
        this.showUploadPlaceholder();
        this.hideReferencePreview();
        this.updateGenerateButton();
        this.hideResults();
    }showUploadPlaceholder() {
        if (this.uploadPlaceholder && this.imagePreview) {
            this.uploadPlaceholder.style.display = 'block';
            this.imagePreview.style.display = 'none';
        }
    }    showImagePreview() {
        console.log('showImagePreview called');
        console.log('uploadPlaceholder element:', this.uploadPlaceholder);
        console.log('imagePreview element:', this.imagePreview);
        
        if (this.uploadPlaceholder && this.imagePreview) {
            console.log('Hiding placeholder, showing preview');
            this.uploadPlaceholder.style.display = 'none';
            this.imagePreview.style.display = 'block';
            console.log('uploadPlaceholder display:', this.uploadPlaceholder.style.display);
            console.log('imagePreview display:', this.imagePreview.style.display);
        } else {
            console.error('Missing elements:', {
                uploadPlaceholder: !!this.uploadPlaceholder,
                imagePreview: !!this.imagePreview
            });
        }    }

    showReferencePreview(file, img) {
        console.log('showReferencePreview called with:', file.name);
        
        if (this.referencePreviewSection && this.referencePreviewImage) {
            // Set the reference preview image
            this.referencePreviewImage.src = this.currentImageUrl;
            
            // Update reference info
            if (this.referenceFileName) {
                this.referenceFileName.textContent = file.name;
            }
            if (this.referenceDimensions) {
                this.referenceDimensions.textContent = `${img.naturalWidth}×${img.naturalHeight}`;
            }
            if (this.referenceSize) {
                this.referenceSize.textContent = this.formatFileSize(file.size);
            }
            
            // Show the reference preview section
            this.referencePreviewSection.style.display = 'block';
            console.log('Reference preview section shown');
        } else {
            console.error('Reference preview elements not found!');
        }
    }

    hideReferencePreview() {
        if (this.referencePreviewSection) {
            this.referencePreviewSection.style.display = 'none';
            console.log('Reference preview section hidden');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateImageInfo(file, img) {
        if (this.fileName) this.fileName.textContent = file.name;
        if (this.fileSize) this.fileSize.textContent = this.formatFileSize(file.size);
        if (this.imageDimensions) this.imageDimensions.textContent = `${img.naturalWidth} × ${img.naturalHeight}px`;
        if (this.imageFormat) this.imageFormat.textContent = file.type.split('/')[1].toUpperCase();
        
        console.log('Updated image info:', {
            name: file.name,
            size: this.formatFileSize(file.size),
            dimensions: `${img.naturalWidth} × ${img.naturalHeight}px`,
            format: file.type.split('/')[1].toUpperCase()
        });
    }

    updateGenerateButton() {
        const hasImage = this.currentImageFile !== null;
        const hasPrompt = this.promptInput.value.trim().length > 0;
        const canGenerate = hasImage && hasPrompt && !this.isGenerating && this.isServerOnline;
        
        this.generateBtn.disabled = !canGenerate;
        
        if (!this.isServerOnline) {
            this.generateBtn.title = 'Server is offline';
        } else if (!hasImage) {
            this.generateBtn.title = 'Please upload an image';
        } else if (!hasPrompt) {
            this.generateBtn.title = 'Please enter a prompt';
        } else {
            this.generateBtn.title = '';
        }
    }

    async generateImages() {
        try {
            this.hideError();
            
            // Add rate limiting check
            const now = Date.now();
            const timeSinceLastGeneration = now - this.lastGenerationTime;
            if (timeSinceLastGeneration < this.minTimeBetweenGenerations) {
                const waitTime = Math.ceil((this.minTimeBetweenGenerations - timeSinceLastGeneration) / 1000);
                this.showError(`Please wait ${waitTime} seconds before generating more images.`);
                return;
            }

            if (!this.currentImageFile) {
                this.showError('Please upload an image first.');
                return;
            }

            if (!this.promptInput.value.trim()) {
                this.showError('Please enter a prompt.');
                return;
            }

            // Check prompt for potential issues
            const prompt = this.promptInput.value.trim().toLowerCase();
            if (prompt.includes('nude') || prompt.includes('naked') || prompt.includes('explicit')) {
                this.showError('Please avoid prompts that could generate inappropriate content.');
                return;
            }

            this.setGeneratingState(true);
              const formData = new FormData();
            formData.append('image', this.currentImageFile);
            formData.append('prompt', this.promptInput.value.trim());
            formData.append('number_of_outputs', this.numberOfOutputs.value);
            formData.append('output_format', this.outputFormat.value);
            formData.append('output_quality', this.outputQuality.value);
            formData.append('randomise_poses', this.randomisePoses.checked);
            formData.append('disable_safety_checker', this.disableSafetyChecker.checked);
            formData.append('number_of_images_per_pose', this.imagesPerPose.value);

            if (this.seed.value.trim()) {
                formData.append('seed', parseInt(this.seed.value.trim()));
            }

            if (this.negativePromptInput.value.trim()) {
                formData.append('negative_prompt', this.negativePromptInput.value.trim());
            }

            console.log('Sending request to server...');
            const response = await fetch('http://localhost:3002/api/generate', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
                const error = new Error(data.error || 'Generation failed');
                error.status = response.status;
                throw error;
            }

            this.lastGenerationTime = Date.now();
            console.log('Generation successful:', {
                imageCount: data.images.length,
                duration: data.duration
            });
            this.displayResults(data.images, data.duration);

        } catch (error) {
            console.error('Generation error:', error);
            
            // Handle different types of errors
            let errorMessage = error.message;
            if (error.status === 429 || errorMessage.includes('rate')) {
                errorMessage = 'Please wait a moment before generating more images.';
            } else if (error.message.includes('safety')) {
                errorMessage = 'Content warning: The request was blocked by safety filters. Please try a different prompt or image.';
            }
            
            this.showError(errorMessage);
            
        } finally {
            this.setGeneratingState(false);
        }
    }

    setGeneratingState(generating) {
        this.isGenerating = generating;
        
        if (generating) {
            this.generateText.textContent = 'Generating...';
            this.loadingSpinner.style.display = 'block';
        } else {
            this.generateText.textContent = 'Generate Images';
            this.loadingSpinner.style.display = 'none';
        }
        
        this.updateGenerateButton();
    }    displayResults(images, duration) {
        console.log('displayResults called with:', { images, duration, imageGrid: !!this.imageGrid, resultsSection: !!this.resultsSection });
        
        // Add title to results section if it doesn't exist
        if (!this.resultsSection.querySelector('h3')) {
            const title = document.createElement('h3');
            title.textContent = 'Your Generated Images';
            this.resultsSection.insertBefore(title, this.generationInfo);
        }
        
        this.imageGrid.innerHTML = '';
        
        if (duration) {
            this.generationInfo.innerHTML = `<p>✅ Generated ${images.length} images in ${duration} seconds</p>`;
        }
        
        images.forEach((imageUrl, index) => {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'generated-image';
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `Generated image ${index + 1}`;
            img.loading = 'lazy';
              const previewLink = document.createElement('button');
            previewLink.textContent = 'Preview';
            previewLink.className = 'preview-link';
            previewLink.onclick = () => this.showPreview(imageUrl);
            
            imageContainer.appendChild(img);
            imageContainer.appendChild(previewLink);
            this.imageGrid.appendChild(imageContainer);
        });
        
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        
        // Only auto-hide non-critical errors
        if (!message.includes('wait') && !message.includes('safety')) {
            setTimeout(() => this.hideError(), 5000);
        }
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    hideResults() {
        this.resultsSection.style.display = 'none';
    }    showPreview(imageUrl) {
        this.popupPreviewImage.src = imageUrl;
        this.previewPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }hidePreview() {
        this.previewPopup.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            this.popupPreviewImage.src = '';
        }, 300);
    }    showImagePreview(img) {
        // Create a clean image preview modal
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <span class="modal-title">Image Preview</span>
                        <button class="modal-close" onclick="this.closest('.image-modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <img src="${img.src}" alt="${img.alt}" class="modal-image">
                        <div class="modal-info">
                            <span class="info-label">Description:</span>
                            <span class="info-value">${img.alt}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add modal styling if not already present
        if (!document.querySelector('#modal-styles')) {
            const modalStyles = document.createElement('style');
            modalStyles.id = 'modal-styles';
            modalStyles.textContent = `
                .image-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                }
                
                .modal-backdrop {
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 15px;
                    max-width: 80%;
                    max-height: 80%;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }
                
                .modal-header {
                    background: var(--primary-color);
                    color: white;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-title {
                    font-weight: 600;
                    font-size: 1.1rem;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.2s ease;
                }
                
                .modal-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .modal-body {
                    padding: 1.5rem;
                    text-align: center;
                }
                
                .modal-image {
                    max-width: 100%;
                    max-height: 60vh;
                    object-fit: contain;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }
                
                .modal-info {
                    margin-top: 1rem;
                    color: var(--text-color);
                    text-align: left;
                }
                
                .info-label {
                    color: var(--primary-color);
                    font-weight: 600;
                }
                
                .info-value {
                    color: #6B7280;
                    margin-left: 0.5rem;
                }
            `;
            document.head.appendChild(modalStyles);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ConsistentImageGenerator();
});
