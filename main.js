// --- Data ---
const devices = [
    // Common aspect ratios and resolutions.
    // Reserved areas are estimates. Real devices vary greatly.
    // These values (reservedTop, etc.) are in pixels.
    { name: "Generic Phone (19.5:9)", width: 1080, height: 2340, reservedTop: 120, reservedBottom: 100, reservedLeft: 30, reservedRight: 30 },
    { name: "Generic Phone (20:9)", width: 1080, height: 2400, reservedTop: 130, reservedBottom: 100, reservedLeft: 30, reservedRight: 30 },
    { name: "Generic Phone (16:9)", width: 1080, height: 1920, reservedTop: 100, reservedBottom: 80, reservedLeft: 20, reservedRight: 20 },
    { name: "iPhone 15 Pro Max (19.5:9)", width: 1290, height: 2796, reservedTop: 170, reservedBottom: 120, reservedLeft: 40, reservedRight: 40 },
    { name: "iPhone 15 (19.5:9)", width: 1179, height: 2556, reservedTop: 160, reservedBottom: 110, reservedLeft: 35, reservedRight: 35 },
    { name: "Samsung Galaxy S24 Ultra (19.3:9)", width: 1440, height: 3120, reservedTop: 150, reservedBottom: 110, reservedLeft: 30, reservedRight: 30 },
    { name: "Google Pixel 8 Pro (20:9)", width: 1344, height: 2992, reservedTop: 140, reservedBottom: 100, reservedLeft: 30, reservedRight: 30 },
    { name: "Square (for testing)", width: 1000, height: 1000, reservedTop: 50, reservedBottom: 50, reservedLeft: 50, reservedRight: 50 },
];

const messages = [
    "Owner Does Not Consent To Search of This Device.",
    "This Device Is Private Property. A Warrant Is Required.",
    "I Invoke My Right To Remain Silent.",
    "Access Restricted. Authorized Users Only.",
    "If Found, Please Contact: [Your Info Here]",
    "Privacy Is A Right, Not A Privilege.",
    "Handle With Care: Private Data Enclosed."
];

// Color templates for quick selection
const colorTemplates = [
    { name: "Classic Dark", bg: "#222222", text: "#FFFFFF" },
    { name: "Pure Black", bg: "#000000", text: "#FFFFFF" },
    { name: "Clean White", bg: "#FFFFFF", text: "#000000" },
    { name: "Navy Blue", bg: "#1e3a8a", text: "#FFFFFF" },
    { name: "Forest Green", bg: "#166534", text: "#FFFFFF" },
    { name: "Deep Red", bg: "#991b1b", text: "#FFFFFF" },
    { name: "Purple", bg: "#7c3aed", text: "#FFFFFF" },
    { name: "Charcoal", bg: "#374151", text: "#FFFFFF" },
    { name: "Charcoal", bg: "#374151", text: "#FFFFFF" },
    { name: "Light Gray", bg: "#f3f4f6", text: "#000000" },
    { name: "Soft Blue", bg: "#dbeafe", text: "#000000" },
    { name: "Mint Green", bg: "#d1fae5", text: "#000000" },
    { name: "Warm Beige", bg: "#fef3c7", text: "#000000" },
    { name: "Lavender", bg: "#e0e7ff", text: "#000000" },
    { name: "Peach", bg: "#fed7aa", text: "#000000" },
    { name: "Rose Pink", bg: "#fce7f3", text: "#000000" },
    { name: "Ice Blue", bg: "#ecfeff", text: "#000000" }
];

// --- DOM Elements ---
const phoneModelSelect = document.getElementById('phoneModel');
const privacyMessageSelect = document.getElementById('privacyMessage');
const backgroundColorInput = document.getElementById('backgroundColor');
const textColorSelect = document.getElementById('textColor');
const generateButton = document.getElementById('generateButton');
const downloadButton = document.getElementById('downloadButton');
const canvas = document.getElementById('lockscreenCanvas');
const ctx = canvas.getContext('2d');
const previewContainer = document.getElementById('previewContainer');
const appMessageDiv = document.getElementById('appMessage');
const colorTemplatesContainer = document.getElementById('colorTemplates');

let selectedTemplateIndex = 0; // Default to first template

