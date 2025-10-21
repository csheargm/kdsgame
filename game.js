// Game State
let gameState = {
    level: 1,
    points: 0,
    currentScreen: 'welcome',
    currentScenario: 0
};

// Utility function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ML Training State
let classifier;
let video;
let canvas;
let ctx;
let samples = [[], [], []];
let isCollecting = false;
let currentClass = -1;
let modelTrained = false;
let predicting = false;

const classNames = ['👍 Thumbs Up', '✌️ Peace Sign', '✋ Open Hand'];
const minSamplesPerClass = 10;

// Image size for ML - much smaller to prevent GPU memory issues
const ML_IMAGE_SIZE = 64; // 64x64 instead of 640x480

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    updateScoreBoard();

    // Set TensorFlow.js to use CPU backend if GPU has issues
    // This is slower but more stable
    try {
        await tf.ready();
        console.log('TensorFlow.js backend:', tf.getBackend());
        console.log('Memory info:', tf.memory());
    } catch (err) {
        console.error('TensorFlow initialization error:', err);
    }
});

function goHome() {
    // Stop prediction if running
    if (predicting) {
        predicting = false;
    }

    // Show welcome screen
    showScreen('welcome-screen');
}

function startGame() {
    showScreen('training-screen');
    initWebcam();
}

function startEthicsChallenge() {
    gameState.currentScenario = 0;
    // Shuffle scenarios each time mission starts
    shuffledEthicsScenarios = shuffleArray(ethicsScenarios);
    showScreen('ethics-screen');
    loadScenario(0);
}

function startPromptEngineering() {
    showScreen('prompt-engineering-screen');
    Mission3.init();
    currentPromptLevel = 0;
    hintsUsed = 0;
    exampleShown = false;
    loadPromptLevel(0);
}

function showResourcesPage() {
    showScreen('completion-screen');
    document.getElementById('final-points').textContent = gameState.points;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
}

function updateScoreBoard() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('points').textContent = gameState.points;
}

function addPoints(points) {
    gameState.points += points;
    updateScoreBoard();
}

// === WEBCAM AND ML TRAINING ===

async function initWebcam() {
    video = document.getElementById('webcam');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d', { willReadFrequently: true });

    try {
        updateStatus("Requesting camera access...", false);

        // Mobile-friendly camera constraints
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        const constraints = {
            video: {
                width: { ideal: isMobile ? 480 : 640 },
                height: { ideal: isMobile ? 480 : 480 },
                facingMode: 'user'
            },
            audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        video.srcObject = stream;

        // Wait for video to be ready and start playing
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                // Set canvas to small size for ML processing
                canvas.width = ML_IMAGE_SIZE;
                canvas.height = ML_IMAGE_SIZE;
                console.log('Video dimensions:', video.videoWidth, video.videoHeight);
                console.log('Canvas size for ML:', ML_IMAGE_SIZE, 'x', ML_IMAGE_SIZE);
                resolve();
            };
        });

        // Explicitly play the video
        await video.play();

        updateStatus("Camera is ready! Collect samples by holding down the gesture buttons.", false);
        updateInsight("Great! Your camera is ready. Now collect training examples by HOLDING DOWN each gesture button (not just clicking).");

    } catch (err) {
        updateStatus("⚠️ Camera access denied. Please allow camera access and refresh the page.", true);
        console.error("Error accessing webcam:", err);
        alert("This game needs camera access to train the AI. Please:\n1. Click 'Allow' when asked for camera permission\n2. If you blocked it, check your browser settings\n3. Refresh the page and try again");
    }
}

function startCollecting(classIndex, event) {
    // Prevent default touch behavior
    if (event) {
        event.preventDefault();
    }

    isCollecting = true;
    currentClass = classIndex;
    const btn = document.querySelectorAll('.btn-collect')[classIndex];
    btn.classList.add('collecting');
    collectLoop();
}

function stopCollecting(event) {
    // Prevent default touch behavior
    if (event) {
        event.preventDefault();
    }

    isCollecting = false;
    const btns = document.querySelectorAll('.btn-collect');
    btns.forEach(btn => btn.classList.remove('collecting'));
}

