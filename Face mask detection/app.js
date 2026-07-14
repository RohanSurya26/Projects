// SecureVision Core Logic
const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const toggleBtn = document.getElementById('toggle-camera');
const flipBtn = document.getElementById('flip-camera');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const manualSnapshotBtn = document.getElementById('manual-snapshot');
const loadingOverlay = document.getElementById('loading');
const statusDot = document.getElementById('system-status-dot');
const statusText = document.getElementById('system-status-text');

// Stats elements
const statTotal = document.getElementById('stat-total');
const statMask = document.getElementById('stat-mask');
const statNoMask = document.getElementById('stat-nomask');
const barMask = document.getElementById('bar-mask');
const barNoMask = document.getElementById('bar-nomask');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Logs
const logsGallery = document.getElementById('logs-gallery');
const logCountBadge = document.getElementById('log-count');

// Settings
const confInput = document.getElementById('setting-confidence');
const confVal = document.getElementById('conf-val');
const skinInput = document.getElementById('setting-skin');
const skinVal = document.getElementById('skin-val');
const audioToggle = document.getElementById('setting-audio');

// Settings State
let minConfidence = 0.3;
let skinRatioThreshold = 0.15;
let audioAlertsEnabled = true;
let audioCtx = null;

let isModelLoaded = false;
let isVideoMirrored = true;
let isDetecting = false;
let currentStream = null;

// Persistent offscreen canvas for performance
const offCanvas = document.createElement('canvas');
const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

// Tab Switching logic
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    });
});

// Settings Events
confInput.addEventListener('input', (e) => {
    minConfidence = e.target.value / 100;
    confVal.innerText = e.target.value + '%';
});

skinInput.addEventListener('input', (e) => {
    skinRatioThreshold = e.target.value / 100;
    skinVal.innerText = e.target.value + '%';
});

audioToggle.addEventListener('change', (e) => {
    audioAlertsEnabled = e.target.checked;
});

// Fullscreen Event
fullscreenBtn.addEventListener('click', () => {
    const camContainer = document.querySelector('.camera-container');
    if (!document.fullscreenElement) {
        camContainer.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

// Manual Snapshot Event
manualSnapshotBtn.addEventListener('click', () => {
    let snapshotTaken = false;
    activeTracks.forEach(track => {
        if (!track.isMasked) {
            forceSnapshot(track, offCtx);
            snapshotTaken = true;
        }
    });

    if (!snapshotTaken) {
        // Flash manual snapshot btn to indicate nothing was found
        manualSnapshotBtn.style.backgroundColor = "var(--safe)";
        setTimeout(() => manualSnapshotBtn.style.backgroundColor = "", 500);
    }
});

// Initialize the application
async function init() {
    try {
        statusText.innerText = "Loading SSD & Landmarks...";
        console.log("Loading AI Models...");
        // Load face-api models from local directory
        await faceapi.nets.ssdMobilenetv1.loadFromUri('./models');
        
        // Load landmarks from CDN for advanced tracking
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        
        isModelLoaded = true;
        loadingOverlay.style.opacity = '0';
        setTimeout(() => loadingOverlay.style.display = 'none', 500);
        
        statusText.innerText = "System Ready";
        statusDot.parentElement.classList.add('ready');
        toggleBtn.disabled = false;
        
        // Auto-start camera
        startCamera();
    } catch (error) {
        console.error("Error loading models:", error);
        document.getElementById('loading-text').innerText = "Error: " + (error.message || error.toString());
        statusText.innerText = "System Error";
        statusText.style.color = "var(--danger)";
    }
}

// Start/Stop Camera
async function startCamera() {
    if (currentStream) {
        stopCamera();
        return;
    }

    // Init Audio context on user interaction
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            } 
        });
        
        video.srcObject = currentStream;
        toggleBtn.innerText = "Stop Camera";
        toggleBtn.classList.replace('primary', 'secondary');
        flipBtn.disabled = false;
        manualSnapshotBtn.disabled = false;
        
    } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Unable to access the camera. Please ensure you have granted permissions.");
    }
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        currentStream = null;
        
        toggleBtn.innerText = "Start Camera";
        toggleBtn.classList.replace('secondary', 'primary');
        flipBtn.disabled = true;
        manualSnapshotBtn.disabled = true;
        
        // Clear canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        resetStats();
    }
}

toggleBtn.addEventListener('click', startCamera);