// --- Initialization ---
function init() {
    // Populate dropdowns
    devices.forEach((device, index) => {
        const option = new Option(device.name, index);
        phoneModelSelect.add(option);
    });

    messages.forEach((message, index) => {
        const option = new Option(message, index);
        privacyMessageSelect.add(option);
    });

    // Populate color templates
    populateColorTemplates();
    
    // Event Listeners
    generateButton.addEventListener('click', generateImage);
    downloadButton.addEventListener('click', downloadImage);
    
    // Color preview updates
    backgroundColorInput.addEventListener('input', updateColorPreviews);
    textColorSelect.addEventListener('change', updateColorPreviews);
    
    // Hide canvas initially by not setting its dimensions
    canvas.style.display = 'none';

    showMessage("Select your options and click 'Generate Lockscreen'. Note: Reserved areas for OS elements are estimates.", "info");
}

// --- Color Template Functions ---
function populateColorTemplates() {
    colorTemplates.forEach((template, index) => {
        const templateDiv = document.createElement('div');
        templateDiv.className = `color-template ${index === 0 ? 'selected' : ''}`;
        templateDiv.onclick = () => selectColorTemplate(index);
        templateDiv.title = template.name;
        templateDiv.tabIndex = 0;
        templateDiv.setAttribute('role', 'radio');
        templateDiv.setAttribute('aria-checked', index === 0 ? 'true' : 'false');
        templateDiv.setAttribute('aria-label', `${template.name} color template`);
        
        // Add keyboard navigation
        templateDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectColorTemplate(index);
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (index + 1) % colorTemplates.length;
                document.querySelectorAll('.color-template')[nextIndex].focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (index - 1 + colorTemplates.length) % colorTemplates.length;
                document.querySelectorAll('.color-template')[prevIndex].focus();
            }
        });
        
        templateDiv.innerHTML = `
            <div class="bg-section" style="background-color: ${template.bg}"></div>
            <div class="text-section" style="background-color: ${template.bg}; color: ${template.text}">Aa</div>
        `;
        
        colorTemplatesContainer.appendChild(templateDiv);
    });
    
    // Set initial colors from first template
    applyColorTemplate(0);
}

function selectColorTemplate(index) {
    // Remove selected class from all templates
    document.querySelectorAll('.color-template').forEach((template, i) => {
        template.classList.remove('selected');
        template.setAttribute('aria-checked', 'false');
        template.tabIndex = -1;
    });
    
    // Add selected class to clicked template
    const selectedTemplate = document.querySelectorAll('.color-template')[index];
    selectedTemplate.classList.add('selected');
    selectedTemplate.setAttribute('aria-checked', 'true');
    selectedTemplate.tabIndex = 0;
    
    selectedTemplateIndex = index;
    applyColorTemplate(index);
    
    // Hide custom colors section when template is selected
    const customSection = document.getElementById('customColorSection');
    customSection.classList.remove('show');
    customSection.setAttribute('aria-hidden', 'true');
    
    // Update toggle button state
    const toggleBtn = document.querySelector('.custom-toggle-btn');
    toggleBtn.setAttribute('aria-expanded', 'false');
}

function applyColorTemplate(index) {
    const template = colorTemplates[index];
    backgroundColorInput.value = template.bg;
    textColorSelect.value = template.text;
    updateColorPreviews();
}

function toggleCustomColors() {
    const customSection = document.getElementById('customColorSection');
    const toggleBtn = document.querySelector('.custom-toggle-btn');
    const isShowing = customSection.classList.contains('show');
    
    if (isShowing) {
        closeCustomColors();
    } else {
        customSection.classList.add('show');
        customSection.setAttribute('aria-hidden', 'false');
        toggleBtn.setAttribute('aria-expanded', 'true');
        
        // Remove selection from templates when using custom
        document.querySelectorAll('.color-template').forEach(template => {
            template.classList.remove('selected');
            template.setAttribute('aria-checked', 'false');
            template.tabIndex = -1;
        });
        
        // Focus the first custom color input
        document.getElementById('backgroundColor').focus();
    }
}