async function collectLoop() {
    if (!isCollecting) return;

    // Capture image from video at SMALL size to save memory
    ctx.drawImage(video, 0, 0, ML_IMAGE_SIZE, ML_IMAGE_SIZE);
    const imageData = ctx.getImageData(0, 0, ML_IMAGE_SIZE, ML_IMAGE_SIZE);

    // Store the image data
    samples[currentClass].push(imageData);
    updateSampleCount(currentClass);

    // Continue collecting
    setTimeout(() => {
        if (isCollecting) collectLoop();
    }, 100);
}

function updateSampleCount(classIndex) {
    const count = samples[classIndex].length;
    document.getElementById(`samples-${classIndex}`).textContent = `${count} samples`;

    // Check if we have enough samples to train
    checkTrainingReady();
}

function checkTrainingReady() {
    const allClassesReady = samples.every(classData => classData.length >= minSamplesPerClass);
    document.getElementById('train-btn').disabled = !allClassesReady;

    if (allClassesReady && !modelTrained) {
        updateStatus("Great! You have enough data. Click 'Train AI Model' to teach your AI!", false);
        updateInsight("You've collected diverse examples! This helps the AI learn better. More data = smarter AI!");
    }
}

function resetTraining() {
    samples = [[], [], []];
    modelTrained = false;
    predicting = false;

    for (let i = 0; i < 3; i++) {
        updateSampleCount(i);
    }

    document.getElementById('train-btn').disabled = true;
    document.getElementById('prediction-area').style.display = 'none';
    document.getElementById('next-mission-btn').style.display = 'none';
    updateStatus("Data reset. Collect new samples to train again.", false);
}

async function trainModel() {
    // Immediate visual feedback
    const trainBtn = document.getElementById('train-btn');
    trainBtn.disabled = true;
    trainBtn.textContent = 'Training...';
    trainBtn.style.opacity = '0.7';

    updateStatus("Training your AI model... This may take a moment.", false);
    document.getElementById('training-progress').style.display = 'block';

    // Start progress bar immediately at 5%
    document.querySelector('.progress-fill').style.width = '5%';

    // Simulate training progress
    let progress = 5;
    const progressInterval = setInterval(() => {
        progress += 5;
        document.querySelector('.progress-fill').style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(progressInterval);
        }
    }, 100);

    // Use TensorFlow.js to create a simple model
    try {
        // Create a simple neural network
        classifier = await createSimpleClassifier();

        // Train on our samples
        await trainClassifier();

        clearInterval(progressInterval);
        document.querySelector('.progress-fill').style.width = '100%';

        setTimeout(() => {
            modelTrained = true;
            trainBtn.textContent = 'Training Complete!';
            trainBtn.style.opacity = '1';

            updateStatus("Model trained successfully! Test it now by showing gestures.", false);
            updateInsight("Your AI has learned! It found patterns in your gestures. The neural network adjusted its 'weights' to recognize each gesture.");
            document.getElementById('prediction-area').style.display = 'block';
            document.getElementById('training-progress').style.display = 'none';

            addPoints(100);

            // Start predicting
            startPredicting();

            // Show next mission button after successful predictions
            setTimeout(() => {
                document.getElementById('next-mission-btn').style.display = 'block';
            }, 3000);
        }, 500);

    } catch (err) {
        console.error("Training error:", err);
        updateStatus("Training failed. Please try collecting more samples.", true);
        trainBtn.textContent = 'Train AI Model';
        trainBtn.disabled = false;
        trainBtn.style.opacity = '1';
    }
}

async function createSimpleClassifier() {
    // Create a simple CNN model with small images (64x64x3)
    const model = tf.sequential({
        layers: [
            // Convolutional layers are much more memory efficient than flatten
            tf.layers.conv2d({
                inputShape: [ML_IMAGE_SIZE, ML_IMAGE_SIZE, 3],
                filters: 16,
                kernelSize: 3,
                activation: 'relu'
            }),
            tf.layers.maxPooling2d({ poolSize: 2 }),
            tf.layers.conv2d({
                filters: 32,
                kernelSize: 3,
                activation: 'relu'
            }),
            tf.layers.maxPooling2d({ poolSize: 2 }),
            tf.layers.flatten(),
            tf.layers.dense({ units: 64, activation: 'relu' }),
            tf.layers.dropout({ rate: 0.3 }),
            tf.layers.dense({ units: 3, activation: 'softmax' })
        ]
    });

    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    return model;
}

