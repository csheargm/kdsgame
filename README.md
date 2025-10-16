# AI Academy - Learn AI & Ethics

An interactive educational game that teaches kids (ages 11+) about machine learning and AI ethics.

## Features

- **Train Your Own AI**: Use your webcam to train a real image classifier
- **Ethics Challenges**: Solve real-world AI scenarios about privacy, bias, and fairness
- **Browser-Based ML**: Uses TensorFlow.js - no installation needed!

## How to Run

1. Open `index.html` in a modern web browser (Chrome, Edge, Firefox, or Safari)
2. Allow camera access when prompted
3. Follow the on-screen instructions

## Troubleshooting

### Camera Not Working?

**Option 1: Check Browser Permissions**
- Look for a camera icon in your browser's address bar
- Click it and make sure camera access is "Allowed"
- Refresh the page

**Option 2: Use a Local Server**
Some browsers require HTTPS for camera access. You can run a local server:

```bash
# If you have Python installed:
python -m http.server 8000

# Then open: http://localhost:8000
```

**Option 3: Check Browser Console**
1. Press F12 to open Developer Tools
2. Click the "Console" tab
3. Look for error messages that might help diagnose the issue

### Common Issues

- **"Camera access denied"**: Click "Allow" when the browser asks for permission
- **Black screen**: Make sure another app isn't using your camera
- **No permission prompt**: Try a different browser or check your OS camera privacy settings

## System Requirements

- Modern web browser (Chrome 90+, Edge 90+, Firefox 85+, Safari 14+)
- Webcam
- Internet connection (for loading TensorFlow.js library)

## What Kids Learn

1. **Machine Learning Basics**
   - Training data and testing data
   - How AI learns patterns
   - Model accuracy and prediction

2. **Critical Thinking About AI**
   - Privacy concerns
   - Algorithmic bias
   - Fair AI systems
   - Responsible AI use

3. **Real-World Applications**
   - Facial recognition ethics
   - AI in education
   - Social media algorithms
   - AI creativity

## Technologies Used

- **TensorFlow.js** - Machine learning in the browser
- **Vanilla JavaScript** - No frameworks needed
- **HTML5 Canvas** - For image processing
- **WebRTC** - For webcam access

## Next Steps

Want to expand this game? Consider adding:
- More ML models (object detection, pose estimation)
- Additional ethics scenarios
- Multiplayer challenges
- Progress saving with localStorage
- More subjects (math, science, reading)

## Credits

Built with Claude Code to make AI education accessible and fun!
