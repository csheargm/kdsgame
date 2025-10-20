# Missions Module Architecture

This directory contains modular mission implementations for the AI Academy game.

## Architecture Overview

The game now uses a **modular mission architecture** that separates each mission into its own self-contained module. This design provides:

- **Separation of Concerns**: Each mission has its own logic, state, and data
- **Reusability**: Missions can be easily reused or modified
- **Maintainability**: Easy to add, update, or remove missions
- **Testability**: Modules can be tested independently
- **Scalability**: Simple to add new missions without modifying core game logic

## Module Structure

Each mission module follows this pattern:

```javascript
const MissionName = (function() {
    'use strict';

    // Private state
    let internalState = {};

    // Private data structures (levels, scenarios, etc.)
    const data = [...];

    // Private helper functions
    function privateHelper() { }

    // Public API
    return {
        init: function() { },
        loadLevel: function() { },
        evaluate: function() { },
        // ... other public methods
    };
})();
```

## Current Missions

### Mission 1: Train Your Image Classifier
- **Location**: Integrated in `game.js` (legacy code)
- **Type**: Machine Learning Training
- **Tech**: TensorFlow.js, WebRTC
- **Learning Goals**: ML basics, training data, model accuracy

### Mission 2: AI Ethics Challenge
- **Location**: Integrated in `game.js` (legacy code)
- **Type**: Scenario-based learning
- **Learning Goals**: Privacy, bias, fairness, responsible AI

### Mission 3: Prompt Engineering
- **Location**: `missions/mission3-prompt-engineering.js`
- **Type**: Interactive writing exercises
- **Learning Goals**: Effective prompting, context, specificity, iteration

## Integration Pattern

### 1. Module Definition
Create a new file in `/missions/` directory:
```javascript
// missions/mission-name.js
const MissionX = (function() {
    // Module implementation
    return {
        init: init,
        // ... public methods
    };
})();
```

### 2. HTML Section
Add a screen section in `index.html`:
```html
<section id="mission-x-screen" class="screen">
    <!-- Mission UI -->
</section>
```

### 3. Styles
Add mission-specific styles in `styles.css`:
```css
/* Mission X Styles */
.mission-x-content { }
```

### 4. Game Integration
Add navigation functions in `game.js`:
```javascript
function goToMissionX() {
    showScreen('mission-x-screen');
    MissionX.init();
    loadMissionXContent();
}
```

### 5. Script Loading
Include module in `index.html`:
```html
<script src="missions/mission-name.js"></script>
```

## Mission 3 Implementation Details

### Module API

```javascript
Mission3.init()                      // Initialize mission
Mission3.loadLevel(index)            // Load specific level
Mission3.evaluatePrompt(text, level) // Evaluate user's prompt
Mission3.getHint(level, hintNum)     // Get hint for level
Mission3.showExample(level)          // Show good example
Mission3.getRealWorldExamples()      // Get real-world examples
Mission3.getProgress()               // Get current progress
```

### Data Structure

Each level contains:
- `id`: Unique identifier
- `title`: Level name
- `scenario`: Context/situation
- `task`: What the user needs to do
- `badPrompt`: Example of poor prompt
- `hints`: Array of hints
- `scoringCriteria`: Evaluation rules
- `exampleGoodPrompt`: Model answer

### Scoring System

The module evaluates prompts based on:
1. **Keyword matching**: Regex patterns for key concepts
2. **Length validation**: Minimum word count requirements
3. **Criteria scoring**: Points for each matched criterion
4. **Pass threshold**: 60% minimum to advance

## Adding New Missions

To add a new mission:

1. **Create Module** (`missions/mission4-new-topic.js`)
   - Define mission data
   - Implement core logic
   - Expose public API

2. **Add HTML** (in `index.html`)
   - Create new screen section
   - Add UI elements with unique IDs

3. **Add Styles** (in `styles.css`)
   - Mission-specific styling
   - Responsive design

4. **Update Game Flow** (in `game.js`)
   - Add navigation function
   - Update previous mission to link to new one
   - Add initialization logic

5. **Load Script** (in `index.html`)
   - Add script tag before `game.js`

## Best Practices

1. **Use IIFE Pattern**: Encapsulate module with Immediately Invoked Function Expression
2. **Private by Default**: Only expose necessary public methods
3. **Clear API**: Public methods should be intuitive and well-documented
4. **State Management**: Keep state within module, expose getters if needed
5. **Error Handling**: Validate inputs and handle edge cases
6. **Consistent Naming**: Use clear, descriptive names (e.g., `pe-` prefix for Prompt Engineering)
7. **Responsive Design**: Ensure mobile compatibility
8. **Accessibility**: Use semantic HTML and proper ARIA labels

## Future Missions (Roadmap)

From the README, planned missions include:

- **Mission 4**: Statistics & AI Predictions
- **Mission 5**: Systems Thinking
- **Mission 6**: Learning How to Learn
- **Mission 7**: Conflict Resolution
- **Mission 8**: Embracing New Tools & Technologies
- **Mission 9**: Human Creativity & Authenticity

## Testing

To test a mission module:

1. Open browser console (F12)
2. Test public API:
```javascript
Mission3.init();
Mission3.loadLevel(0);
Mission3.evaluatePrompt("test prompt", 0);
```

3. Check state:
```javascript
Mission3.getProgress();
```

## Benefits of This Architecture

- **Maintainability**: Easy to find and fix bugs in specific missions
- **Collaboration**: Multiple developers can work on different missions
- **Performance**: Only load missions when needed (future optimization)
- **Testing**: Unit test individual missions independently
- **Documentation**: Each module is self-documenting
- **Flexibility**: Easy to enable/disable missions or change order

## Migration Plan

Future improvements:
1. Refactor Mission 1 and Mission 2 into separate modules
2. Create a `MissionManager` class to orchestrate mission flow
3. Implement lazy loading for mission modules
4. Add mission prerequisites and dependencies
5. Create a mission configuration file
