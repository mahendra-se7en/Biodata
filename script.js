document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Element Selection ---
    const profilePicUpload = document.getElementById('profilePicUpload');
    const profilePic = document.getElementById('profilePic');
    const galleryUpload = document.getElementById('galleryUpload');
    const gallery = document.getElementById('gallery');
    
    const cropModal = document.getElementById('cropModal');
    const imageToCrop = document.getElementById('imageToCrop');
    const cropButton = document.getElementById('cropButton');
    const cancelCrop = document.getElementById('cancelCrop');
    
    // --- State Variables ---
    let cropper;
    let currentCropTarget = null; // To know if we are cropping for 'profile' or 'gallery'
    let galleryFilesQueue = []; // To handle multiple file uploads for the gallery

    /**
     * Initializes and shows the cropping modal with the selected image.
     * @param {File} file - The image file selected by the user.
     * @param {string} target - The destination for the cropped image ('profile' or 'gallery').
     */
    function showCropper(file, target) {
        currentCropTarget = target;
        const reader = new FileReader();
        reader.onload = function(e) {
            imageToCrop.src = e.target.result;
            cropModal.style.display = 'flex';
            
            let cropperOptions = { 
                viewMode: 1, 
                background: false, 
                autoCropArea: 1 
            };
            
            // Set aspect ratio based on the target
            if (target === 'profile') {
                cropperOptions.aspectRatio = 1 / 1;
                cropperOptions.guides = false; // Hide guides for circular crop
            } else {
                cropperOptions.aspectRatio = 1 / 1; // Square for gallery images
            }

            if (cropper) cropper.destroy(); // Destroy previous cropper instance if it exists
            cropper = new Cropper(imageToCrop, cropperOptions);
        };
        reader.readAsDataURL(file);
    }

    /**
     * Hides the cropping modal and cleans up the cropper instance.
     */
    function hideCropper() {
        cropModal.style.display = 'none';
        if (cropper) cropper.destroy();
        cropper = null;
        // Reset file inputs to allow re-uploading the same file if needed
        profilePicUpload.value = '';
        galleryUpload.value = '';
    }

    // --- Event Listeners ---

    // Listen for profile picture file selection
    profilePicUpload.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) {
            showCropper(e.target.files[0], 'profile');
        }
    });

    // Listen for gallery image file selection
    let firstGalleryUpload = true;
    galleryUpload.addEventListener('change', function(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            // On the very first upload to the gallery, clear the placeholder images
            if (firstGalleryUpload) {
                gallery.innerHTML = '';
                firstGalleryUpload = false;
            }
            galleryFilesQueue = Array.from(files); // Create a queue of files to crop
            processGalleryQueue();
        }
    });
    
    /**
     * Processes the gallery file queue one by one, showing the cropper for each.
     */
    function processGalleryQueue() {
        if (galleryFilesQueue.length > 0) {
            showCropper(galleryFilesQueue.shift(), 'gallery'); // Show cropper for the next file
        }
    }

    // Handle the "Crop & Save" button click
    cropButton.addEventListener('click', function() {
        if (!cropper) return;
        
        // Get the cropped image data as a URL
        const dataUrl = cropper.getCroppedCanvas({width: 500, height: 500}).toDataURL('image/jpeg');

        if (currentCropTarget === 'profile') {
            profilePic.src = dataUrl;
        } else if (currentCropTarget === 'gallery') {
            // Create a new image element for the gallery
            const img = document.createElement('img');
            img.src = dataUrl;
            img.alt = "Gallery image";
            img.className = 'w-full h-48 object-cover border-2 border-gold p-1';
            gallery.appendChild(img);
        }
        
        hideCropper();
        
        // If there are more images in the gallery queue, process the next one
        if (currentCropTarget === 'gallery' && galleryFilesQueue.length > 0) {
            setTimeout(processGalleryQueue, 100); // Short delay for a smoother transition
        }
    });
    
    // Handle the "Cancel" button click
    cancelCrop.addEventListener('click', hideCropper);
});