async function trainClassifier() {
    // Prepare training data tensors using tidy to prevent memory leaks
    const { xsNormalized, ysTensor } = tf.tidy(() => {
        const xs = [];
        const ys = [];

        for (let classIndex = 0; classIndex < samples.length; classIndex++) {
            for (let sample of samples[classIndex]) {
                // Convert ImageData to tensor - fromPixels accepts ImageData directly
                // numChannels: 3 for RGB (not RGBA)
                const imgTensor = tf.browser.fromPixels(sample, 3);
                xs.push(imgTensor);

                const label = [0, 0, 0];
                label[classIndex] = 1;
                ys.push(label);
            }
        }

        // Stack all image tensors
        const xsTensor = tf.stack(xs);
        const ysTensor = tf.tensor2d(ys);

        // Normalize pixel values
        const xsNormalized = xsTensor.div(255.0);

        // Dispose individual tensors (they're no longer needed after stacking)
        xs.forEach(t => t.dispose());

        return { xsNormalized, ysTensor };
    });

    try {
        await classifier.fit(xsNormalized, ysTensor, {
            epochs: 15,
            batchSize: 8, // Smaller batch size to reduce memory
            shuffle: true,
            validationSplit: 0.1,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    const progress = ((epoch + 1) / 15 * 100).toFixed(0);
                    console.log(`Epoch ${epoch + 1}/15 (${progress}%): loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
                    updateStatus(`Training... ${progress}% complete`, false);
                }
            }
        });
    } finally {
        // Clean up tensors
        xsNormalized.dispose();
        ysTensor.dispose();
    }
}

async function startPredicting() {
    predicting = true;
    predictLoop();
}

async function predictLoop() {
    if (!predicting || !modelTrained) return;

    // Draw video to small canvas
    ctx.drawImage(video, 0, 0, ML_IMAGE_SIZE, ML_IMAGE_SIZE);
    const imageData = ctx.getImageData(0, 0, ML_IMAGE_SIZE, ML_IMAGE_SIZE);

    // Use tf.tidy to automatically clean up intermediate tensors
    const predictionArray = await tf.tidy(() => {
        // Convert to tensor using fromPixels - 3 channels (RGB)
        const tensor = tf.browser.fromPixels(imageData, 3);

        // Add batch dimension and normalize
        const batched = tensor.expandDims(0);
        const normalized = batched.div(255.0);

        // Get prediction
        return classifier.predict(normalized);
    });

    const data = await predictionArray.data();
    predictionArray.dispose();

    // Find max confidence
    const maxIndex = data.indexOf(Math.max(...data));

    // Update UI
    document.getElementById('prediction').textContent = classNames[maxIndex];

    // Update confidence bars
    updateConfidenceBars(data);

    requestAnimationFrame(predictLoop);
}

function updateConfidenceBars(predictions) {
    const container = document.getElementById('confidence-bars');
    container.innerHTML = '';

    predictions.forEach((confidence, index) => {
        const percentage = (confidence * 100).toFixed(1);
        const barHTML = `
            <div class="confidence-bar">
                <div class="confidence-bar-label">${classNames[index]}</div>
                <div class="confidence-bar-fill">
                    <div class="confidence-bar-value" style="width: ${percentage}%">
                        ${percentage}%
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += barHTML;
    });
}

function updateStatus(message, isError) {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.style.color = isError ? '#f44336' : '#667eea';
}

function updateInsight(text) {
    document.getElementById('insight-text').textContent = text;
}

// === ETHICS CHALLENGES ===

// Store shuffled scenarios
let shuffledEthicsScenarios = [];

const ethicsScenarios = [
    {
        title: "Scenario 1: Facial Recognition at School",
        description: "Your school wants to install AI-powered facial recognition cameras to automatically mark attendance. The system would scan every student's face when they enter the building.",
        question: "What potential problems should the school consider?",
        choices: [
            {
                text: "This is totally fine - it makes attendance faster and easier!",
                points: 0,
                feedback: "Think deeper! While convenience is nice, there are important concerns about privacy, consent, and data security. What if the data gets hacked? What about students who don't want their face scanned?"
            },
            {
                text: "Students' privacy might be violated, and the data could be misused or stolen",
                points: 50,
                feedback: "Excellent thinking! Privacy is a huge concern. Facial recognition data is very personal and sensitive. Schools need to think about: student consent, data security, who has access, and whether this is really necessary."
            },
            {
                text: "The AI might not work well for all students equally",
                points: 50,
                feedback: "Great point! Studies show facial recognition often has higher error rates for people with darker skin tones and certain facial features. This could lead to some students being incorrectly marked absent!"
            },
            {
                text: "Both privacy concerns AND potential bias in the AI are serious issues",
                points: 100,
                feedback: "Outstanding! You've identified both key problems: privacy violations and AI bias. This is the kind of critical thinking we need when implementing AI systems. Schools should explore less invasive alternatives."
            }
        ]
    },
    {
        title: "Scenario 2: AI Homework Helper",
        description: "A company creates an AI that can solve any homework problem and write essays. It becomes very popular with students. Teachers are concerned that students aren't actually learning.",
        question: "How should students use this tool responsibly?",
        choices: [
            {
                text: "Use it to get answers for all homework - it's faster!",
                points: 0,
                feedback: "This defeats the purpose of learning! While AI tools can be helpful, copying answers means you're not developing skills or understanding. You'll struggle later when you need those skills."
            },
            {
                text: "Use it to check your work and understand where you made mistakes",
                points: 75,
                feedback: "Good approach! Using AI as a learning aid to verify your work and understand errors is smart. This helps you learn from mistakes while still doing the work yourself."
            },
            {
                text: "Ask it to explain concepts you don't understand, then try problems yourself",
                points: 100,
                feedback: "Excellent! This is the best use of AI learning tools. Get explanations and examples to understand concepts, then apply what you learned independently. You're using AI to enhance learning, not replace it!"
            },
            {
                text: "Never use it at all - AI is cheating",
                points: 25,
                feedback: "While your integrity is admirable, AI tools aren't inherently bad! Like calculators, they can be valuable learning aids when used correctly. The key is using them to understand, not just to get answers."
            }
        ]
    },
    {
        title: "Scenario 3: Biased Job Screening AI",
        description: "A company built an AI to screen job applications. After using it for a year, they discovered it was rejecting qualified women applicants more often than men, even when they had the same qualifications.",
        question: "Why did this happen, and how could it be prevented?",
        choices: [
            {
                text: "The AI is just broken and needs to be replaced",
                points: 20,
                feedback: "It's more complex than that! The AI learned from biased historical data - past hiring decisions that favored men. Simply replacing it with a new AI trained on the same data would create the same problem."
            },
            {
                text: "The AI learned from past biased hiring decisions in the training data",
                points: 75,
                feedback: "Exactly right! If historical hiring data showed bias (more men hired in the past), the AI learned to replicate that bias. This is why diverse and fair training data is crucial!"
            },
            {
                text: "The training data was biased, and the AI needs regular testing for fairness",
                points: 100,
                feedback: "Perfect answer! You understand both the root cause (biased training data) and the solution (regular fairness audits). AI systems need ongoing monitoring to ensure they treat everyone fairly. Companies should also use diverse teams to build and test AI."
            },
            {
                text: "AI shouldn't be used for important decisions like hiring",
                points: 50,
                feedback: "While this prevents the immediate problem, AI can actually help reduce human bias if built correctly! The better solution is to train AI on fair data, test it regularly, and use it to assist (not replace) human decision-making."
            }
        ]
    },
    {
        title: "Scenario 4: Social Media Recommendation AI",
        description: "A social media platform's AI recommends videos to keep users watching longer. Researchers discover it's recommending increasingly extreme content - if you watch one conspiracy video, it recommends more extreme ones.",
        question: "What's the problem, and what should be done?",
        choices: [
            {
                text: "The AI is working perfectly - it's giving people what they want to watch",
                points: 0,
                feedback: "This is dangerous thinking! The AI is optimized to maximize watch time, not user wellbeing. Leading people down 'rabbit holes' of extreme content can spread misinformation and harm mental health."
            },
            {
                text: "The AI should be redesigned to consider user wellbeing, not just engagement",
                points: 100,
                feedback: "Excellent! This gets to the heart of AI ethics - what should AI optimize for? Engagement alone can be harmful. Better metrics include user wellbeing, information quality, and diverse perspectives. Companies must consider societal impact, not just profits."
            },
            {
                text: "Add content moderation to remove extreme videos",
                points: 50,
                feedback: "This helps but doesn't fix the root problem. The AI's recommendation algorithm still pushes extreme content. Both content moderation AND algorithm changes are needed to promote healthy, diverse content."
            },
            {
                text: "It's the users' responsibility to watch better content",
                points: 10,
                feedback: "While users have some responsibility, the AI is specifically designed to be addictive and manipulative. When powerful AI systems shape what billions see, companies have ethical obligations to design responsibly."
            }
        ]
    },
    {
        title: "Scenario 5: AI-Generated Art",
        description: "An AI can create beautiful artwork in seconds by learning from millions of images by human artists posted online. Some artists are upset their style is being copied without permission or payment.",
        question: "How should we think about AI and creativity?",
        choices: [
            {
                text: "AI art is fine - it's just learning like humans learn from other artists",
                points: 25,
                feedback: "There's a key difference! Humans learn techniques and inspiration, but AI copies statistical patterns from specific artists' work. Many artists never consented to their work being used as training data. This raises questions about copyright and fair compensation."
            },
            {
                text: "AI should never create art - only humans should make art",
                points: 25,
                feedback: "This might be too restrictive. AI can be a tool for creativity, like a brush or camera. The real questions are: consent for training data, credit to original artists, and distinguishing AI from human-made art."
            },
            {
                text: "Artists should be asked permission and possibly paid if their work is used to train AI",
                points: 100,
                feedback: "Excellent ethical thinking! Consent and fair compensation are important. Some solutions: 1) Only train on work artists agree to share, 2) Pay artists whose work is used, 3) Clearly label AI-generated art, 4) Use AI as a tool to assist, not replace, artists."
            },
            {
                text: "AI art should be labeled so people know it's not human-made",
                points: 75,
                feedback: "Great point! Transparency is important. People should know if art is AI-generated. This also raises interesting questions: Does it matter who/what creates art? How do we value creativity? Should AI art compete in the same spaces as human art?"
            }
        ]
    },
    {
        title: "Scenario 6: AI Medical Diagnosis",
        description: "A hospital develops an AI that can analyze medical scans and suggest diagnoses faster than human doctors. Early tests show it's 95% accurate, but doctors are concerned about the 5% of cases where it's wrong.",
        question: "How should this AI be used in healthcare?",
        choices: [
            {
                text: "Replace doctors with AI - it's more accurate most of the time",
                points: 0,
                feedback: "This is dangerous! That 5% error rate represents real people's lives. AI can make mistakes humans wouldn't, and patients deserve human judgment, empathy, and the ability to ask questions. Medical decisions are too important to fully automate."
            },
            {
                text: "Use AI to assist doctors, but doctors make final decisions",
                points: 100,
                feedback: "Perfect! This is the best approach. AI can help doctors by flagging potential issues and processing data quickly, but human doctors should review findings, consider the whole patient, and make final decisions. This combines AI's speed with human expertise and accountability."
            },
            {
                text: "Only use AI for simple cases, not complex ones",
                points: 50,
                feedback: "This is partially good thinking, but AI can actually be helpful for complex cases too - as long as doctors remain in charge. The key is using AI as a powerful tool to support doctors, not replace them, regardless of case complexity."
            },
            {
                text: "Test the AI more until it's 100% accurate",
                points: 25,
                feedback: "While more testing is good, no AI (or human!) will ever be 100% accurate in medicine. The goal isn't perfection - it's using AI responsibly as a tool to help doctors make better decisions while maintaining human oversight and accountability."
            }
        ]
    },
    {
        title: "Scenario 7: Smart Home Privacy",
        description: "A company's smart home devices (speakers, cameras, thermostats) use AI to learn your habits and make your home more convenient. But to work well, they need to constantly collect data about when you're home, what you say, and what you do.",
        question: "What should users consider about smart home AI?",
        choices: [
            {
                text: "Convenience is worth it - I don't care if companies have my data",
                points: 0,
                feedback: "This data is more sensitive than you think! It reveals when you're away (security risk), your private conversations, health habits, and daily routines. Once collected, data can be hacked, sold, or used in ways you didn't expect. Your privacy has value!"
            },
            {
                text: "Users should know exactly what data is collected and be able to delete it",
                points: 100,
                feedback: "Excellent! Transparency and control are key. Users deserve to know: what's collected, how it's used, who can access it, how long it's kept, and how to delete it. Good companies should offer local processing (data stays in your home) and clear privacy controls."
            },
            {
                text: "Only use devices that don't have cameras or microphones",
                points: 50,
                feedback: "This reduces risk but might be too restrictive. The better solution is choosing companies with strong privacy practices, understanding what you're agreeing to, and using privacy settings to limit data collection while still getting benefits."
            },
            {
                text: "The government should regulate what data these devices can collect",
                points: 75,
                feedback: "Good thinking! Regulations can help protect consumers. But users also need to take personal responsibility - read privacy policies, adjust settings, and choose companies that respect privacy. A combination of regulation and personal awareness works best."
            }
        ]
    },
    {
        title: "Scenario 8: AI Chatbot Friend",
        description: "A company creates an AI chatbot designed to be a friend for people who are lonely. The AI remembers conversations, offers emotional support, and is always available. Some people start preferring the AI to real human friends.",
        question: "What are the potential benefits and concerns?",
        choices: [
            {
                text: "This is great - AI friends are better because they're always nice and available",
                points: 0,
                feedback: "Real friendships involve challenges, disagreements, and growth - things AI can't provide. While AI can offer support, relying only on AI relationships means missing out on genuine human connection, empathy, and the personal growth that comes from navigating real relationships."
            },
            {
                text: "AI chatbots can provide support, but shouldn't replace human relationships",
                points: 100,
                feedback: "Exactly right! AI companions can help people who are isolated or anxious practice social skills and receive some support. But they should be a bridge to human connection, not a replacement. Real relationships involve mutual growth, genuine empathy, and shared experiences that AI can't replicate."
            },
            {
                text: "AI chatbots should be banned - they're manipulative and unhealthy",
                points: 25,
                feedback: "While there are concerns, AI tools can help some people (like those with social anxiety or in remote areas). Instead of banning, we should: require clear disclosure that it's AI, limit emotional manipulation, and design these tools to encourage real human connections."
            },
            {
                text: "Users should be clearly told it's AI and warned about over-reliance",
                points: 75,
                feedback: "Great point! Transparency is crucial. Users should know they're talking to AI, understand its limitations, and be encouraged to maintain human relationships. Companies should avoid designs that deliberately create emotional dependence on AI."
            }
        ]
    }
];

function goToEthicsChallenge() {
    predicting = false; // Stop prediction loop
    gameState.currentScenario = 0;
    // Shuffle scenarios each time mission starts
    shuffledEthicsScenarios = shuffleArray(ethicsScenarios);
    showScreen('ethics-screen');
    loadScenario(0);
    addPoints(50); // Bonus for completing training
}

function loadScenario(index) {
    if (index >= shuffledEthicsScenarios.length) {
        goToPromptEngineering();
        return;
    }

    const scenario = shuffledEthicsScenarios[index];
    const container = document.getElementById('scenario-container');

    // Shuffle choices for variety, but remember original indices
    const shuffledChoices = scenario.choices.map((choice, originalIndex) => ({
        ...choice,
        originalIndex
    }));

    // Shuffle the choices array
    for (let i = shuffledChoices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]];
    }

    let choicesHTML = '';
    shuffledChoices.forEach((choice, displayIndex) => {
        choicesHTML += `
            <button class="choice-btn" onclick="selectChoice(${choice.originalIndex})">
                ${choice.text}
            </button>
        `;
    });

    container.innerHTML = `
        <div class="scenario">
            <h3>${scenario.title}</h3>
            <div class="scenario-description">${scenario.description}</div>
            <div class="scenario-question">${scenario.question}</div>
            <div class="choices">${choicesHTML}</div>
        </div>
    `;

    document.getElementById('scenario-feedback').style.display = 'none';
}