flipBtn.addEventListener('click', () => {
    isVideoMirrored = !isVideoMirrored;
    video.classList.toggle('unmirrored');
});

video.addEventListener('play', () => {
    // Setup canvas dimensions
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);
    
    isDetecting = true;
    startDetectionLoopWrapper(displaySize);
});

video.addEventListener('pause', () => isDetecting = false);
video.addEventListener('ended', () => isDetecting = false);

// Prevent overlapping loops by adding a wrapper
function startDetectionLoopWrapper(displaySize) {
    if (!isDetecting) return;
    startDetectionLoop(displaySize);
}

let activeTracks = [];
const TRACK_EMA_ALPHA = 0.85; // Faster tracking response
const TRACK_MAX_MISSES = 4; // Faster ghost cleanup

// Helper to calculate distance between two bounding box centers
function getCenterDist(box1, box2) {
    const cx1 = box1.x + box1.width / 2;
    const cy1 = box1.y + box1.height / 2;
    const cx2 = box2.x + box2.width / 2;
    const cy2 = box2.y + box2.height / 2;
    return Math.sqrt(Math.pow(cx1 - cx2, 2) + Math.pow(cy1 - cy2, 2));
}

// Audio Beep
function playAlertBeep() {
    if (!audioAlertsEnabled || !audioCtx) return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.3); 
    
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
}

// Snapshot Logging
let logCount = 0;

function forceSnapshot(track, offscreenCtx) {
    playAlertBeep();

    const emptyMsg = logsGallery.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();
    
    const box = track.box;
    let sx = Math.max(0, box.x - 20);
    let sy = Math.max(0, box.y - 20);
    let sw = Math.min(offscreenCtx.canvas.width - sx, box.width + 40);
    let sh = Math.min(offscreenCtx.canvas.height - sy, box.height + 40);
    
    if (sw <= 0 || sh <= 0) return;
    
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = sw;
    snapCanvas.height = sh;
    const snapCtx = snapCanvas.getContext('2d');
    
    if (isVideoMirrored) {
        snapCtx.translate(sw, 0);
        snapCtx.scale(-1, 1);
        snapCtx.drawImage(offscreenCtx.canvas, offscreenCtx.canvas.width - sx - sw, sy, sw, sh, 0, 0, sw, sh);
    } else {
        snapCtx.drawImage(offscreenCtx.canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    }
    
    const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.8);
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    const timeStr = new Date().toLocaleTimeString();
    
    logItem.innerHTML = `
        <img src="${dataUrl}" alt="No Mask Snapshot">
        <div class="log-info">
            <span class="log-status">Warning: No Mask</span>
            <span class="log-time">${timeStr}</span>
        </div>
    `;
    
    logsGallery.prepend(logItem);
    
    logCount++;
    logCountBadge.innerText = logCount;
    
    while (logsGallery.children.length > 20) {
        logsGallery.lastChild.remove();
    }
}

