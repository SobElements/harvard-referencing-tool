// ============================================================================
// PRACTICE-HANDLER.JS - Practice Question Management
// ============================================================================
// This file manages the display and checking of practice questions on the
// practice pages. It loads questions from the questions-bank.json file,
// displays them one at a time, checks user answers, and provides feedback.
//
// KEY VARIABLES:
// - currentQuestions: Array of questions being used in the current session
// - currentQuestionIndex: Which question we're on (0 = first, 1 = second, etc)
// - questionsAnswered: Count of how many questions the user has answered
// - questionBank: The loaded JSON data containing all available questions
// - practiceMode: Either 'beginner' or 'intermediate' difficulty level
// ============================================================================

let currentQuestions = [];
let currentQuestionIndex = 0;
let questionsAnswered = 0;
let questionBank = null;
let practiceMode = 'beginner'; // Tracks whether we're in beginner or intermediate mode

// ============================================================================
// SECTION 1: LOADING QUESTIONS
// ============================================================================

// Fetch and load all questions from the JSON file (src/data/questions-bank.json)
// This runs once at the start of each practice session
// Checks localStorage for admin overrides first (set by admin.html)
async function loadQuestions() {
    try {
        // Check localStorage override first (set by admin.html)
        const adminOverride = localStorage.getItem('harvardAdminQuestions');
        if (adminOverride) {
            questionBank = JSON.parse(adminOverride);
            console.log('Questions loaded from admin override (localStorage)');
            return true;
        }
        // Fall back to the static JSON file
        const response = await fetch('../src/data/questions-bank.json');
        if (!response.ok) {
            throw new Error('Failed to load questions-bank.json');
        }
        questionBank = await response.json();
        console.log('Questions loaded successfully:', questionBank);
        return true;
    } catch (error) {
        console.error('Error loading questions:', error);
        return false;
    }
}

// ============================================================================
// SECTION 2: INITIALIZING A PRACTICE SESSION
// ============================================================================

// Initialize practice session (non-randomized for testing)
// Called when user clicks "Start Practice" on a practice page
// Parameters:
//   sourceType: Which source we're practicing (e.g., 'book', 'journal', 'web')
//   distribution: How many questions of each type to include
//   mode: Either 'beginner' or 'intermediate'
async function initializePractice(sourceType, distribution, mode = 'beginner')  {
    practiceMode = mode;
    if (!questionBank) {
        const loaded = await loadQuestions();
        if (!loaded) {
            document.getElementById('questions-container').innerHTML =
                '<p style="color: red; text-align: center; padding: 40px;">Error: Could not load questions.</p>';
            return;
        }
    }

    // Get the questions based on what the user selected
    currentQuestions = getRandomQuestions(sourceType, distribution);
    currentQuestionIndex = 0;
    questionsAnswered = 0;
    // Display the first question
    displayQuestion(currentQuestions[currentQuestionIndex]);
    // Update the progress bar to show 1 of X questions
    updateProgressBar();
}

// Get questions for a specific source type
// Currently returns questions in original order (not randomized)
// Future: This function name suggests randomization, but it's disabled for testing
function getRandomQuestions(sourceType, distribution) {
    const selectedQuestions = [];
    const source = questionBank[sourceType];

    // Loop through each category (e.g., 'in-text-quotes', 'reference-list')
    // and add the requested number of questions for that category
    for (const [category, count] of Object.entries(distribution)) {
        const categoryQuestions = source[category];
        // Take the first 'count' questions from this category
        const selected = categoryQuestions.slice(0, count);
        selectedQuestions.push(...selected);
    }

    // Return questions in the order they appear in the JSON file
    return selectedQuestions;
}

// ============================================================================
// SECTION 3: DISPLAYING QUESTIONS
// ============================================================================

