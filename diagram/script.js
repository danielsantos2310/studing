document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const ideaInput = document.getElementById('idea-input');
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const clearBtn = document.getElementById('clear-btn');
    const diagramContainer = document.getElementById('diagram-container');
    const savedIdeasList = document.getElementById('saved-ideas-list');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const typingIndicator = document.getElementById('typing-indicator');
    const modelSelect = document.getElementById('model-select');

    // Configuration
    const DEBOUNCE_DELAY = 1500; // 1.5 seconds
    const MIN_IDEA_LENGTH = 10; // Minimum characters to process
    
    // State
    let savedIdeas = JSON.parse(localStorage.getItem('savedIdeas')) || [];
    let apiKey = localStorage.getItem('openai-api-key') || '';
    let debounceTimer = null;
    let isProcessing = false;

    // Initialize
    apiKeyInput.value = apiKey;
    renderSavedIdeas();
    
    // Event Listeners
    ideaInput.addEventListener('input', handleIdeaInput);
    generateBtn.addEventListener('click', generateDiagram);
    saveBtn.addEventListener('click', saveIdea);
    clearBtn.addEventListener('click', clearAll);
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    
    // Handle real-time input with debounce
    function handleIdeaInput() {
        clearTimeout(debounceTimer);
        
        if (ideaInput.value.trim().length >= MIN_IDEA_LENGTH) {
            typingIndicator.classList.add('visible');
            debounceTimer = setTimeout(() => {
                generateDiagram();
            }, DEBOUNCE_DELAY);
        } else {
            typingIndicator.classList.remove('visible');
            showEmptyDiagramState();
        }
    }
    
    // Generate diagram using AI
    async function generateDiagram() {
        const ideaText = ideaInput.value.trim();
        
        if (!ideaText) {
            showEmptyDiagramState();
            return;
        }
        
        if (!apiKey) {
            showError('Please enter your OpenAI API key first');
            return;
        }
        
        if (isProcessing) return;
        isProcessing = true;
        
        try {
            showLoadingState();
            
            const model = modelSelect.value;
            const steps = await getAIResponse(ideaText, model);
            
            if (steps && steps.length > 0) {
                renderDiagram(steps);
            } else {
                showError('Could not generate a diagram for this idea. Try being more specific.');
            }
        } catch (error) {
            console.error('Error generating diagram:', error);
            showError(`API Error: ${error.message}`);
        } finally {
            isProcessing = false;
            typingIndicator.classList.remove('visible');
        }
    }
    
    // Get AI response from OpenAI API
    async function getAIResponse(idea, model) {
        const prompt = `
        Analyze the following idea and break it down into 4-7 key components or steps.
        For each component, provide a title and 1-2 sentence description.
        Return your response as a JSON array of objects with "title" and "description" properties.
        
        Idea: "${idea}"
        
        Example response for "Build a house":
        [
            {
                "title": "Planning & Design",
                "description": "Create architectural plans and obtain necessary permits"
            },
            {
                "title": "Budgeting",
                "description": "Calculate costs and secure financing for the project"
            }
        ]
        `;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to get AI response');
        }
        
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        try {
            return JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse AI response:', content);
            return null;
        }
    }
    
    // Render diagram from steps
    function renderDiagram(steps) {
        diagramContainer.innerHTML = '';
        
        const diagram = document.createElement('div');
        diagram.className = 'flow-diagram';
        
        steps.forEach((step, index) => {
            // Create node
            const node = document.createElement('div');
            node.className = 'node';
            node.innerHTML = `
                <div class="node-header">
                    <i class="fas fa-circle"></i>
                    ${step.title}
                </div>
                <div class="node-content">${step.description}</div>
            `;
            
            // Add to diagram
            diagram.appendChild(node);
            
            // Add connecting line (except for last element)
            if (index < steps.length - 1) {
                const line = document.createElement('div');
                line.className = 'flow-line';
                diagram.appendChild(line);
            }
        });
        
        diagramContainer.appendChild(diagram);
    }
    
    // Save API key to localStorage
    function saveApiKey() {
        apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Please enter your OpenAI API key');
            return;
        }
        
        localStorage.setItem('openai-api-key', apiKey);
        alert('API key saved successfully!');
    }
    
    // Save idea to localStorage
    function saveIdea() {
        const ideaText = ideaInput.value.trim();
        if (!ideaText) {
            alert('Please enter an idea first!');
            return;
        }
        
        // Check if idea already exists
        if (savedIdeas.some(idea => idea.text === ideaText)) {
            alert('This idea is already saved!');
            return;
        }
        
        // Add new idea with timestamp
        const newIdea = {
            text: ideaText,
            date: new Date().toLocaleString(),
            diagram: diagramContainer.innerHTML
        };
        
        savedIdeas.unshift(newIdea);
        localStorage.setItem('savedIdeas', JSON.stringify(savedIdeas));
        renderSavedIdeas();
        
        // Show success message
        alert('Idea saved successfully!');
    }
    
    // Render saved ideas list
    function renderSavedIdeas() {
        if (savedIdeas.length === 0) {
            savedIdeasList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <p>No saved ideas yet</p>
                </div>
            `;
            return;
        }
        
        savedIdeasList.innerHTML = '';
        savedIdeas.forEach((idea, index) => {
            const ideaCard = document.createElement('div');
            ideaCard.className = 'idea-card';
            
            ideaCard.innerHTML = `
                <div class="idea-text">${idea.text}</div>
                <div class="idea-date">${idea.date}</div>
                <button class="delete-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // Add click event to load idea
            ideaCard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    ideaInput.value = idea.text;
                    diagramContainer.innerHTML = idea.diagram;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
            
            // Add delete button event
            const deleteBtn = ideaCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteIdea(index);
            });
            
            savedIdeasList.appendChild(ideaCard);
        });
    }
    
    // Delete an idea
    function deleteIdea(index) {
        if (confirm('Are you sure you want to delete this idea?')) {
            savedIdeas.splice(index, 1);
            localStorage.setItem('savedIdeas', JSON.stringify(savedIdeas));
            renderSavedIdeas();
        }
    }
    
    // Clear all inputs and diagram
    function clearAll() {
        if (confirm('Are you sure you want to clear everything?')) {
            ideaInput.value = '';
            showEmptyDiagramState();
        }
    }
    
    // Show loading state
    function showLoadingState() {
        diagramContainer.innerHTML = `
            <div class="empty-state">
                <div class="spinner"></div>
                <p>Generating diagram...</p>
            </div>
        `;
    }
    
    // Show empty diagram state
    function showEmptyDiagramState() {
        diagramContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-diagram-project"></i>
                <p>Your visual diagram will appear here</p>
                <p class="hint">Start typing to see real-time analysis</p>
            </div>
        `;
    }
    
    // Show error message
    function showError(message) {
        diagramContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                ${message}
            </div>
        `;
    }
});