// The main detection loop
async function startDetectionLoop(displaySize) {
    if (!isDetecting) return;
    
    try {
        // 1. Detect faces using SSD MobileNet + Landmarks
        const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: minConfidence })).withFaceLandmarks();
        
        // 2. Resize results mapping to canvas
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
    
        // Clear previous frame
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fast offscreen rendering for ROI pixel analysis
        if (offCanvas.width !== video.videoWidth) {
            offCanvas.width = video.videoWidth;
            offCanvas.height = video.videoHeight;
        }
        offCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        // 3. Track matching logic
        const matchedTrackIds = new Set();
        
        resizedDetections.forEach(detection => {
            const detBox = detection.detection.box;
            const landmarks = detection.landmarks;
            
            // Match this detection to an existing track
            let bestMatch = null;
            let min_dist = Infinity;
            
            for (let track of activeTracks) {
                const dist = getCenterDist(track.box, detBox);
                if (dist < min_dist && dist < Math.max(detBox.width, detBox.height) * 1.5) {
                    bestMatch = track;
                    min_dist = dist;
                }
            }
            
            // Advanced Landmark Mask Heuristic
            const isMasked = analyzeMaskROI(offCtx, detBox, landmarks);
            
            if (bestMatch) {
                matchedTrackIds.add(bestMatch.id);
                bestMatch.missedFrames = 0;
                bestMatch.score = detection.detection.score;
                bestMatch.isMasked = isMasked;
                bestMatch.landmarks = landmarks; // Update landmarks cache
                
                bestMatch.box.x = (detBox.x * TRACK_EMA_ALPHA) + (bestMatch.box.x * (1 - TRACK_EMA_ALPHA));
                bestMatch.box.y = (detBox.y * TRACK_EMA_ALPHA) + (bestMatch.box.y * (1 - TRACK_EMA_ALPHA));
                bestMatch.box.width = (detBox.width * TRACK_EMA_ALPHA) + (bestMatch.box.width * (1 - TRACK_EMA_ALPHA));
                bestMatch.box.height = (detBox.height * TRACK_EMA_ALPHA) + (bestMatch.box.height * (1 - TRACK_EMA_ALPHA));
                
            } else {
                activeTracks.push({
                    id: Math.random().toString(36).substring(2, 9),
                    box: { x: detBox.x, y: detBox.y, width: detBox.width, height: detBox.height },
                    score: detection.detection.score,
                    isMasked: isMasked,
                    landmarks: landmarks,
                    missedFrames: 0
                });
            }
        });
        
        let maskCount = 0;
        let noMaskCount = 0;
        
        activeTracks = activeTracks.filter(track => {
            if (!matchedTrackIds.has(track.id)) {
                track.missedFrames++;
            }
            
            if (track.missedFrames < TRACK_MAX_MISSES) {
                if (track.isMasked) maskCount++;
                else noMaskCount++;
                
                drawFacialMesh(ctx, track, track.isMasked, track.score, isVideoMirrored);
                return true; 
            }
            return false;
        });

        updateStats(activeTracks.length, maskCount, noMaskCount);

        requestAnimationFrame(() => startDetectionLoop(displaySize));
    } catch (err) {
        console.error("Detection Loop Error:", err);
        setTimeout(() => startDetectionLoop(displaySize), 1000);
    }
}

// Advanced Mask Heuristic Logic using Landmarks
function analyzeMaskROI(offscreenCtx, box, landmarks) {
    if (!landmarks) return false;
    
    const jaw = landmarks.getJawOutline();
    // Index 30 is the tip of the nose
    const nose = landmarks.positions[30] || landmarks.getNose()[3];
    
    const w = Math.floor(box.width);
    const h = Math.floor(box.height);
    if (w <= 0 || h <= 0) return false;

    // Use a tiny transparent canvas to isolate the lower face polygon
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    
    // Draw polygon for the lower half of the face (jaw up to the nose)
    tempCtx.beginPath();
    jaw.forEach((pt, i) => {
        if (i === 0) tempCtx.moveTo(pt.x - box.x, pt.y - box.y);
        else tempCtx.lineTo(pt.x - box.x, pt.y - box.y);
    });
    // Connect back to nose to form polygon
    tempCtx.lineTo(nose.x - box.x, nose.y - box.y);
    tempCtx.closePath();
    
    tempCtx.fillStyle = '#000';
    tempCtx.fill();
    
    // Composite: Only keep pixels inside the polygon
    tempCtx.globalCompositeOperation = 'source-in';
    tempCtx.drawImage(offscreenCtx.canvas, box.x, box.y, w, h, 0, 0, w, h);
    
    const imgData = tempCtx.getImageData(0, 0, w, h).data;
    let skinPixels = 0;
    let targetAreaPixels = 0;
    
    // Step by 16 bytes (4 pixels) for extreme speed boost
    for (let i = 0; i < imgData.length; i += 16) {
        // If pixel is visible (inside the polygon)
        if (imgData[i+3] > 0) {
            targetAreaPixels++;
            const r = imgData[i];
            const g = imgData[i+1];
            const b = imgData[i+2];
            
            if (r > 95 && g > 40 && b > 20 && 
                Math.max(r, g, b) - Math.min(r, g, b) > 15 && 
                Math.abs(r - g) > 15 && r > g && r > b) {
                skinPixels++;
            }
        }
    }
    
    if (targetAreaPixels === 0) return false;
    
    const skinRatio = skinPixels / targetAreaPixels;
    // Compare skin ratio of just the isolated jaw area to the dynamic UI threshold
    return skinRatio < skinRatioThreshold;
}