function selectChoice(choiceIndex) {
    const scenario = shuffledEthicsScenarios[gameState.currentScenario];
    const choice = scenario.choices[choiceIndex];

    // Highlight selected choice
    const btns = document.querySelectorAll('.choice-btn');
    btns.forEach((btn, i) => {
        if (i === choiceIndex) {
            btn.classList.add('selected');
        } else {
            btn.style.opacity = '0.5';
        }
        btn.disabled = true;
    });

    // Show feedback
    const feedbackEl = document.getElementById('scenario-feedback');
    const feedbackClass = choice.points >= 75 ? 'correct' : 'partial';
    feedbackEl.className = `scenario-feedback ${feedbackClass}`;
    feedbackEl.style.display = 'block';

    let title = choice.points >= 75 ? '🎉 Great thinking!' : '🤔 Think deeper...';
    if (choice.points === 0) title = '❌ Not quite...';

    document.getElementById('feedback-title').textContent = title;
    document.getElementById('feedback-text').textContent = choice.feedback;

    addPoints(choice.points);
}

function nextScenario() {
    gameState.currentScenario++;

    if (gameState.currentScenario >= ethicsScenarios.length) {
        goToPromptEngineering();
    } else {
        loadScenario(gameState.currentScenario);
    }
}

// === MISSION 3: PROMPT ENGINEERING ===