function closeCustomColors() {
    const customSection = document.getElementById('customColorSection');
    const toggleBtn = document.querySelector('.custom-toggle-btn');
    
    customSection.classList.remove('show');
    customSection.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    
    // Reapply the last selected template
    applyColorTemplate(selectedTemplateIndex);
    
    // Re-select the template visually
    document.querySelectorAll('.color-template').forEach((template, index) => {
        if (index === selectedTemplateIndex) {
            template.classList.add('selected');
            template.setAttribute('aria-checked', 'true');
            template.tabIndex = 0;
        } else {
            template.classList.remove('selected');
            template.setAttribute('aria-checked', 'false');
            template.tabIndex = -1;
        }
    });
}
// --- Color Preview Updates ---
function updateColorPreviews() {
    const bgColor = backgroundColorInput.value;
    const textColor = textColorSelect.value;
    
    document.getElementById('bgColorPreview').style.backgroundColor = bgColor;
    document.getElementById('textColorPreview').style.backgroundColor = textColor;
    
    // If custom colors are being used, remove template selection
    const customSection = document.getElementById('customColorSection');
    if (customSection.classList.contains('show')) {
        document.querySelectorAll('.color-template').forEach(template => {
            template.classList.remove('selected');
        });
    }
}

// --- Message Display ---
function showMessage(message, type = "info") {
    const icon = type === "error" ? "fas fa-exclamation-triangle" : 
                 type === "success" ? "fas fa-check-circle" : "fas fa-info-circle";
    
    appMessageDiv.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    appMessageDiv.className = `message-card message-${type}`; // Reset classes
    appMessageDiv.classList.remove('hidden');
}

// --- Image Generation ---
function generateImage() {
    try {
        const selectedDeviceIndex = phoneModelSelect.value;
        const selectedMessageIndex = privacyMessageSelect.value;
        const bgColor = backgroundColorInput.value;
        const textColor = textColorSelect.value;

        if (!selectedDeviceIndex || !selectedMessageIndex) {
            showMessage("Please select a phone model and a message.", "error");
            return;
        }

        const device = devices[selectedDeviceIndex];
        const message = messages[selectedMessageIndex];

        // Set canvas dimensions
        canvas.width = device.width;
        canvas.height = device.height;
        canvas.style.display = 'block'; // Make canvas visible
        
        // Clear previous content in preview container if any
        const existingContent = previewContainer.querySelector(':not(canvas)');
        if (existingContent) {
            existingContent.remove();
        }
        previewContainer.appendChild(canvas);
        previewContainer.classList.add('has-content');

        // 1. Draw Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Define Safe Zone for text
        // These are the areas where text should NOT go.
        const safeX = device.reservedLeft;
        const safeY = device.reservedTop;
        const safeWidth = device.width - device.reservedLeft - device.reservedRight;
        const safeHeight = device.height - device.reservedTop - device.reservedBottom;

        // 3. Draw Text
        ctx.fillStyle = textColor;
        
        // Dynamic font sizing logic
        let fontSize = Math.min(safeWidth / 10, safeHeight / 5); // Start with a reasonable max font size
        fontSize = Math.max(20, fontSize); // Ensure a minimum font size (e.g., 20px)
        
        // Reduce font size if message is very long, relative to safe width
        if (message.length > 30) fontSize *= 0.8;
        if (message.length > 50) fontSize *= 0.8;

        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Wrap text and draw it
        const lines = wrapText(ctx, message, safeWidth - 40); // Subtract some padding
        const lineHeight = fontSize * 1.2; // Line height based on font size
        const totalTextHeight = lines.length * lineHeight;

        // Calculate starting Y position to center the block of text vertically in the safe zone
        let textBlockStartY = safeY + (safeHeight - totalTextHeight) / 2;

        lines.forEach((line, index) => {
            const yPos = textBlockStartY + (index * lineHeight) + (lineHeight / 2); // Center each line vertically
             // Ensure text is drawn within the canvas bounds, especially safeX + safeWidth / 2
            const xPos = Math.max(0, Math.min(canvas.width, safeX + safeWidth / 2));
            ctx.fillText(line, xPos, yPos);
        });
        
        downloadButton.disabled = false;
        document.getElementById('socialShareSection').classList.remove('hidden');
        showMessage("Lockscreen generated successfully! You can now download it.", "success");

    } catch (error) {
        console.error("Error generating image:", error);
        showMessage(`Error generating image: ${error.message}. Please try again.`, "error");
        downloadButton.disabled = true;
        document.getElementById('socialShareSection').classList.add('hidden');
        // Reset canvas preview if error
        canvas.style.display = 'none';
        previewContainer.classList.remove('has-content');
        previewContainer.innerHTML = `
            <div class="text-center">
                <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
                <p class="text-red-500 text-lg font-medium">Error generating preview</p>
                <p class="text-red-400 text-sm mt-2">Please check your selections and try again</p>
            </div>
        `;
    }
}