// Dynamic UI Drawing Mesh
function drawFacialMesh(ctx, track, isMasked, conf, mirrored) {
    const color = isMasked ? '#00E676' : '#FF3D00'; // Safe vs Danger
    const bgColor = isMasked ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 61, 0, 0.15)';
    
    // Adjust x if video is mirrored
    let drX = track.box.x;
    if (mirrored) {
        drX = canvas.width - track.box.x - track.box.width;
    }

    if (track.landmarks) {
        // Draw volumetric translucent scanning light over the lower face
        const jaw = track.landmarks.getJawOutline();
        const noseBridge = track.landmarks.positions[27] || track.landmarks.getNose()[0];
        
        const pathMask = () => {
             ctx.beginPath();
             let p0x = mirrored ? canvas.width - jaw[0].x : jaw[0].x;
             ctx.moveTo(p0x, jaw[0].y);
             
             for (let i = 1; i < jaw.length - 1; i++) {
                 let px1 = mirrored ? canvas.width - jaw[i].x : jaw[i].x;
                 let px2 = mirrored ? canvas.width - jaw[i+1].x : jaw[i+1].x;
                 let mx = (px1 + px2) / 2;
                 let my = (jaw[i].y + jaw[i+1].y) / 2;
                 ctx.quadraticCurveTo(px1, jaw[i].y, mx, my);
             }
             
             let p16x = mirrored ? canvas.width - jaw[16].x : jaw[16].x;
             ctx.lineTo(p16x, jaw[16].y);
             
             let nbx = mirrored ? canvas.width - noseBridge.x : noseBridge.x;
             ctx.quadraticCurveTo(nbx, noseBridge.y, p0x, jaw[0].y);
        };
        
        pathMask();
        ctx.fillStyle = bgColor;
        ctx.fill();
        
        // Draw a soft glowing boundary ONLY on the jaw edge (no raw points)
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        
        ctx.beginPath();
        let p0x = mirrored ? canvas.width - jaw[0].x : jaw[0].x;
        ctx.moveTo(p0x, jaw[0].y);
        for (let i = 1; i < jaw.length - 1; i++) {
            let px1 = mirrored ? canvas.width - jaw[i].x : jaw[i].x;
            let px2 = mirrored ? canvas.width - jaw[i+1].x : jaw[i+1].x;
            let mx = (px1 + px2) / 2;
            let my = (jaw[i].y + jaw[i+1].y) / 2;
            ctx.quadraticCurveTo(px1, jaw[i].y, mx, my);
        }
        let p16x = mirrored ? canvas.width - jaw[16].x : jaw[16].x;
        ctx.lineTo(p16x, jaw[16].y);
        
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // High-tech Corner Brackets
    const bracketLen = 20;
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    
    ctx.beginPath();
    // Top Left
    ctx.moveTo(drX, track.box.y + bracketLen); ctx.lineTo(drX, track.box.y); ctx.lineTo(drX + bracketLen, track.box.y);
    // Top Right
    ctx.moveTo(drX + track.box.width - bracketLen, track.box.y); ctx.lineTo(drX + track.box.width, track.box.y); ctx.lineTo(drX + track.box.width, track.box.y + bracketLen);
    // Bottom Left
    ctx.moveTo(drX, track.box.y + track.box.height - bracketLen); ctx.lineTo(drX, track.box.y + track.box.height); ctx.lineTo(drX + bracketLen, track.box.y + track.box.height);
    // Bottom Right
    ctx.moveTo(drX + track.box.width - bracketLen, track.box.y + track.box.height); ctx.lineTo(drX + track.box.width, track.box.y + track.box.height); ctx.lineTo(drX + track.box.width, track.box.y + track.box.height - bracketLen);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Floating UI Label
    const text = isMasked ? '✅ MASK' : '⚠️ NO MASK';
    
    ctx.fillStyle = color;
    ctx.fillRect(drX, track.box.y - 35, track.box.width, 30);
    
    // Draw Label text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Inter';
    ctx.fillText(text, drX + 10, track.box.y - 15);
    
    // Draw conf text
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.font = '12px Inter';
    const confStr = Math.round(conf * 100) + '%';
    const textWidth = ctx.measureText(confStr).width;
    ctx.fillText(confStr, drX + track.box.width - textWidth - 10, track.box.y - 15);
}

// Update Stats UI
function updateStats(total, masks, noMasks) {
    statTotal.innerText = total;
    statMask.innerText = masks;
    statNoMask.innerText = noMasks;
    
    if (total > 0) {
        barMask.style.width = `${(masks / total) * 100}%`;
        barNoMask.style.width = `${(noMasks / total) * 100}%`;
    } else {
        barMask.style.width = '0%';
        barNoMask.style.width = '0%';
    }
}

function resetStats() {
    updateStats(0, 0, 0);
}

// Bootstrap
window.addEventListener('load', init);
