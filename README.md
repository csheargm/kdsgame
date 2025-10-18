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

## Roadmap - Upcoming Modules

These new learning modules will help kids develop essential skills for the AI era. **Kids will vote on which ones to build first!**

### Planned Modules

**Mission 3: Prompt Engineering** 🎯
- Learn to write effective prompts for AI tools
- Understand how different prompts get different results
- Practice iterative refinement and adding context
- Real-world applications: homework help, creative writing, research

**Mission 4: Statistics & AI Predictions** 📊
- Visualize how AI makes predictions from data
- Understand confidence levels and margins of error
- Learn when to trust AI predictions vs. be skeptical
- Interactive charts and probability exercises

**Mission 5: Systems Thinking** 🔄
- Explore interconnected systems and feedback loops
- Understand cause-and-effect in complex AI systems
- Analyze recommendation algorithms and their impacts
- Develop holistic problem-solving skills

**Mission 6: Learning How to Learn** 📚
- Meta-learning: strategies for mastering new AI tools
- Pattern recognition across different technologies
- Growth mindset and embracing challenges
- Guided discovery and exploration techniques

**Mission 7: Conflict Resolution** 🤝
- Practice empathy and active listening
- Role-play mediation scenarios
- Understand why AI can't replace human emotional intelligence
- Real-world conflict scenarios for kids

**Mission 8: Embracing New Tools & Technologies** 🚀
- Overcome tech anxiety through gamified exploration
- Learn trial-and-error in a safe environment
- Celebrate mistakes as learning opportunities
- Build adaptability for rapid technological change

**Mission 9: Human Creativity & Authenticity** 🎨
- Explore skills AI struggles to replicate
- Develop unique voice and personal perspective
- Creative storytelling and emotional expression
- Compare AI-generated vs. human-created content

### How to Contribute

Want to help build these modules or suggest new ones? Check out our [GitHub Issues](https://github.com/csheargm/kdsgame/issues) to see what we're working on and share your ideas!

## Next Steps

Additional ideas for expansion:
- More ML models (object detection, pose estimation)
- Additional ethics scenarios
- Multiplayer challenges
- Progress saving with localStorage

## Live Demo

Visit the live demo at: https://csheargm.github.io/kdsgame/

## License

MIT License - Feel free to use and modify for educational purposes.