function wrapText(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine); // Add the last line
    return lines;
}

// --- Download Image ---
function downloadImage() {
    if (canvas.style.display === 'none' || downloadButton.disabled) {
        showMessage("Please generate an image first.", "error");
        return;
    }
    try {
        const selectedDevice = devices[phoneModelSelect.value];
        const imageName = `privacy_lockscreen_${selectedDevice.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = imageName;
        link.href = dataURL;
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
        showMessage(`Image '${imageName}' download started successfully!`, "success");
    } catch (error) {
        console.error("Error downloading image:", error);
        showMessage(`Error downloading image: ${error.message}.`, "error");
    }
}

// --- Run ---
init();
updateColorPreviews();

// --- Social Sharing Functions ---
function shareOnTwitter() {
    const text = "Check out this Privacy Lockscreen Generator! Create custom lockscreen images to protect your digital rights.";
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareOnFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareOnLinkedIn() {
    const title = "Privacy Lockscreen Generator";
    const summary = "Create custom lockscreen images to protect your digital rights";
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`, '_blank');
}

function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showMessage("Link copied to clipboard!", "success");
    }).catch(() => {
        showMessage("Failed to copy link. Please copy manually.", "error");
    });
}

function shareNative() {
    if (navigator.share) {
        navigator.share({
            title: 'Privacy Lockscreen Generator',
            text: 'Create custom lockscreen images to protect your digital rights',
            url: window.location.href
        }).catch(() => {
            // Fallback to copy to clipboard if native share fails
            copyToClipboard();
        });
    } else {
        // Fallback for browsers that don't support native sharing
        copyToClipboard();
    }
}

// --- Social Media Image Sharing Functions ---
function shareToInstagram() {
    if (canvas.style.display === 'none' || downloadButton.disabled) {
        showMessage("Please generate an image first.", "error");
        return;
    }
    
    // Instagram doesn't support direct image sharing from web, so we'll copy the image to clipboard
    // and provide instructions
    canvas.toBlob((blob) => {
        if (navigator.clipboard && window.ClipboardItem) {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(() => {
                showMessage("Image copied to clipboard! Open Instagram and paste it into your story.", "success");
            }).catch(() => {
                showMessage("Please download the image and manually upload it to Instagram.", "info");
            });
        } else {
            showMessage("Please download the image and manually upload it to Instagram.", "info");
        }
    }, 'image/png');
}

function shareToTikTok() {
    if (canvas.style.display === 'none' || downloadButton.disabled) {
        showMessage("Please generate an image first.", "error");
        return;
    }
    
    // TikTok doesn't support direct web sharing, so we'll provide instructions
    showMessage("Please download the image and upload it to TikTok manually. Add hashtags like #privacy #digitalrights #lockscreen", "info");
}

function shareToX() {
    if (canvas.style.display === 'none' || downloadButton.disabled) {
        showMessage("Please generate an image first.", "error");
        return;
    }
    
    // X (Twitter) doesn't support direct image sharing from web, but we can open with text
    const text = "Just created my privacy lockscreen! Protect your digital rights with custom messages. #privacy #digitalrights #lockscreen";
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    showMessage("X opened! Please download and attach your lockscreen image to the tweet.", "info");
}

function shareImageNative() {
    if (canvas.style.display === 'none' || downloadButton.disabled) {
        showMessage("Please generate an image first.", "error");
        return;
    }
    
    canvas.toBlob((blob) => {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'lockscreen.png', { type: 'image/png' })] })) {
            const file = new File([blob], 'privacy_lockscreen.png', { type: 'image/png' });
            navigator.share({
                title: 'My Privacy Lockscreen',
                text: 'Check out my custom privacy lockscreen!',
                files: [file]
            }).catch(() => {
                showMessage("Sharing failed. Please download the image manually.", "error");
            });
        } else {
            // Fallback: copy image to clipboard
            if (navigator.clipboard && window.ClipboardItem) {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]).then(() => {
                    showMessage("Image copied to clipboard! You can now paste it in your favorite app.", "success");
                }).catch(() => {
                    showMessage("Please download the image to share it.", "info");
                });
            } else {
                showMessage("Please download the image to share it.", "info");
            }
        }
    }, 'image/png');
}