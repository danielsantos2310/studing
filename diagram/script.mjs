document.addEventListener('DOMContentLoaded', async function() {
    // DOM Elements
    const ideaInput = document.getElementById('idea-input');
    const generateBtn = document.getElementById('generate-btn');
    const diagramContainer = document.getElementById('diagram-container');

    // Initialize Transformers.js
    let pipeline;
    try {
        // Show loading message
        diagramContainer.innerHTML = '<div class="loading">Loading AI model (10MB)...</div>';
        
        // Load the model - no import needed, uses global `transformers` from CDN
        pipeline = await transformers.pipeline(
            'text2text-generation', 
            'Xenova/t5-small'
        );
    } catch (error) {
        console.error("AI failed to load:", error);
        diagramContainer.innerHTML = '<div class="error">Using rule-based fallback</div>';
    }

    // Generate Diagram
    generateBtn.addEventListener('click', async () => {
        const idea = ideaInput.value.trim();
        if (!idea) return;

        diagramContainer.innerHTML = '<div class="loading">Generating...</div>';
        
        let steps;
        if (pipeline) {
            steps = await generateWithAI(idea);
        } else {
            steps = generateWithRules(idea);
        }

        renderDiagram(steps);
    });

    // AI Generation (Transformers.js)
    async function generateWithAI(idea) {
        try {
            const prompt = `Break down "${idea}" into 3 steps:`;
            const output = await pipeline(prompt, {
                max_length: 100,
                num_beams: 2,
            });
            return output[0].generated_text.split('\n')
                          .filter(step => step.trim().length > 0);
        } catch (error) {
            console.error("AI generation failed:", error);
            return generateWithRules(idea);
        }
    }

    // Rule-based fallback
    function generateWithRules(idea) {
        const lowerIdea = idea.toLowerCase();
        if (lowerIdea.includes('build')) {
            return ['1. Planning', '2. Materials', '3. Construction'];
        } else if (lowerIdea.includes('plan')) {
            return ['1. Research', '2. Schedule', '3. Execute'];
        }
        return ['1. Research', '2. Develop', '3. Test'];
    }

    // Render the diagram
    function renderDiagram(steps) {
        diagramContainer.innerHTML = `
            <div class="flow-diagram">
                ${steps.map((step, i) => `
                    <div class="node">
                        <div class="node-number">${i+1}</div>
                        <div class="node-text">${step}</div>
                    </div>
                    ${i < steps.length - 1 ? '<div class="flow-line"></div>' : ''}
                `).join('')}
            </div>
        `;
    }
});