// Display a question to the user
// Takes a question object and renders it as HTML in the questions-container
// Has two modes:
//   - BEGINNER: Shows individual input fields (author, title, year, etc)
//   - INTERMEDIATE: Shows a single rich text box to type the full reference
function displayQuestion(question) {
    const container = document.getElementById('questions-container');

    const sourceLabels = {
        'book': '📚 Books',
        'journal': '📄 Academic Journals',
        'web': '🌐 Websites',
        'ref': '📋 Reference Lists',
        'news': '📰 Newspapers',
        'report': '📊 Reports and Government Documents',
        'media': '🎬 Media',
        'personal': '💬 Personal Communications',
        'ai': '🤖 AI Sources'
    };

    let sourceLabel = '';
    const id = question.id || '';
    for (const [prefix, label] of Object.entries(sourceLabels)) {
        if (id.startsWith(prefix)) {
            sourceLabel = label;
            break;
        }
    }

    // INTERMEDIATE MODE - show single rich text box instead of fields
    if (practiceMode === 'intermediate' && !question.options && !question.fields.includes('position1')) {
        let questionHTML = `
    <div class="question-container" id="question-${currentQuestionIndex}">
        ${sourceLabel ? `<p style="font-size: 0.85rem; font-weight: bold; color: #667eea; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em;">${sourceLabel}</p>` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: #2c3e50;">Question ${currentQuestionIndex + 1} of ${currentQuestions.length}</h3>
                    <span style="color: #7f8c8d; font-size: 0.9rem;">${getCategoryLabel(question.id)}</span>
                </div>

                <p style="margin-bottom: 20px; font-size: 1.1rem;"><strong>Scenario:</strong> ${question.scenario}</p>
        `;

        if (question.source) {
            questionHTML += `
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <p style="margin-bottom: 10px;"><strong>Source Information:</strong></p>
                    <ul style="list-style: none; padding-left: 0;">
                        ${question.source.author ? `<li><strong>Author:</strong> ${question.source.author}</li>` : ''}
                        ${question.source.chapter ? `<li><strong>Chapter:</strong> ${question.source.chapter}</li>` : ''}
                        ${question.source.editor ? `<li><strong>Editor:</strong> ${question.source.editor}</li>` : ''}
                        ${question.source.title ? `<li><strong>Title:</strong> ${question.source.title}</li>` : ''}
                        ${question.source.edition ? `<li><strong>Edition:</strong> ${question.source.edition}</li>` : ''}
                        ${question.source.website ? `<li><strong>Website:</strong> ${question.source.website}</li>` : ''}
                        ${question.source.journal ? `<li><strong>Journal:</strong> ${question.source.journal}</li>` : ''}
                        ${question.source.year ? `<li><strong>Year:</strong> ${question.source.year}</li>` : ''}
                        ${question.source.month ? `<li><strong>Date:</strong> ${question.source.month} ${question.source.day}, ${question.source.year}</li>` : ''}
                        ${question.source.volume ? `<li><strong>Volume:</strong> ${question.source.volume}${question.source.issue ? `(${question.source.issue})` : ''}</li>` : ''}
                        ${question.source.pages ? `<li><strong>Pages:</strong> ${question.source.pages}</li>` : ''}
                        ${question.source.page ? `<li><strong>Page:</strong> ${question.source.page}</li>` : ''}
                        ${question.source.publisher ? `<li><strong>Publisher:</strong> ${question.source.publisher}</li>` : ''}
                        ${question.source.url ? `<li><strong>URL:</strong> ${question.source.url}</li>` : ''}
                        ${question.source.doi ? `<li><strong>DOI:</strong> ${question.source.doi}</li>` : ''}
                        ${question.source.authors ? `<li><strong>Authors:</strong> ${question.source.authors}</li>` : ''}
                    </ul>
                </div>
            `;
        }

        questionHTML += `
            <div style="margin-bottom: 25px;">
                <p style="margin-bottom: 15px;"><strong>Type the full reference below. Select any text and click <em>I</em> to make it italic.</strong></p>

                <!-- Italic toolbar -->
                <div style="margin-bottom: 8px;">
                    <button 
                        onclick="document.execCommand('italic', false, null); document.getElementById('rich-answer').focus(); this.style.backgroundColor = document.queryCommandState('italic') ? '#e0e0e0' : 'white'; this.style.borderColor = document.queryCommandState('italic') ? '#999' : '#ccc';"
                        style="
                            font-style: italic;
                            font-weight: bold;
                            font-size: 1rem;
                            width: 36px;
                            height: 36px;
                            border: 2px solid #ccc;
                            border-radius: 4px;
                            background: white;
                            cursor: pointer;
                            font-family: Georgia, serif;
                        "
                        title="Italic (select text first, then click)"
                    >I</button>
                </div>

                <!-- Rich text typing area -->
                <div 
                    id="rich-answer"
                    contenteditable="true"
                    style="
                        width: 100%;
                        min-height: 60px;
                        padding: 12px;
                        border: 2px solid #e0e0e0;
                        border-radius: 6px;
                        font-size: 1rem;
                        font-family: inherit;
                        line-height: 1.6;
                        box-sizing: border-box;
                        outline: none;
                    "
                    placeholder="Type your reference here..."
                ></div>
                <p style="margin-top: 8px; color: #7f8c8d; font-size: 0.85rem;">💡 Tip: Type your reference, then select the title and click <em>I</em> to italicise it.</p>
            </div>

            <div style="margin-top: 30px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="section-button" onclick="checkIntermediateAnswer()" style="flex: 1; min-width: 150px;">
                    ✓ Submit Answer
                </button>
                <button class="section-button" id="skip-button" onclick="skipQuestion()" style="flex: 1; min-width: 150px; background: linear-gradient(135deg, #6c757d 0%, #495057 100%);">
                    ⏭️ Skip Question
                </button>
                <button class="section-button" id="show-answer-button" onclick="showIntermediateAnswer()" style="flex: 1; min-width: 150px; background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);">
                    💡 Show Answer
                </button>
                <button class="section-button hidden" id="next-button" onclick="nextQuestion()" style="flex: 1; min-width: 150px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
                    Next Question →
                </button>
            </div>

            <div id="feedback" class="feedback"></div>
            <div id="answer-display" class="hidden" style="margin-top: 20px; padding: 20px; background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px;">
                <h4 style="margin-top: 0; color: #856404;">📝 Correct Answer:</h4>
                <div id="answer-content" style="font-size: 1rem; line-height: 1.8;"></div>
            </div>
        </div>
        `;

        container.innerHTML = questionHTML;
        return; // Stop here - don't run the beginner field code below
    }
    
    let questionHTML = `
    <div class="question-container" id="question-${currentQuestionIndex}">
        ${sourceLabel ? `<p style="font-size: 0.85rem; font-weight: bold; color: #667eea; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em;">${sourceLabel}</p>` : ''}
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: #2c3e50;">Question ${currentQuestionIndex + 1} of ${currentQuestions.length}</h3>
                <span style="color: #7f8c8d; font-size: 0.9rem;">${getCategoryLabel(question.id)}</span>
            </div>
            
            <p style="margin-bottom: 20px; font-size: 1.1rem;"><strong>Scenario:</strong> ${question.scenario}</p>
    `;
    
    if (question.source) {
        questionHTML += `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="margin-bottom: 10px;"><strong>Source Information:</strong></p>
                <ul style="list-style: none; padding-left: 0;">
                    ${question.source.author ? `<li><strong>Author:</strong> ${question.source.author}</li>` : ''}
                    ${question.source.chapter ? `<li><strong>Chapter:</strong> ${question.source.chapter}</li>` : ''}
                    ${question.source.editor ? `<li><strong>Editor:</strong> ${question.source.editor}</li>` : ''}
                    ${question.source.title ? `<li><strong>Title:</strong> ${question.source.title}</li>` : ''}
                    ${question.source.edition ? `<li><strong>Edition:</strong> ${question.source.edition}</li>` : ''}
                    ${question.source.website ? `<li><strong>Website:</strong> ${question.source.website}</li>` : ''}
                    ${question.source.journal ? `<li><strong>Journal:</strong> ${question.source.journal}</li>` : ''}
                    ${question.source.year ? `<li><strong>Year:</strong> ${question.source.year}</li>` : ''}
                    ${question.source.month ? `<li><strong>Date:</strong> ${question.source.month} ${question.source.day}, ${question.source.year}</li>` : ''}
                    ${question.source.volume ? `<li><strong>Volume:</strong> ${question.source.volume}${question.source.issue ? `(${question.source.issue})` : ''}</li>` : ''}
                    ${question.source.pages ? `<li><strong>Pages:</strong> ${question.source.pages}</li>` : ''}
                    ${question.source.page ? `<li><strong>Page:</strong> ${question.source.page}</li>` : ''}
                    ${question.source.publisher ? `<li><strong>Publisher:</strong> ${question.source.publisher}</li>` : ''}
                    ${question.source.url ? `<li><strong>URL:</strong> ${question.source.url}</li>` : ''}
                    ${question.source.doi ? `<li><strong>DOI:</strong> ${question.source.doi}</li>` : ''}
                    ${question.source.authors ? `<li><strong>Authors:</strong> ${question.source.authors}</li>` : ''}
                </ul>
            </div>
        `;
    }
    // Check if this is a multiple choice question
if (question.options) {
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Select your answer:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
    `;
    
    // Split options by letter (A), B), C), D))
    const optionsList = question.options.split(/(?=[A-D]\))/);
    
    optionsList.forEach((option, index) => {
        if (option.trim()) {
            const optionLetter = option.trim().charAt(0);
            const optionText = option.trim().substring(3); // Remove "A) " part
            
            questionHTML += `
                <label style="display: flex; align-items: center; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                    <input type="radio" name="answer" value="${optionLetter}" id="field-answer-${optionLetter}" style="margin-right: 10px; cursor: pointer;">
                    <span><strong>${optionLetter})</strong> ${optionText}</span>
                </label>
            `;
        }
    });
    
    questionHTML += `
            </div>
        </div>
    `;
} else if (question.fields.includes('position1')) {
    
        questionHTML += `
            <div style="margin-bottom: 25px;">
                <p style="margin-bottom: 15px;"><strong>Select the correct source for each position:</strong></p>
                <div style="display: flex; flex-direction: column; gap: 15px;">
        `;
        
        question.fields.forEach((field, index) => {
            const positionNumber = index + 1;
            questionHTML += `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="min-width: 100px; font-weight: bold;">Position ${positionNumber}:</span>
                    <select id="field-${field}" style="flex: 1; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; background-color: white;">
                        <option value="">-- Select a source --</option>
            `;
            
            question.sources.forEach((source, sourceIndex) => {
                questionHTML += `<option value="${source}">Source ${sourceIndex + 1}: ${source}</option>`;
            });
            
            questionHTML += `
                    </select>
                </div>
            `;
        });
        
        questionHTML += `
                </div>
                ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
            </div>
        `;
    } else if (question.fields.includes('correctedReference')) {
        questionHTML += `
            <div style="margin-bottom: 25px;">
                <p style="margin-bottom: 15px;"><strong>Current (incorrect):</strong></p>
                <p style="padding: 15px; background-color: #fff3cd; border-radius: 6px; font-style: italic; margin-bottom: 20px;">${question.incorrectReference}</p>
                <p style="margin-bottom: 15px;"><strong>Type the corrected reference:</strong></p>
                <input type="text" id="field-correctedReference" placeholder="Corrected reference" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
            </div>
        `;
    } else if (question.fields.includes('bookEntry') || question.fields.includes('journalEntry') || question.fields.includes('websiteEntry')) {
        questionHTML += `
            <div style="margin-bottom: 25px;">
                <p style="margin-bottom: 15px;"><strong>Sources to reference:</strong></p>
                <div style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 20px;">
                    ${question.sources.book ? `<p style="margin-bottom: 10px;">• ${question.sources.book}</p>` : ''}
                    ${question.sources.journal ? `<p style="margin-bottom: 10px;">• ${question.sources.journal}</p>` : ''}
                    ${question.sources.website ? `<p style="margin-bottom: 10px;">• ${question.sources.website}</p>` : ''}
                </div>
                <p style="margin-bottom: 15px;"><strong>Complete the reference list entries:</strong></p>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${question.fields.includes('bookEntry') ? `
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Book entry:</label>
                        <input type="text" id="field-bookEntry" placeholder="Book reference" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    </div>
                    ` : ''}
                    ${question.fields.includes('journalEntry') ? `
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Journal entry:</label>
                        <input type="text" id="field-journalEntry" placeholder="Journal reference" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    </div>
                    ` : ''}
                    ${question.fields.includes('websiteEntry') ? `
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Website entry:</label>
                        <input type="text" id="field-websiteEntry" placeholder="Website reference" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    } else if (question.fields.includes('quote')) {
    // Check if this is a multiple authors quote
    const isMultipleAuthors = question.fields.includes('authors');
    
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the in-text citation:</strong></p>
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px; font-size: 1.1rem;">
                <input type="text" id="field-quote" placeholder="Quote" style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;" disabled value="${question.quote}">
                <span>(</span>
    `;
    
    if (isMultipleAuthors) {
        // Multiple authors format: (Author1 and Author2, Year, p. X)
        questionHTML += `
                <input type="text" id="field-authors" placeholder="Author1 and Author2," style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                <input type="text" id="field-year" placeholder="Year," style="width: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                <input type="text" id="field-page" placeholder="p. X" style="width: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
        `;
    } else {
        // Single author format: (Author, Year, p. X)
        questionHTML += `
                <input type="text" id="field-author" placeholder="Author" style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                <span>,</span>
                <input type="text" id="field-year" placeholder="Year" style="width: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                <span>, p.</span>
                <input type="text" id="field-page" placeholder="Page" style="width: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
        `;
    }
    
    questionHTML += `
                <span>).</span>
            </div>
        </div>
    `;
        } else if (question.fields.includes('doi') && question.fields.includes('journal')) {
    // Journal articles with DOI
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-author" placeholder="Author (Surname, I.)" style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)." style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="Article title in sentence case." style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-journal" placeholder="Journal Name," style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-volume" placeholder="Volume(Issue)," style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-pages" placeholder="Pages." style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-doi" placeholder="doi:..." style="flex: 1; min-width: 400px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
    } else if (question.fields.includes('journal')) {
        questionHTML += `
            <div style="margin-bottom: 25px;">
                <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <input type="text" id="field-author" placeholder="Author (Surname, I.)" style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                        <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <input type="text" id="field-title" placeholder="Article title in sentence case with single quotation marks, followed by a comma." style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <input type="text" id="field-journal" placeholder="Journal Name," style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <input type="text" id="field-volume" placeholder="Volume(Issue)," style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                        <input type="text" id="field-pages" placeholder="Pages." style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    </div>
                </div>
                ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
            </div>
        `;
    } else if (question.fields.includes('website')) {
        questionHTML += `
            <div style="margin-bottom: 25px;">
                <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        ${question.fields.includes('author') ? 
                            `<input type="text" id="field-author" placeholder="Author or Organisation." style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">` : 
                            ''}
                        ${question.fields.includes('title') ? 
                            `<input type="text" id="field-title" placeholder="Title of webpage." style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">` : 
                            ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <input type="text" id="field-year" placeholder="(Year, Month Day)." style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <input type="text" id="field-website" placeholder="Website Name." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <input type="text" id="field-url" placeholder="https://..." style="flex: 1; min-width: 400px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    </div>
                </div>
                ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
            </div>
        `;
        } else if (question.fields.includes('chapter') && question.fields.includes('editor')) {
    // Chapters in edited books section
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-author" placeholder="Author (Surname, I.)" style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-chapter" placeholder="Chapter title." style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-editor" placeholder="In Editor (Ed.)," style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="Book title (italicised)" style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-publisher" placeholder="Publisher." style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-pages" placeholder="(pp. x-y)." style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
        } else if (question.fields.includes('editor') && question.fields.includes('title') && question.fields.includes('publisher')) {
    // Edited books section
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-editor" placeholder="Editor (Surname, I. (Ed.).)" style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="Title in lowercase (italicised)" style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-publisher" placeholder="Publisher." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
    } else if (question.fields.includes('edition') && question.fields.includes('title') && question.fields.includes('publisher')) {
    // Books with multiple editions
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-author" placeholder="Author (Surname, I.)" style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="Title in lowercase (italicised)." style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-edition" placeholder="Edition (e.g., 3rd ed.)" style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-publisher" placeholder="Publisher." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
    } else if (question.fields.includes('title') && question.fields.includes('publisher')) {
    // Check if this is a multiple authors question or no author question
    const isMultipleAuthors = question.id.includes('_multi_');
    const hasAuthor = question.fields.includes('author');
    const authorPlaceholder = isMultipleAuthors 
        ? "Authors (Surname, I. & Surname, I.)" 
        : "Author (Surname, I.)";
    
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
    `;
    
    // If NO author, show: Title, Year, Publisher
    if (!hasAuthor) {
        questionHTML += `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="Title in lowercase (italicised)" style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-publisher" placeholder="Publisher." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
        `;
    } else {
        // If HAS author, show: Author, Year, Title, Publisher
        questionHTML += `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-author" placeholder="${authorPlaceholder}" style="width: ${isMultipleAuthors ? '350px' : '200px'}; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="Title in lowercase (italicised)" style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-publisher" placeholder="Publisher." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
        `;
    }
    
    questionHTML += `
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
    } else {
        questionHTML += `
            <div style="margin-bottom: 25px;">
                <p style="margin-bottom: 15px;"><strong>Complete the in-text citation:</strong></p>
                <div style="display: flex; align-items: center; gap: 10px; font-size: 1.1rem;">
                    <span>(</span>
                    <input type="text" id="field-author" placeholder="Author" style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <span>,</span>
                    <input type="text" id="field-year" placeholder="Year" style="width: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <span>)</span>
                </div>
            </div>
        `;
    }
    
   questionHTML += `
    <div style="margin-top: 30px; display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="section-button" onclick="checkAnswer()" style="flex: 1; min-width: 150px;">
            ✓ Submit Answer
        </button>
        <button class="section-button" id="skip-button" onclick="skipQuestion()" style="flex: 1; min-width: 150px; background: linear-gradient(135deg, #6c757d 0%, #495057 100%);">
            ⏭️ Skip Question
        </button>
        <button class="section-button" id="show-answer-button" onclick="showAnswer()" style="flex: 1; min-width: 150px; background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);">
            💡 Show Answer
        </button>
        <button class="section-button hidden" id="next-button" onclick="nextQuestion()" style="flex: 1; min-width: 150px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
            Next Question →
        </button>
    </div>
    
    <div id="feedback" class="feedback"></div>
    <div id="answer-display" class="hidden" style="margin-top: 20px; padding: 20px; background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px;">
        <h4 style="margin-top: 0; color: #856404;">📝 Correct Answer:</h4>
        <div id="answer-content" style="font-family: monospace; font-size: 1rem; line-height: 1.8;"></div>
    </div>
</div>
`;
    
    container.innerHTML = questionHTML;
}

// ============================================================================
// SECTION 4: CHECKING ANSWERS & PROVIDING FEEDBACK
// ============================================================================

// Generate helpful tips to guide the user toward the correct answer
// Used in beginner mode where users fill in individual fields
function getTipsForField(field, userAnswer, correctAnswer) {
    const tips = [];
    const question = currentQuestions[currentQuestionIndex];
    const isMultipleAuthors = question.id.includes('_multi_');
    
    if (field.includes('position')) {
        tips.push('Alphabetical order is by author surname (A-Z)');
        tips.push('If surnames are the same, order by first initial');
        return tips;
    }
    
    if (field === 'author') {
        if (isMultipleAuthors) {
            // Tips specific to multiple authors
            if (!userAnswer.includes(',')) {
                tips.push('Author format: Surname, I. & Surname, I.');
            }
            if (!userAnswer.includes('&')) {
                tips.push('Use ampersand (&) to separate authors, not "and"');
            }
            // Check if authors might be in wrong order
            if (userAnswer.includes('&') && userAnswer !== correctAnswer) {
                tips.push('Ensure authors are listed in alphabetical order by surname');
            }
        } else {
            // Tips for single author
            if (!userAnswer.includes(',')) {
                tips.push('Author format: Surname, I.');
            }
        }
    }
    
    if (field === 'year' && !userAnswer.includes('(')) {
        tips.push('Year needs brackets: (2020)');
    }
    
    if (field === 'title') {
        if (!userAnswer.includes('.')) {
            tips.push('Add full stop at end');
        }
        // Check if title starts with uppercase but has wrong capitalisation
        if (userAnswer !== correctAnswer && userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
            tips.push('Title should be in sentence case (only first word and proper nouns capitalised)');
            tips.push(`Correct: "${correctAnswer}"`);
        }
    }
    if (field === 'editor') {
        if (!userAnswer.includes(',')) {
            tips.push('Editor format: Surname, I. (Ed.).');
        }
        if (!userAnswer.includes('(Ed.)')) {
            tips.push('Don\'t forget to add (Ed.). at the end');
        }
    }
    if (field === 'chapter') {
        if (!userAnswer.includes('.')) {
            tips.push('Chapter title needs a full stop at the end');
        }
        if (userAnswer !== correctAnswer && userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
            tips.push('Chapter title should be in sentence case');
        }
    }
    if (field === 'edition') {
        if (!userAnswer.includes('ed.')) {
            tips.push('Edition format: 3rd ed. (use "ed." not "edition")');
        }
        if (userAnswer.includes('edition')) {
            tips.push('Use abbreviated form: "ed." not "edition"');
        }
    }
    
    if (field === 'pages') {
        if (!userAnswer.includes('pp.')) {
            tips.push('Pages format: (pp. x-y).');
        }
        if (!userAnswer.includes('(') || !userAnswer.includes(')')) {
            tips.push('Pages need brackets: (pp. 45-68).');
        }
    }
    if (field === 'doi') {
        if (!userAnswer.includes('https://doi.org/')) {
            tips.push('DOI format: https://doi.org/10.xxxx/xxxxx');
        }
        if (!userAnswer.startsWith('https://')) {
            tips.push('DOI must start with https://doi.org/');
        }
    }
    
    if (field === 'volume') {
        if (question.fields.includes('doi') || question.fields.includes('journal')) {
            if (!userAnswer.includes('(') && !userAnswer.includes(')')) {
                tips.push('Volume format: Volume(Issue), - e.g., 34(2),');
            }
        }
    }

    if (field === 'authors') {
        if (!userAnswer.includes('and')) {
            tips.push('Format for two authors: Surname1 and Surname2,');
        }
        if (userAnswer.includes('&')) {
            tips.push('Use "and" not "&" in citations (ampersand is only for reference lists)');
        }
        if (!userAnswer.includes(',')) {
            tips.push('Don\'t forget the comma after the authors');
        }
    }
    
    return tips;
}
function normaliseQuotes(str) {
    return str
        .replace(/[\u201C\u201D]/g, '"')  // curly double quotes → straight
        .replace(/[\u2018\u2019]/g, "'")  // curly single quotes → straight
        .trim();
}

function checkIntermediateAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    const richBox = document.getElementById('rich-answer');
    const feedbackDiv = document.getElementById('feedback');

    const studentPlainText = normaliseQuotes(richBox.innerText).replace(/\.$/, '');
const correctPlainText = normaliseQuotes(question.correctAnswerFull || '').replace(/\.$/, '');

//debugging logs to check the values being compared
console.log('Student:', JSON.stringify(studentPlainText));
console.log('Correct:', JSON.stringify(correctPlainText));

    if (!correctPlainText) {
        feedbackDiv.className = 'feedback show incorrect';
        feedbackDiv.innerHTML = '<strong>⚠️ No correct answer available for this question in intermediate mode yet.</strong>';
        return;
    }

    if (studentPlainText !== correctPlainText) {
        feedbackDiv.classList.add('show');
        feedbackDiv.className = 'feedback show incorrect';
        feedbackDiv.innerHTML = `
            <strong>✗ Not quite.</strong> Check your punctuation, spacing, and formatting carefully.
            <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                💡 Make sure you have the right punctuation in the right places — every comma, full stop, and bracket matters.
            </div>
        `;
        return;
    }

    // Text is correct — now check italics if any are required
    const requiredItalicFields = question.italicFields || [];

    if (requiredItalicFields.length === 0) {
        markIntermediateCorrect(richBox, feedbackDiv);
        return;
    }

    // Check whether the correct words have been italicised
    const studentHTML = richBox.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = studentHTML;
    const italicElements = tempDiv.querySelectorAll('em, i');
    const studentItalicText = Array.from(italicElements).map(el => el.innerText).join(' ').trim();

    const expectedItalicParts = requiredItalicFields.map(field => {
        const val = question.correctAnswers[field] || '';
        return val.replace(/[.,]$/, '').trim();
    });

    const allItalicsCorrect = expectedItalicParts.every(part =>
        studentItalicText.toLowerCase().includes(part.toLowerCase())
    );

    if (allItalicsCorrect) {
        markIntermediateCorrect(richBox, feedbackDiv);
    } else {
        feedbackDiv.classList.add('show');
        feedbackDiv.className = 'feedback show incorrect';
        feedbackDiv.innerHTML = `
            <strong>Almost there!</strong> Your text is correct but check your italics.
            <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                💡 Select the title and click the <em>I</em> button to italicise it.
            </div>
        `;
    }
}

function markIntermediateCorrect(richBox, feedbackDiv) {
    feedbackDiv.className = 'feedback show correct';
    feedbackDiv.innerHTML = '<strong>✓ Correct!</strong> Click "Next Question".';
    richBox.contentEditable = false;
    richBox.style.backgroundColor = '#d4edda';
    richBox.style.borderColor = '#28a745';
    document.getElementById('next-button').classList.remove('hidden');
    document.getElementById('skip-button').classList.add('hidden');
    document.getElementById('show-answer-button').classList.add('hidden');
}

function showIntermediateAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    const answerDisplay = document.getElementById('answer-display');
    const answerContent = document.getElementById('answer-content');
    const richBox = document.getElementById('rich-answer');

    // Build the answer with italic fields wrapped in <em> tags
    let answerHTML = question.correctAnswerFull || '';

    // Wrap italic fields in <em> tags for display
    const italicFields = question.italicFields || [];
    italicFields.forEach(field => {
        const val = question.correctAnswers[field] || '';
        const plainVal = val.replace(/[.,]$/, '').trim();
        if (plainVal) {
            answerHTML = answerHTML.replace(plainVal, `<em>${plainVal}</em>`);
        }
    });

    answerContent.innerHTML = `<p>${answerHTML}</p>`;
    answerDisplay.classList.remove('hidden');

    richBox.innerHTML = answerHTML;
    richBox.contentEditable = false;
    richBox.style.backgroundColor = '#fff3cd';
    richBox.style.borderColor = '#ffc107';

    document.getElementById('show-answer-button').disabled = true;
    document.getElementById('show-answer-button').style.opacity = '0.5';
    document.getElementById('next-button').classList.remove('hidden');
    document.getElementById('skip-button').classList.add('hidden');
}

// Check the user's answer in BEGINNER mode (individual fields)
// Compares each field (author, title, year, etc) against the correct answer
// Shows tips for incorrect fields and marks the question if all fields are correct
function checkAnswer() {
    const question = currentQuestions[currentQuestionIndex];
     if (question.options) {
        const selectedRadio = document.querySelector('input[name="answer"]:checked');
        
        if (!selectedRadio) {
            const feedbackDiv = document.getElementById('feedback');
            feedbackDiv.classList.add('show');
            feedbackDiv.className = 'feedback show incorrect';
            feedbackDiv.innerHTML = '<strong>⚠️ Please select an answer</strong>';
            return;
        }
        
        const userAnswer = selectedRadio.value;
        const correctAnswer = question.correctAnswers.answer;
        const feedbackDiv = document.getElementById('feedback');
        feedbackDiv.classList.add('show');
        
        // Disable all radio buttons
        document.querySelectorAll('input[name="answer"]').forEach(radio => {
            radio.disabled = true;
            const label = radio.closest('label');
            
            if (radio.value === correctAnswer) {
                label.style.borderColor = '#28a745';
                label.style.backgroundColor = '#d4edda';
            } else if (radio.checked && radio.value !== correctAnswer) {
                label.style.borderColor = '#dc3545';
                label.style.backgroundColor = '#f8d7da';
            }
        });
        
        if (userAnswer === correctAnswer) {
            feedbackDiv.className = 'feedback show correct';
            feedbackDiv.innerHTML = '<strong>✓ Correct!</strong> Click "Next Question".';
            document.getElementById('next-button').classList.remove('hidden');
            document.getElementById('skip-button').classList.add('hidden');
            document.getElementById('show-answer-button').classList.add('hidden');
            event.target.disabled = true;
        } else {
            feedbackDiv.className = 'feedback show incorrect';
            feedbackDiv.innerHTML = '<strong>✗ Incorrect.</strong> Try again or show the answer.';
        }
        
        return; // Exit function - don't run the fill-in-the-blank code
    }
    let allCorrect = true;
    let allTips = [];
    
   for (const field of question.fields) {
    if (field === 'quote') continue;
    
    const input = document.getElementById(`field-${field}`);
    const userAnswer = input.tagName === 'SELECT' ? input.value.trim() : input.value.trim();
    const correctAnswer = question.correctAnswers[field];
    
    // Case-sensitive check for title fields, case-insensitive for others
    const isCorrect = field === 'title' 
        ? userAnswer === correctAnswer  // Exact match for titles (case-sensitive)
        : userAnswer.toLowerCase() === correctAnswer.toLowerCase();  // Case-insensitive for others
    
    if (isCorrect) {
        input.style.borderColor = '#28a745';
        input.style.backgroundColor = '#d4edda';
        input.disabled = true;
        } else {
            input.style.borderColor = '#dc3545';
            input.style.backgroundColor = '#f8d7da';
            allCorrect = false;
            allTips.push(...getTipsForField(field, userAnswer, correctAnswer));
            input.value = '';
        }
    }
    
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.classList.add('show');
    
    if (allCorrect) {
    feedbackDiv.className = 'feedback show correct';
    feedbackDiv.innerHTML = '<strong>✓ Correct!</strong> Click "Next Question".';
    document.getElementById('next-button').classList.remove('hidden');
    document.getElementById('skip-button').classList.add('hidden');
    document.getElementById('show-answer-button').classList.add('hidden'); // Add this line
    event.target.disabled = true;
} else {
        feedbackDiv.className = 'feedback show incorrect';
        let html = '<strong>✗ Try again.</strong>';
        if (allTips.length > 0) {
            html += '<div style="margin-top: 15px; padding: 12px; background-color: #fff3cd;"><strong>💡 Tips:</strong><ul style="padding-left: 20px;">';
            [...new Set(allTips)].forEach(tip => html += `<li>${tip}</li>`);
            html += '</ul></div>';
        }
        feedbackDiv.innerHTML = html;
    }
}

// Move to the next question in the practice session
// Called after user submits an answer or clicks "Next Question"
function nextQuestion() {
    questionsAnswered++;
    currentQuestionIndex++;

    if (currentQuestionIndex < currentQuestions.length) {
        // Display the next question
        displayQuestion(currentQuestions[currentQuestionIndex]);
        updateProgressBar();
    } else {
        // If no more questions, show final results
        showResults();
    }
}

// ============================================================================
// SECTION 5: NAVIGATION & SKIPPING
// ============================================================================

// Skip the current question and move to the next one
// Called when user clicks "Skip Question" button
function skipQuestion() {
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.className = 'feedback show';
    feedbackDiv.style.backgroundColor = '#e2e3e5';
    feedbackDiv.style.borderColor = '#6c757d';
    feedbackDiv.innerHTML = '<strong>⏭️ Question skipped.</strong> Moving to next question...';

    // Hide skip button, show next button
    document.getElementById('skip-button').classList.add('hidden');
    document.getElementById('next-button').classList.remove('hidden');

    // Disable all inputs so user can't change their answer
    const question = currentQuestions[currentQuestionIndex];
    question.fields.forEach(field => {
        const input = document.getElementById(`field-${field}`);
        if (input) {
            input.disabled = true;
            input.style.backgroundColor = '#e9ecef';
        }
    });

    // Disable submit button
    event.target.disabled = true;
}

// Show the correct answer to the user
// Called when user clicks "Show Answer" button
function showAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    const answerDisplay = document.getElementById('answer-display');
    const answerContent = document.getElementById('answer-content');

    // Handle multiple choice questions
     if (question.options) {
        const correctAnswer = question.correctAnswers.answer;
        
        // Highlight correct answer
        document.querySelectorAll('input[name="answer"]').forEach(radio => {
            radio.disabled = true;
            const label = radio.closest('label');
            
            if (radio.value === correctAnswer) {
                label.style.borderColor = '#28a745';
                label.style.backgroundColor = '#d4edda';
            }
        });
        
        // Show which option is correct
        const optionsList = question.options.split(/(?=[A-D]\))/);
        const correctOption = optionsList.find(opt => opt.trim().startsWith(correctAnswer + ')'));
        
        answerContent.innerHTML = `<div style="background: white; padding: 15px; border-radius: 5px;">
            <p><strong>Correct Answer:</strong></p>
            <p style="color: #28a745; font-weight: bold;">${correctOption.trim()}</p>
        </div>`;
        
        answerDisplay.classList.remove('hidden');
        event.target.disabled = true;
        event.target.style.opacity = '0.5';
        document.getElementById('next-button').classList.remove('hidden');
        document.getElementById('skip-button').classList.add('hidden');
        
        return; // Exit function
    }
    
    // Build the correct answer string based on the fields
    let correctAnswerHTML = '<div style="background: white; padding: 15px; border-radius: 5px;">';
    
    // Handle different question types
    if (question.fields.includes('position1')) {
        // Alphabetical ordering questions
        correctAnswerHTML += '<p><strong>Correct order:</strong></p>';
        question.fields.forEach((field, index) => {
            correctAnswerHTML += `<p>${index + 1}. ${question.correctAnswers[field]}</p>`;
        });
    } else if (question.fields.includes('correctedReference')) {
        // Correction questions
        correctAnswerHTML += `<p>${question.correctAnswers.correctedReference}</p>`;
    } else if (question.fields.includes('bookEntry') || question.fields.includes('journalEntry') || question.fields.includes('websiteEntry')) {
        // Mixed sources questions
        if (question.correctAnswers.bookEntry) {
            correctAnswerHTML += `<p><strong>Book:</strong> ${question.correctAnswers.bookEntry}</p>`;
        }
        if (question.correctAnswers.journalEntry) {
            correctAnswerHTML += `<p><strong>Journal:</strong> ${question.correctAnswers.journalEntry}</p>`;
        }
        if (question.correctAnswers.websiteEntry) {
            correctAnswerHTML += `<p><strong>Website:</strong> ${question.correctAnswers.websiteEntry}</p>`;
        }
    }  else if (question.fields.includes('quote')) {
        // Use correctAnswerFull if available, otherwise fall back to manual build
        if (question.correctAnswerFull) {
            correctAnswerHTML += `<p>${question.correctAnswerFull}</p>`;
        } else {
            let quoteAnswer = question.correctAnswers.quote || `"${question.quote}"`;
            let authorPart = '';
            let yearPart = '';
            let pagePart = '';
            
            if (question.correctAnswers.author) {
                authorPart = question.correctAnswers.author;
            } else if (question.correctAnswers.authors) {
                authorPart = question.correctAnswers.authors;
            }
            
            if (question.correctAnswers.year) {
                yearPart = question.correctAnswers.year;
            }
            
            if (question.correctAnswers.page) {
                pagePart = question.correctAnswers.page;
            }
            
            correctAnswerHTML += `<p>${quoteAnswer} (${authorPart} ${yearPart} ${pagePart}).</p>`;
        }
    }  else {
        // Use correctAnswerFull if available, otherwise fall back to joining fields
        if (question.correctAnswerFull) {
            correctAnswerHTML += `<p>${question.correctAnswerFull}</p>`;
        } else {
            const parts = [];
            question.fields.forEach(field => {
                if (field !== 'quote' && question.correctAnswers[field]) {
                    parts.push(question.correctAnswers[field]);
                }
            });
            correctAnswerHTML += `<p>${parts.join(' ')}</p>`;
        }
    }
    
    correctAnswerHTML += '</div>';
    answerContent.innerHTML = correctAnswerHTML;
    
    // Show the answer display
    answerDisplay.classList.remove('hidden');
    
    // Disable submit button and show answer button
    event.target.disabled = true;
    event.target.style.opacity = '0.5';
    
    // Show next button
    document.getElementById('next-button').classList.remove('hidden');
    
    // Hide skip button
    document.getElementById('skip-button').classList.add('hidden');
    
    // Fill in all fields with correct answers and disable them
    question.fields.forEach(field => {
        const input = document.getElementById(`field-${field}`);
        if (input && field !== 'quote') {
            input.value = question.correctAnswers[field];
            input.style.borderColor = '#ffc107';
            input.style.backgroundColor = '#fff3cd';
            input.disabled = true;
        }
    });
}

// ============================================================================
// SECTION 6: PROGRESS & RESULTS
// ============================================================================

// Update the progress bar at the top of the page
// Shows how many questions have been answered (e.g., 3 of 10)
function updateProgressBar() {
    const progress = (questionsAnswered / currentQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
}

// Show the final results page when all questions are completed
// Hides the question container and shows the results container
function showResults() {
    document.getElementById('questions-container').classList.add('hidden');
    document.getElementById('results-container').classList.remove('hidden');
    document.getElementById('progress-fill').style.width = '100%';
}

// Helper: Convert a question ID into a human-readable category name
// e.g., 'book_format_1' → 'Formatting'
function getCategoryLabel(questionId) {
    if (questionId.includes('_order_')) return 'Alphabetical Ordering';
    if (questionId.includes('_format_')) return 'Formatting';
    if (questionId.includes('_cap_')) return 'Capitalisation';
    if (questionId.includes('_mixed_')) return 'Mixed Sources';
    if (questionId.includes('_dq_')) return 'Direct Quote';
    if (questionId.includes('_para_')) return 'Paraphrasing';
    if (questionId.includes('_ref_')) return 'Reference List';
    return '';
}