let currentPromptLevel = 0;
let hintsUsed = 0;
let exampleShown = false;
let totalPromptScore = 0;

function goToPromptEngineering() {
    showScreen('prompt-engineering-screen');
    Mission3.init();
    currentPromptLevel = 0;
    hintsUsed = 0;
    exampleShown = false;
    totalPromptScore = 0;
    
    // Show learning overview first
    document.getElementById('pe-learning-overview').style.display = 'block';
    document.getElementById('pe-practice-area').style.display = 'none';
    
    addPoints(50); // Bonus for completing ethics challenges
}

function startPromptPractice() {
    document.getElementById('pe-learning-overview').style.display = 'none';
    document.getElementById('pe-practice-area').style.display = 'block';
    loadPromptLevel(0);
}

function loadPromptLevel(levelIndex) {
    const result = Mission3.loadLevel(levelIndex);

    if (result.completed) {
        completeGame();
        return;
    }

    const level = result.level;
    const progress = result.progress;

    // Update progress indicator
    document.getElementById('pe-current').textContent = progress.current;
    document.getElementById('pe-total').textContent = progress.total;

    // Update level container
    const container = document.getElementById('pe-level-container');
    container.innerHTML = `
        <div class="pe-level">
            <h3>${level.title}</h3>
            <div class="pe-scenario">
                <strong>Scenario:</strong> ${level.scenario}
            </div>
            <div class="pe-task-box">
                <strong>Your Task:</strong> ${level.task}
            </div>
            <div class="pe-bad-example">
                <strong>❌ Bad Prompt:</strong> "${level.badPrompt}"
            </div>
        </div>
    `;

    // Reset UI
    document.getElementById('pe-prompt-input').value = '';
    document.getElementById('pe-feedback').style.display = 'none';
    document.getElementById('pe-hint-box').style.display = 'none';
    document.getElementById('pe-input-area').style.display = 'block';
    hintsUsed = 0;
    exampleShown = false;

    // Update insight
    updatePromptInsight(levelIndex);
}

