const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const faceCountEl = document.getElementById('face-count');
const emotionEl = document.getElementById('dominant-emotion');
const fpsEl = document.getElementById('fps-counter');
const loader = document.getElementById('loader');
const statusEl = document.getElementById('system-status');
const themeToggleBtn = document.getElementById('theme-toggle');

// Theme Logic
themeToggleBtn.addEventListener('click', () => {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    document.body.setAttribute('data-theme', isLight ? 'dark' : 'light');
});

// Configuration
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
const CONFIDENCE_THRESHOLD = 0.5;
const STABILITY_FRAMES = 10; // Number of frames to consider for stability

// State
let isModelLoaded = false;
let isVideoReady = false;
let faceCountHistory = [];
let lastProcessedTime = 0;
let frameCount = 0;
let fps = 0;

// Initialize
async function init() {
    try {
        statusEl.innerText = "LOADING MODELS...";
        await loadModels();
        statusEl.innerText = "ACCESSING CAMERA...";
        await startVideo();
        statusEl.innerText = "SYSTEM ACTIVE";
        loader.classList.add('hidden');
        startDetection();
    } catch (error) {
        console.error("Initialization error:", error);
        statusEl.innerText = "SYSTEM ERROR";
        statusEl.style.color = "red";
    }
}

async function loadModels() {
    // Load models from CDN
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    isModelLoaded = true;
    console.log("Models loaded");
}

// Tracking Configuration
const TRACKING_IOU_THRESHOLD = 0.15;
const TRACKING_MAX_MISSED_FRAMES = 30;
const SMOOTHING_ALPHA = 0.5; // Higher = more responsive, Lower = smoother

class FaceTracker {
    constructor() {
        this.tracks = [];
        this.nextId = 1;
    }

    update(detections) {
        // 1. Mark all tracks as missing first
        this.tracks.forEach(t => t.isMissing = true);

        // 2. Match detections to tracks
        detections.forEach(det => {
            const box = det.detection.box;
            let bestMatch = null;
            let maxIoU = 0;

            this.tracks.forEach(track => {
                const iou = getIoU(box, track.box);
                if (iou > maxIoU) {
                    maxIoU = iou;
                    bestMatch = track;
                }
            });

            if (bestMatch && maxIoU > TRACKING_IOU_THRESHOLD) {
                // Update matched track
                bestMatch.isMissing = false;
                bestMatch.missedFrames = 0;
                bestMatch.lastSeen = Date.now();

                // Smooth box
                bestMatch.box = smoothBox(bestMatch.box, box);

                // Update data
                bestMatch.landmarks = det.landmarks;
                bestMatch.expressions = det.expressions;
            } else {
                // Create new track
                this.tracks.push({
                    id: this.nextId++,
                    box: box,
                    landmarks: det.landmarks,
                    expressions: det.expressions,
                    isMissing: false,
                    missedFrames: 0,
                    firstSeen: Date.now(),
                    lastSeen: Date.now()
                });
            }
        });

        // 3. Handle missing tracks
        this.tracks = this.tracks.filter(t => {
            if (t.isMissing) {
                t.missedFrames++;
            }
            return t.missedFrames <= TRACKING_MAX_MISSED_FRAMES;
        });

        return this.tracks; // Return all tracks, including missing ones (within grace period)
    }
}

function getIoU(box1, box2) {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    if (x2 < x1 || y2 < y1) return 0;

    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;

    return intersection / (area1 + area2 - intersection);
}

function smoothBox(oldBox, newBox) {
    return {
        x: oldBox.x + (newBox.x - oldBox.x) * SMOOTHING_ALPHA,
        y: oldBox.y + (newBox.y - oldBox.y) * SMOOTHING_ALPHA,
        width: oldBox.width + (newBox.width - oldBox.width) * SMOOTHING_ALPHA,
        height: oldBox.height + (newBox.height - oldBox.height) * SMOOTHING_ALPHA
    };
}

const tracker = new FaceTracker();

async function startVideo() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    isVideoReady = true;
                    video.play(); // Ensure video is playing
                    resolve();
                };
            })
            .catch(err => reject(err));
    });
}

// Stability Logic: Get the most frequent face count in the last N frames
function getStableFaceCount(currentCount) {
    faceCountHistory.push(currentCount);
    if (faceCountHistory.length > STABILITY_FRAMES) {
        faceCountHistory.shift();
    }

    // Calculate mode
    const counts = {};
    let maxFreq = 0;
    let mode = currentCount;

    for (const count of faceCountHistory) {
        counts[count] = (counts[count] || 0) + 1;
        if (counts[count] > maxFreq) {
            maxFreq = counts[count];
            mode = count;
        }
    }
    return mode;
}

