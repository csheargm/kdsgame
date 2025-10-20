// Mission 3: Prompt Engineering Module
// This module teaches kids how to write effective prompts for AI tools

const Mission3 = (function() {
    'use strict';

    // Private state
    let currentLevel = 0;
    let promptAttempts = 0;
    let bestScore = 0;
    let shuffledLevels = [];

    // Utility function to shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        const shuffled = [...array]; // Create a copy
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Prompt Engineering Levels
    const levels = [
        {
            id: 1,
            title: "Level 1: Be Specific",
            scenario: "You want an AI to help you write a story about space.",
            task: "Write a prompt that tells the AI exactly what kind of space story you want.",
            badPrompt: "Write a story about space",
            hints: [
                "What kind of space story? (adventure, mystery, science?)",
                "Who are the main characters?",
                "What's the setting? (future, present, alternate reality?)",
                "What age group is this for?"
            ],
            scoringCriteria: [
                { keyword: "adventure|mystery|science|thriller|comedy", points: 20, description: "Specifies genre" },
                { keyword: "astronaut|alien|robot|scientist|explorer", points: 20, description: "Mentions characters" },
                { keyword: "future|2050|space station|mars|galaxy", points: 20, description: "Describes setting" },
                { keyword: "kid|child|teen|young adult|student", points: 20, description: "Specifies audience" },
                { keyword: "short|100 words|paragraph|page", points: 20, description: "Indicates length" }
            ],
            exampleGoodPrompt: "Write a short adventure story (about 200 words) for kids aged 10-12 about a young astronaut who discovers a friendly alien on Mars in the year 2050."
        },
        {
            id: 2,
            title: "Level 2: Add Context",
            scenario: "You need help solving a math word problem for homework.",
            task: "Write a prompt that gives the AI context about what you know and where you're stuck.",
            badPrompt: "Help me with math",
            hints: [
                "What math topic are you working on?",
                "What have you tried already?",
                "What specific part confuses you?",
                "What grade level is this?"
            ],
            scoringCriteria: [
                { keyword: "algebra|geometry|fractions|percentages|equations", points: 20, description: "Mentions math topic" },
                { keyword: "grade|7th|eighth|level", points: 15, description: "Specifies grade level" },
                { keyword: "tried|attempted|confused|stuck|don't understand", points: 25, description: "Explains difficulty" },
                { keyword: "problem|question|exercise", points: 15, description: "References the problem" },
                { keyword: "explain|show steps|help understand|break down", points: 25, description: "Asks for explanation" }
            ],
            exampleGoodPrompt: "I'm in 7th grade and working on solving equations with variables on both sides. I tried to solve '3x + 5 = 2x + 12' but I'm confused about what to do when the variable is on both sides. Can you explain the steps?"
        },
        {
            id: 3,
            title: "Level 3: Iterative Refinement",
            scenario: "You asked an AI to create a recipe, but the result was too complicated.",
            task: "Write a follow-up prompt that refines your original request.",
            badPrompt: "Make it simpler",
            hints: [
                "What specifically was too complicated?",
                "What's your skill level in cooking?",
                "What ingredients or tools do you have?",
                "How much time do you have?"
            ],
            scoringCriteria: [
                { keyword: "simpler|easier|basic|beginner", points: 20, description: "Asks for simplification" },
                { keyword: "ingredients|steps|instructions", points: 20, description: "Specifies what to simplify" },
                { keyword: "minutes|time|quick|fast", points: 20, description: "Mentions time constraint" },
                { keyword: "beginner|first time|never cooked|learning", points: 20, description: "Indicates skill level" },
                { keyword: "without|don't have|no|common ingredients", points: 20, description: "Mentions constraints" }
            ],
            exampleGoodPrompt: "Can you simplify this recipe for a beginner? I'd like it to have 5 ingredients or less, take under 30 minutes, and not require any special equipment. I've never baked before."
        },
        {
            id: 4,
            title: "Level 4: Specify Format",
            scenario: "You need information about climate change for a school presentation.",
            task: "Write a prompt that specifies how you want the information formatted.",
            badPrompt: "Tell me about climate change",
            hints: [
                "What format do you need? (bullet points, table, paragraph?)",
                "What specific aspects of climate change?",
                "How much information do you need?",
                "What's the purpose? (presentation, essay, poster?)"
            ],
            scoringCriteria: [
                { keyword: "bullet points|list|table|chart|outline", points: 25, description: "Specifies format" },
                { keyword: "causes|effects|solutions|facts|statistics", points: 20, description: "Specifies aspects" },
                { keyword: "presentation|slide|poster|essay", points: 20, description: "Mentions purpose" },
                { keyword: "5|three|ten|number", points: 15, description: "Indicates quantity" },
                { keyword: "simple|clear|easy to understand|grade", points: 20, description: "Specifies complexity" }
            ],
            exampleGoodPrompt: "Create a bulleted list of 5 main causes of climate change and 5 key effects, written in simple language for a 6th grade presentation. Format it so I can easily add it to slides."
        },
        {
            id: 5,
            title: "Level 5: Master Prompt",
            scenario: "You want to use AI to help you prepare for a science fair project about renewable energy.",
            task: "Write a comprehensive prompt that includes specificity, context, format, and constraints.",
            badPrompt: "Help with my science fair project",
            hints: [
                "What specific renewable energy topic?",
                "What type of help do you need?",
                "What have you done so far?",
                "What are your constraints? (time, materials, budget?)",
                "What format do you need the help in?"
            ],
            scoringCriteria: [
                { keyword: "solar|wind|hydro|geothermal|renewable energy", points: 15, description: "Specific topic" },
                { keyword: "science fair|project|experiment|demonstration", points: 10, description: "Context" },
                { keyword: "grade|age|school level", points: 10, description: "Education level" },
                { keyword: "experiment|research|display|presentation", points: 15, description: "Type of project" },
                { keyword: "budget|\\$|money|cost|cheap|inexpensive", points: 10, description: "Budget constraint" },
                { keyword: "time|week|days|deadline", points: 10, description: "Time constraint" },
                { keyword: "materials|supplies|equipment|household", points: 10, description: "Material constraints" },
                { keyword: "steps|plan|guide|instructions", points: 10, description: "Format requested" },
                { keyword: "understand|learn|explain|demonstrate", points: 10, description: "Learning goal" }
            ],
            exampleGoodPrompt: "I'm an 8th grader working on a science fair project about solar energy. I need to design a simple experiment that demonstrates how solar panels work, using materials under $20 that I can find at home or a hardware store. Can you provide a step-by-step plan including: 1) the scientific concept I'm demonstrating, 2) materials needed, 3) experiment procedures, and 4) what results to expect? I have 2 weeks to complete this."
        },
        {
            id: 6,
            title: "Level 6: Creative Specificity",
            scenario: "You want an AI to help you create a character for a story you're writing.",
            task: "Write a prompt that gives the AI enough detail to create an interesting, specific character.",
            badPrompt: "Create a character",
            hints: [
                "What type of character? (hero, villain, sidekick?)",
                "What genre is your story? (fantasy, sci-fi, realistic?)",
                "What personality traits or quirks?",
                "What role do they play in the story?"
            ],
            scoringCriteria: [
                { keyword: "fantasy|sci-fi|mystery|realistic|adventure|historical", points: 20, description: "Genre specified" },
                { keyword: "hero|villain|protagonist|antagonist|sidekick|mentor", points: 20, description: "Role in story" },
                { keyword: "brave|shy|funny|smart|mysterious|curious|rebellious", points: 25, description: "Personality traits" },
                { keyword: "age|teen|child|adult|young|old", points: 15, description: "Age specified" },
                { keyword: "background|history|motivation|goal|conflict", points: 20, description: "Character depth" }
            ],
            exampleGoodPrompt: "Create a teenage protagonist for a fantasy adventure story. They should be brave but impulsive, around 14 years old, with a mysterious past they're trying to uncover. Include a unique skill or talent that helps them in their quest, and a personal weakness or fear they need to overcome."
        },
        {
            id: 7,
            title: "Level 7: Research Assistant",
            scenario: "You need to research information about ocean pollution for a school report.",
            task: "Write a prompt that helps you gather specific, credible information for your report.",
            badPrompt: "Tell me about ocean pollution",
            hints: [
                "What specific aspects? (causes, effects, solutions?)",
                "What format do you need? (summary, facts, statistics?)",
                "What's your report's focus or argument?",
                "What level of detail do you need?"
            ],
            scoringCriteria: [
                { keyword: "causes|effects|impacts|solutions|prevention", points: 25, description: "Specific aspects" },
                { keyword: "plastic|chemical|oil|waste|debris", points: 20, description: "Types of pollution" },
                { keyword: "facts|statistics|data|numbers|studies", points: 20, description: "Evidence type" },
                { keyword: "report|essay|presentation|paper", points: 15, description: "Purpose" },
                { keyword: "recent|current|latest|2020|2021|2022|2023|2024", points: 20, description: "Timeframe" }
            ],
            exampleGoodPrompt: "I need to write a 3-page report on plastic pollution in oceans for my 9th grade environmental science class. Can you provide: 1) three major causes of plastic ocean pollution, 2) five specific effects on marine life with statistics from the last 5 years, and 3) three practical solutions being implemented globally? Present each as a brief paragraph with key facts I can cite."
        },
        {
            id: 8,
            title: "Level 8: Problem Solver",
            scenario: "Your basketball team keeps losing games in the final quarter.",
            task: "Write a prompt asking AI to help analyze the problem and suggest solutions.",
            badPrompt: "How do we win more games",
            hints: [
                "What specific problem happens in the final quarter?",
                "What have you already tried?",
                "What information might help? (strategies, drills, mindset?)",
                "What constraints do you have? (practice time, skill level?)"
            ],
            scoringCriteria: [
                { keyword: "final quarter|fourth quarter|end of game|closing minutes", points: 20, description: "Specific problem" },
                { keyword: "tired|fatigue|energy|stamina|conditioning", points: 20, description: "Physical factors" },
                { keyword: "pressure|nervous|focus|mental|confidence", points: 20, description: "Mental factors" },
                { keyword: "strategy|tactics|plays|defense|offense", points: 20, description: "Tactical elements" },
                { keyword: "practice|drill|training|improve|develop", points: 20, description: "Solutions needed" }
            ],
            exampleGoodPrompt: "Our middle school basketball team is undefeated in the first three quarters but loses focus and energy in the final quarter, leading to losses. We practice 3 times a week for 90 minutes. Can you suggest: 1) conditioning drills to improve stamina, 2) mental strategies to stay focused under pressure, and 3) tactical adjustments for closing out games? Keep suggestions appropriate for 12-13 year olds."
        }
    ];

    // Real-world application examples
    const realWorldExamples = [
        {
            context: "Homework Help",
            bad: "Help me with history homework",
            good: "I'm writing a 5-paragraph essay on the causes of World War I for 10th grade history. I have three causes already (assassination, alliances, imperialism). Can you suggest two more causes and provide a brief explanation (2-3 sentences each) for why each was significant?",
            lesson: "Specific context helps AI provide relevant, targeted assistance"
        },
        {
            context: "Creative Writing",
            bad: "Write a poem",
            good: "Write a 12-line rhyming poem about friendship for a middle school student. Use simple language and include imagery about nature (trees, rivers, stars). The tone should be uplifting and encouraging.",
            lesson: "Detailed creative prompts lead to better, more personalized results"
        },
        {
            context: "Learning New Topics",
            bad: "Explain photosynthesis",
            good: "Explain photosynthesis to a 6th grader using a simple analogy (like a factory or kitchen). Include the 3 main inputs, the process, and the 2 main outputs. Keep it to 3-4 sentences.",
            lesson: "Specifying audience and format makes explanations more useful"
        }
    ];

    // Initialize Mission 3
    function init() {
        currentLevel = 0;
        promptAttempts = 0;
        bestScore = 0;
        // Shuffle levels each time mission starts
        shuffledLevels = shuffleArray(levels);
        console.log('Mission 3: Prompt Engineering initialized');
    }

    // Load a specific level
    function loadLevel(levelIndex) {
        if (levelIndex >= shuffledLevels.length) {
            return showCompletion();
        }

        currentLevel = levelIndex;
        const level = shuffledLevels[levelIndex];

        return {
            level: level,
            progress: {
                current: levelIndex + 1,
                total: shuffledLevels.length
            }
        };
    }

    // Evaluate a user's prompt
    function evaluatePrompt(userPrompt, levelIndex) {
        const level = shuffledLevels[levelIndex];
        let score = 0;
        let feedback = [];
        let matchedCriteria = [];

        // Convert prompt to lowercase for case-insensitive matching
        const promptLower = userPrompt.toLowerCase();

        // Check each scoring criterion
        level.scoringCriteria.forEach(criterion => {
            const regex = new RegExp(criterion.keyword, 'i');
            if (regex.test(promptLower)) {
                score += criterion.points;
                matchedCriteria.push(criterion.description);
            }
        });

        // Check prompt length (should be substantial)
        const wordCount = userPrompt.trim().split(/\s+/).length;
        if (wordCount < 10) {
            feedback.push("Your prompt is very short. Try adding more details!");
            score = Math.max(0, score - 20);
        } else if (wordCount >= 20) {
            feedback.push("Great detail! You included lots of helpful information.");
            score += 10;
        }

        // Generate feedback
        if (score >= 80) {
            feedback.unshift("Excellent prompt! You've mastered this level!");
        } else if (score >= 60) {
            feedback.unshift("Good prompt! You're on the right track.");
        } else if (score >= 40) {
            feedback.unshift("Decent start, but try adding more specifics.");
        } else {
            feedback.unshift("Your prompt needs more detail. Check the hints!");
        }

        promptAttempts++;
        if (score > bestScore) {
            bestScore = score;
        }

        return {
            score: Math.min(score, 100),
            feedback: feedback,
            matchedCriteria: matchedCriteria,
            wordCount: wordCount,
            passed: score >= 60
        };
    }

    // Show hint
    function getHint(levelIndex, hintNumber) {
        const level = shuffledLevels[levelIndex];
        if (hintNumber < level.hints.length) {
            return level.hints[hintNumber];
        }
        return null;
    }

    // Show example
    function showExample(levelIndex) {
        const level = shuffledLevels[levelIndex];
        return {
            bad: level.badPrompt,
            good: level.exampleGoodPrompt
        };
    }

    // Get real-world examples
    function getRealWorldExamples() {
        return realWorldExamples;
    }

    // Show completion
    function showCompletion() {
        return {
            completed: true,
            totalLevels: shuffledLevels.length,
            attempts: promptAttempts,
            message: "Congratulations! You've mastered the art of prompt engineering!"
        };
    }

    // Get current progress
    function getProgress() {
        return {
            currentLevel: currentLevel,
            totalLevels: shuffledLevels.length,
            attempts: promptAttempts,
            bestScore: bestScore
        };
    }

    // Public API
    return {
        init: init,
        loadLevel: loadLevel,
        evaluatePrompt: evaluatePrompt,
        getHint: getHint,
        showExample: showExample,
        getRealWorldExamples: getRealWorldExamples,
        getProgress: getProgress,
        levels: levels
    };
})();

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Mission3;
}