function updatePromptInsight(levelIndex) {
    const insights = [
        "Good prompts are specific and detailed. Instead of 'write a story,' try 'write a 200-word adventure story for 10-year-olds about a space explorer.'",
        "Add context about what you know and where you're stuck. AI assistants are more helpful when they understand your situation.",
        "Don't be afraid to refine your prompts! If the first result isn't perfect, adjust your prompt with more specific constraints.",
        "Specify the format you want: bullet points, paragraphs, tables, or step-by-step instructions. This helps AI organize information better.",
        "The best prompts combine everything: specificity, context, format requirements, and constraints. Think like you're briefing a helpful assistant!"
    ];

    document.getElementById('pe-insight-text').textContent = insights[levelIndex] || insights[0];
}

function showPromptHint() {
    const hint = Mission3.getHint(currentPromptLevel, hintsUsed);
    if (hint) {
        document.getElementById('pe-hint-text').textContent = hint;
        document.getElementById('pe-hint-box').style.display = 'block';
        hintsUsed++;
    } else {
        document.getElementById('pe-hint-text').textContent = "No more hints available!";
        document.getElementById('pe-hint-box').style.display = 'block';
    }
}

function showPromptExample() {
    const example = Mission3.showExample(currentPromptLevel);
    exampleShown = true;

    const container = document.getElementById('pe-level-container');
    container.innerHTML += `
        <div class="pe-example-box">
            <h4>✅ Example Good Prompt:</h4>
            <p>"${example.good}"</p>
            <small>Now try writing your own prompt based on this example!</small>
        </div>
    `;
}