// Main Detection Loop
async function startDetection() {
    if (!isModelLoaded || !isVideoReady) return;

    // Optimization Configuration
    const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 });

    // Match canvas size to video
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    // Start independent loops
    detectLoop(displaySize, DETECTOR_OPTIONS);
    renderLoop();
}

async function detectLoop(displaySize, options) {
    while (true) {
        if (!isModelLoaded || !isVideoReady) break;

        try {
            const now = performance.now();

            // FPS Calculation (based on detection speed)
            frameCount++;
            if (now - lastProcessedTime >= 1000) {
                fps = frameCount;
                frameCount = 0;
                lastProcessedTime = now;
                fpsEl.innerText = fps;
            }

            // Run Detection
            const detections = await faceapi.detectAllFaces(video, options)
                .withFaceLandmarks()
                .withFaceExpressions();

            // Resize
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            // Update Tracker
            const trackedFaces = tracker.update(resizedDetections);

            // Update Stats
            const currentCount = trackedFaces.length;
            const stableCount = getStableFaceCount(currentCount);
            faceCountEl.innerText = stableCount;

            updateDominantEmotion(trackedFaces);

        } catch (error) {
            console.error("Detection error:", error);
            // Wait a bit before retrying to avoid spamming errors
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Small yield to prevent blocking
        await new Promise(resolve => requestAnimationFrame(resolve));
    }
}

function renderLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw current state of tracks
    drawCustomVisuals(tracker.tracks);

    requestAnimationFrame(renderLoop);
}

function drawCustomVisuals(trackedFaces) {
    trackedFaces.forEach(track => {
        const box = track.box;

        // Draw Bounding Box (Cyan, glowing)
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 10;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        ctx.shadowBlur = 0; // Reset shadow

        // Draw Corners (for extra techy feel)
        const cornerLen = 20;
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Top Left
        ctx.moveTo(box.x, box.y + cornerLen);
        ctx.lineTo(box.x, box.y);
        ctx.lineTo(box.x + cornerLen, box.y);
        // Top Right
        ctx.moveTo(box.x + box.width - cornerLen, box.y);
        ctx.lineTo(box.x + box.width, box.y);
        ctx.lineTo(box.x + box.width, box.y + cornerLen);
        // Bottom Left
        ctx.moveTo(box.x, box.y + box.height - cornerLen);
        ctx.lineTo(box.x, box.y + box.height);
        ctx.lineTo(box.x + cornerLen, box.y + box.height);
        // Bottom Right
        ctx.moveTo(box.x + box.width - cornerLen, box.y + box.height);
        ctx.lineTo(box.x + box.width, box.y + box.height);
        ctx.lineTo(box.x + box.width, box.y + box.height - cornerLen);
        ctx.stroke();

        // Draw Eyes
        const landmarks = track.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        drawEyeMarker(leftEye);
        drawEyeMarker(rightEye);
    });
}

function drawEyeMarker(eyePoints) {
    // Calculate center of eye
    let x = 0, y = 0;
    eyePoints.forEach(p => { x += p.x; y += p.y; });
    const cx = x / eyePoints.length;
    const cy = y / eyePoints.length;

    // Draw crosshair
    ctx.strokeStyle = '#bc13fe'; // Purple
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy);
    ctx.lineTo(cx + 5, cy);
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx, cy + 5);
    ctx.stroke();

    // Draw circle
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
    ctx.stroke();
}

function updateDominantEmotion(trackedFaces) {
    if (trackedFaces.length === 0) {
        emotionEl.innerText = "--";
        return;
    }

    // Aggregate emotions from all faces or just pick the first one
    // For simplicity, let's look at the first face (usually the closest/largest)
    const expressions = trackedFaces[0].expressions;

    // Filter for the 5 requested emotions: happy, angry, sad, surprised (exclamation), neutral
    // Note: face-api returns 'surprised', we map it to '!'
    const relevantEmotions = {
        happy: expressions.happy,
        angry: expressions.angry,
        sad: expressions.sad,
        surprised: expressions.surprised,
        neutral: expressions.neutral
    };

    // Find max
    let maxEmotion = 'neutral';
    let maxVal = 0;

    for (const [emotion, val] of Object.entries(relevantEmotions)) {
        if (val > maxVal) {
            maxVal = val;
            maxEmotion = emotion;
        }
    }

    // Format output
    let displayText = maxEmotion.toUpperCase();
    if (maxEmotion === 'surprised') displayText = "!";

    emotionEl.innerText = displayText;

    // Dynamic color based on emotion
    if (maxEmotion === 'angry') emotionEl.style.color = '#ff0055';
    else if (maxEmotion === 'happy') emotionEl.style.color = '#00ff9d';
    else if (maxEmotion === 'sad') emotionEl.style.color = '#00aaff';
    else if (maxEmotion === 'surprised') emotionEl.style.color = '#ffcc00';
    else emotionEl.style.color = '#ffffff';
}

// Start
init();