function submitPrompt() {
    const userPrompt = document.getElementById('pe-prompt-input').value.trim();

    if (!userPrompt) {
        alert('Please write a prompt first!');
        return;
    }

    const result = Mission3.evaluatePrompt(userPrompt, currentPromptLevel);

    // Show feedback
    document.getElementById('pe-feedback').style.display = 'block';
    document.getElementById('pe-input-area').style.display = 'none';

    // Update feedback title
    if (result.score >= 80) {
        document.getElementById('pe-feedback-title').textContent = '🎉 Excellent Prompt!';
    } else if (result.score >= 60) {
        document.getElementById('pe-feedback-title').textContent = '👍 Good Job!';
    } else {
        document.getElementById('pe-feedback-title').textContent = '🤔 Keep Practicing!';
    }

// Show score
    document.getElementById('pe-score-value').textContent = result.score;
    
    // Update and show total score
    totalPromptScore += result.score;
    document.getElementById('pe-total-score').textContent = totalPromptScore;

    // Show feedback text
    document.getElementById('pe-feedback-text').innerHTML = result.feedback.map(f => `<p>${f}</p>`).join('');

    // Show matched criteria
    if (result.matchedCriteria.length > 0) {
        document.getElementById('pe-matched-criteria').innerHTML = `
            <div class="pe-criteria-list">
                <strong>✓ What you included:</strong>
                <ul>
                    ${result.matchedCriteria.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Show appropriate buttons
    if (result.passed) {
        document.getElementById('pe-next-btn').style.display = 'inline-block';
        document.getElementById('pe-retry-btn').style.display = 'none';
        addPoints(Math.floor(result.score));
    } else {
        document.getElementById('pe-next-btn').style.display = 'none';
        document.getElementById('pe-retry-btn').style.display = 'inline-block';
        addPoints(Math.floor(result.score / 2));
    }
}

function retryPromptLevel() {
    document.getElementById('pe-feedback').style.display = 'none';
    document.getElementById('pe-input-area').style.display = 'block';
}

function nextPromptLevel() {
    currentPromptLevel++;
    loadPromptLevel(currentPromptLevel);
}

function completeGame() {
    showScreen('completion-screen');
    document.getElementById('final-points').textContent = gameState.points;

    // Update level based on score
    if (gameState.points >= 400) {
        gameState.level = 3;
    } else if (gameState.points >= 250) {
        gameState.level = 2;
    }
    updateScoreBoard();
}

function showResources() {
    const resources = `
🌟 Want to learn more about AI?

📚 Recommended Resources:
• AI4K12.org - AI education for students
• Machine Learning for Kids (machinelearningforkids.co.uk)
• Google's Teachable Machine
• MIT AI Ethics resources
• Khan Academy - Intro to AI

🎮 More AI Projects:
• Create your own image classifier
• Build a chatbot
• Train a self-driving car simulation
• Make AI-generated music or art

💡 Remember:
• Always think about who AI helps and who it might harm
• Question the data used to train AI
• Consider privacy and consent
• AI is a tool - use it responsibly!
    `;

    alert(resources);
}
