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

// Build the source information HTML block for all source types
// Used by both beginner and intermediate modes to avoid duplication
function buildSourceInfoHTML(source) {
    const rows = [];
    if (source.author)       rows.push(['Author', source.author]);
    if (source.authors)      rows.push(['Authors', source.authors]);
    if (source.organisation) rows.push(['Organisation', source.organisation]);
    if (source.department)   rows.push(['Department', source.department]);
    if (source.creator)      rows.push(['Creator', source.creator]);
    if (source.host)         rows.push(['Host', source.host]);
    if (source.director)     rows.push(['Director', source.director]);
    if (source.person)       rows.push(['Person', source.person]);
    if (source.company)      rows.push(['Company', source.company]);
    if (source.ai)           rows.push(['AI Tool', source.ai]);
    if (source.aiName)       rows.push(['AI Name', source.aiName]);
    if (source.version)      rows.push(['Version', source.version]);
    if (source.chapter)      rows.push(['Chapter', source.chapter]);
    if (source.editor)       rows.push(['Editor', source.editor]);
    if (source.title)        rows.push(['Title', source.title]);
    if (source.episode)      rows.push(['Episode', source.episode]);
    if (source.podcast)      rows.push(['Podcast', source.podcast]);
    if (source.programme)    rows.push(['Programme', source.programme]);
    if (source.edition)      rows.push(['Edition', source.edition]);
    if (source.website)      rows.push(['Website', source.website]);
    if (source.journal)      rows.push(['Journal', source.journal]);
    if (source.newspaper)    rows.push(['Newspaper', source.newspaper]);
    if (source.reportNumber) rows.push(['Report Number', source.reportNumber]);
    if (source.month) {
        rows.push(['Date', `${source.month} ${source.day ? source.day + ', ' : ''}${source.year}`]);
    } else if (source.date) {
        rows.push(['Date', source.date]);
    } else if (source.year) {
        rows.push(['Year', source.year]);
    }
    if (source.volume)       rows.push(['Volume', `${source.volume}${source.issue ? `(${source.issue})` : ''}`]);
    if (source.pages)        rows.push(['Pages', source.pages]);
    if (source.page)         rows.push(['Page', source.page]);
    if (source.platform)     rows.push(['Platform', source.platform]);
    if (source.production)   rows.push(['Production', source.production]);
    if (source.publisher)    rows.push(['Publisher', source.publisher]);
    if (source.type)         rows.push(['Type', source.type]);
    if (source.url)          rows.push(['URL', source.url]);
    if (source.doi)          rows.push(['DOI', source.doi]);
    if (source.accessed)     rows.push(['Accessed', source.accessed]);
    const items = rows.map(([label, val]) => `<li><strong>${label}:</strong> ${val}</li>`).join('\n                        ');
    return `
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <p style="margin-bottom: 10px;"><strong>Source Information:</strong></p>
                    <ul style="list-style: none; padding-left: 0;">
                        ${items}
                    </ul>
                </div>`;
}

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
    // Excludes: MCQ (options), ordering (position1), correction exercises (correctedReference), and multi-entry exercises (bookEntry)
    if (practiceMode === 'intermediate' && !question.options && !question.fields.includes('position1') && !question.fields.includes('correctedReference') && !question.fields.includes('bookEntry')) {
        let questionHTML = `
    <div class="question-container" id="question-${currentQuestionIndex}">
        ${sourceLabel ? `<p style="font-size: 0.85rem; font-weight: bold; color: #667eea; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em;">${sourceLabel}</p>` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: #2c3e50;">Question ${currentQuestionIndex + 1} of ${currentQuestions.length}</h3>
                    <span style="color: #7f8c8d; font-size: 0.9rem;">${getCategoryLabel(question.id)}</span>
                </div>

                ${question.paraphrase
                    ? `<p style="margin-bottom: 10px; font-size: 1.1rem;"><strong>Write the in-text citation for this paraphrase:</strong></p>
                       <blockquote style="margin: 0 0 20px 0; padding: 12px 16px; background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 0 6px 6px 0; font-size: 1.05rem;">${question.paraphrase} <strong>[citation]</strong></blockquote>`
                    : `<p style="margin-bottom: 20px; font-size: 1.1rem;"><strong>Scenario:</strong> ${question.scenario}</p>`
                }
        `;

        if (question.source) {
            questionHTML += buildSourceInfoHTML(question.source);
        }

        questionHTML += `
            <div style="margin-bottom: 25px;">
                <p style="margin-bottom: 15px;"><strong>Type the full citation below.</strong></p>

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
                <button class="section-button" id="submit-button" onclick="checkIntermediateAnswer()" style="flex: 1; min-width: 150px;">
                    ✓ Submit Answer
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
        questionHTML += buildSourceInfoHTML(question.source);
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

        // Build numbered sources list (rendered as HTML so italics display correctly)
        let sourcesListHTML = '<p style="margin-bottom: 10px;"><strong>Sources:</strong></p><div style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 20px;">';
        question.sources.forEach((source, idx) => {
            sourcesListHTML += `<p style="margin-bottom: ${idx < question.sources.length - 1 ? '10px' : '0'}"><strong>Source ${idx + 1}:</strong> ${source}</p>`;
        });
        sourcesListHTML += '</div>';

        questionHTML += `
            <div style="margin-bottom: 25px;">
                ${sourcesListHTML}
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
                questionHTML += `<option value="${source}">Source ${sourceIndex + 1}</option>`;
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
                <div style="margin-bottom: 8px;">
                    <button
                        onclick="document.execCommand('italic', false, null); document.getElementById('rich-corrected').focus();"
                        style="font-style: italic; font-weight: bold; font-size: 1rem; width: 36px; height: 36px; border: 2px solid #ccc; border-radius: 4px; background: white; cursor: pointer; font-family: Georgia, serif;"
                        title="Italic (select text first, then click)"
                    >I</button>
                </div>
                <div
                    id="rich-corrected"
                    contenteditable="true"
                    style="width: 100%; min-height: 60px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-family: inherit; line-height: 1.6; box-sizing: border-box; outline: none;"
                    placeholder="Type your corrected reference here..."
                ></div>
                <p style="margin-top: 8px; color: #7f8c8d; font-size: 0.85rem;">💡 Tip: Type your reference, then select any titles and click <em>I</em> to italicise them.</p>
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
    // Check if this is a multiple authors question
    const isMultipleAuthors = question.fields.includes('authors');
    const hasPage = question.fields.includes('page');

    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the in-text citation:</strong></p>
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px; font-size: 1.1rem;">
                <input type="text" id="field-quote" placeholder="Quote" style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;" disabled value="${question.quote}">
                <span>(</span>
    `;

    if (isMultipleAuthors) {
        // Multiple authors format
        questionHTML += `
                <input type="text" id="field-authors" placeholder="Author1 and Author2," style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                <input type="text" id="field-year" placeholder="Year," style="width: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
        `;
        if (hasPage) {
            questionHTML += `
                <input type="text" id="field-page" placeholder="p. X" style="width: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
            `;
        }
    } else {
        // Detect which "name" field this citation question uses
        let citationFieldId, citationPlaceholder;
        if (question.fields.includes('organisation')) {
            citationFieldId = 'field-organisation'; citationPlaceholder = 'Organisation';
        } else if (question.fields.includes('department')) {
            citationFieldId = 'field-department'; citationPlaceholder = 'Department';
        } else if (question.fields.includes('ai')) {
            citationFieldId = 'field-ai'; citationPlaceholder = 'AI name';
        } else if (question.fields.includes('creator')) {
            citationFieldId = 'field-creator'; citationPlaceholder = 'Creator';
        } else if (question.fields.includes('host')) {
            citationFieldId = 'field-host'; citationPlaceholder = 'Host';
        } else if (question.fields.includes('director')) {
            citationFieldId = 'field-director'; citationPlaceholder = 'Director';
        } else if (question.fields.includes('programme')) {
            citationFieldId = 'field-programme'; citationPlaceholder = 'Programme';
        } else if (question.fields.includes('title')) {
            citationFieldId = 'field-title'; citationPlaceholder = 'Title';
        } else {
            citationFieldId = 'field-author'; citationPlaceholder = 'Author';
        }
        questionHTML += `
                <input type="text" id="${citationFieldId}" placeholder="${citationPlaceholder}" style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                <span>,</span>
                <input type="text" id="field-year" placeholder="Year" style="width: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
        `;
        if (hasPage) {
            questionHTML += `
                <span>, p.</span>
                <input type="text" id="field-page" placeholder="Page" style="width: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
            `;
        }
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
                            `<input type="text" id="field-author" placeholder="Author." style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">` :
                          question.fields.includes('organisation') ?
                            `<input type="text" id="field-organisation" placeholder="Organisation." style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">` :
                            ''}
                        ${question.fields.includes('date') ?
                            `<input type="text" id="field-date" placeholder="(no date)" style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">` :
                            `<input type="text" id="field-year" placeholder="(Year)." style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">`}
                    </div>
                    ${question.fields.includes('title') ? `
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <input type="text" id="field-title" placeholder="Title of webpage." style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    </div>` : ''}
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <input type="text" id="field-website" placeholder="Website Name." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <input type="text" id="field-url" placeholder="Available at: https://..." style="flex: 1; min-width: 400px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    </div>
                    ${question.fields.includes('accessed') ? `
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <input type="text" id="field-accessed" placeholder="(Accessed: Day Month Year)." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    </div>` : ''}
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
    } else if (question.fields.includes('newspaper')) {
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                ${question.fields.includes('author') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-author" placeholder="Author (Surname, I.)" style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : question.fields.includes('anon') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-anon" placeholder="Anon." style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>`}
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="'Article title in sentence case'" style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                ${question.fields.includes('type') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-type" placeholder="[Editorial] or [Letter to the editor]" style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : ''}
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-newspaper" placeholder="Newspaper Name" style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                    <input type="text" id="field-date" placeholder="Day Month" style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                ${question.fields.includes('page') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-page" placeholder="p. X." style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : ''}
                ${question.fields.includes('url') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-url" placeholder="Available at: https://..." style="flex: 1; min-width: 400px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-accessed" placeholder="(Accessed: Day Month Year)." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : ''}
            </div>
        </div>
    `;
    } else if (question.fields.includes('department')) {
    // Reports with a government department as author
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-department" placeholder="Government department" style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="Report title." style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>
                ${question.fields.includes('reportNumber') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-reportNumber" placeholder="Report no. XXX." style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : ''}
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-publisher" placeholder="Publisher." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
    } else if (question.fields.includes('episode')) {
    // Podcast reference list
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-host" placeholder="Host (Surname, I.)" style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-episode" placeholder="'Episode title'," style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-podcast" placeholder="Podcast Name," style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-date" placeholder="Day Month." style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-platform" placeholder="Platform." style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
    } else if (question.fields.includes('production')) {
    // TV/documentary reference list
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-director" placeholder="Director (Surname, I.)" style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="Film or documentary title." style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-production" placeholder="Production company." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
    } else if (question.fields.includes('creator') || question.fields.includes('director')) {
    // YouTube videos and streaming documentaries
    const isCreator = question.fields.includes('creator');
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    ${isCreator ?
                        `<input type="text" id="field-creator" placeholder="Creator or channel name" style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">` :
                        `<input type="text" id="field-director" placeholder="Director (Surname, I.)" style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">`}
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="Video or film title" style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-platform" placeholder="Platform." style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-url" placeholder="Available at: https://..." style="flex: 1; min-width: 400px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-accessed" placeholder="(Accessed: Day Month Year)." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
    } else if (question.fields.includes('person')) {
    // Personal communications in-text citation
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the in-text citation:</strong></p>
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px; font-size: 1.1rem;">
                <span>(</span>
                <input type="text" id="field-person" placeholder="Initial. Surname," style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                <input type="text" id="field-communication" placeholder="personal communication," style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                <input type="text" id="field-date" placeholder="Month DD, YYYY" style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                <span>).</span>
            </div>
        </div>
    `;
    } else if (question.fields.includes('company')) {
    // AI reference list
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-company" placeholder="Company name." style="width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-aiName" placeholder="AI tool name." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                ${question.fields.includes('version') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-version" placeholder="(Version number)." style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : ''}
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-type" placeholder="[Large language model]." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-url" placeholder="Available at:https://..." style="flex: 1; min-width: 400px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                ${question.fields.includes('accessed') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-accessed" placeholder="(Accessed: Day Month Year)." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : ''}
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
    } else if (question.fields.includes('organisation') && question.fields.includes('title')) {
    // Organisation as author with title (international org reports, think tanks, website org references)
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-organisation" placeholder="Organisation" style="flex: 1; min-width: 250px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <input type="text" id="field-year" placeholder="(Year)" style="width: 120px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="Report or page title." style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>
                ${question.fields.includes('publisher') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-publisher" placeholder="Publisher." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : ''}
                ${question.fields.includes('url') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-url" placeholder="Available at: https://..." style="flex: 1; min-width: 400px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : ''}
                ${question.fields.includes('accessed') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-accessed" placeholder="(Accessed: Day Month Year)." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : ''}
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
    } else if (question.fields.includes('title') && question.fields.includes('publisher')) {
    // Books (with author, multiple authors, or no author)
    const isMultipleAuthors = question.id.includes('_multi_');
    const hasAuthor = question.fields.includes('author');
    const authorPlaceholder = isMultipleAuthors
        ? "Authors (Surname, I. and Surname, I.)"
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
    } else if (question.fields.includes('url')) {
    // Catch-all for remaining URL-based references (no-author websites, etc.)
    questionHTML += `
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 15px;"><strong>Complete the reference list entry:</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                ${question.fields.includes('title') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-title" placeholder="Title of page." style="flex: 1; min-width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem; font-style: italic;">
                </div>` : ''}
                ${question.fields.includes('year') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-year" placeholder="(Year)." style="width: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : ''}
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-url" placeholder="Available at: https://..." style="flex: 1; min-width: 400px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>
                ${question.fields.includes('accessed') ? `
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="text" id="field-accessed" placeholder="(Accessed: Day Month Year)." style="width: 300px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                </div>` : ''}
            </div>
            ${question.note ? `<p style="margin-top: 15px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 6px; font-size: 0.9rem;"><strong>Note:</strong> ${question.note}</p>` : ''}
        </div>
    `;
    } else {
        // Default: simple in-text citation (paraphrasing)
        // Detect which "name" field to use
        const nameFieldOrder = [
            ['author', 'Author'],
            ['organisation', 'Organisation'],
            ['ai', 'AI name'],
            ['creator', 'Creator'],
            ['host', 'Host'],
            ['director', 'Director'],
            ['programme', 'Programme'],
            ['title', 'Title'],
        ];
        let nameField = 'author';
        let namePlaceholder = 'Author';
        for (const [f, label] of nameFieldOrder) {
            if (question.fields.includes(f)) {
                nameField = f;
                namePlaceholder = label;
                break;
            }
        }

        questionHTML += `
            <div style="margin-bottom: 25px;">
                <p style="margin-bottom: 15px;"><strong>Complete the in-text citation:</strong></p>
                <div style="display: flex; align-items: center; gap: 10px; font-size: 1.1rem;">
                    <span>(</span>
                    <input type="text" id="field-${nameField}" placeholder="${namePlaceholder}" style="width: 150px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <span>,</span>
                    <input type="text" id="field-year" placeholder="Year" style="width: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 6px; font-size: 1rem;">
                    <span>)</span>
                </div>
            </div>
        `;
    }

   questionHTML += `
    <div style="margin-top: 30px; display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="section-button" id="submit-button" onclick="checkAnswer()" style="flex: 1; min-width: 150px;">
            ✓ Submit Answer
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
        const isMultiAuthorAnswer = correctAnswer && correctAnswer.includes(' and ');
        if (isMultipleAuthors || isMultiAuthorAnswer) {
            if (!userAnswer.includes(',')) tips.push('Author format: Surname, I. and Surname, I.');
            if (userAnswer.includes('&')) tips.push('Use "and" not "&" to separate authors');
            if (userAnswer.includes(' and ') && userAnswer.includes(',') && userAnswer !== correctAnswer) tips.push('Ensure authors are listed in alphabetical order by surname');
        } else if (correctAnswer && correctAnswer.includes(',')) {
            // Reference list context: needs Surname, I.
            if (!userAnswer.includes(',')) tips.push('Author format: Surname, I.');
        } else {
            // In-text citation context: surname only
            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                tips.push('Check the capitalisation of the surname');
            } else {
                tips.push('Use the surname only — no initial needed for in-text citations (e.g., Davidson)');
            }
        }
    }

    if (field === 'anon') {
        if (!userAnswer.startsWith('A') || !userAnswer.endsWith('.')) {
            tips.push('For anonymous articles use: Anon. (capital A, full stop)');
        }
    }

    if (field === 'year') {
        if (correctAnswer.includes('(') && !userAnswer.includes('(')) {
            tips.push('Year needs brackets: (2024)');
        } else if (!correctAnswer.includes('(') && userAnswer.includes('(')) {
            tips.push('In-text citations use the year without brackets: 2024');
        } else {
            tips.push('Check the year — make sure you are using the publication year shown in the source');
        }
    }

    if (field === 'title') {
        const isNewspaper = question.id.startsWith('news');
        if (isNewspaper) {
            if (!userAnswer.startsWith("'")) {
                tips.push("Newspaper article titles go in single quotes: 'Article title',");
            } else if (!userAnswer.endsWith("',")) {
                tips.push("Title should end with a comma after the closing quote: 'Article title',");
            }
        } else {
            if (correctAnswer.endsWith(',')) {
                if (!userAnswer.endsWith(',')) tips.push('Title should end with a comma in this context');
            } else if (!userAnswer.includes('.')) {
                tips.push('Add a full stop at the end of the title');
            }
            if (userAnswer !== correctAnswer && userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                tips.push('Title should be in sentence case (only first word and proper nouns capitalised)');
                tips.push(`Correct: "${correctAnswer}"`);
            }
        }
    }

    if (field === 'editor') {
        if (!userAnswer.includes(',')) tips.push('Editor format: Surname, I. (Ed.).');
        if (!userAnswer.includes('(Ed.)')) tips.push("Don't forget to add (Ed.). at the end");
    }

    if (field === 'chapter') {
        if (!userAnswer.includes('.')) tips.push('Chapter title needs a full stop at the end');
        if (userAnswer !== correctAnswer && userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
            tips.push('Chapter title should be in sentence case');
        }
    }

    if (field === 'edition') {
        if (!userAnswer.includes('ed.')) tips.push('Edition format: 3rd ed. (use "ed." not "edition")');
        if (userAnswer.includes('edition')) tips.push('Use abbreviated form: "ed." not "edition"');
    }

    if (field === 'publisher') {
        if (!userAnswer.endsWith('.')) tips.push('Publisher name should end with a full stop: HMSO.');
    }

    if (field === 'website') {
        if (!userAnswer.endsWith('.')) tips.push('Website name should end with a full stop');
    }

    if (field === 'journal') {
        if (correctAnswer.endsWith(',') && !userAnswer.endsWith(',')) {
            tips.push('Journal name should end with a comma: Journal of Psychology,');
        }
    }

    if (field === 'newspaper') {
        if (correctAnswer.endsWith(',') && !userAnswer.endsWith(',')) {
            tips.push('Newspaper name should end with a comma: The Guardian,');
        }
    }

    if (field === 'date') {
        if (correctAnswer === '(no date)') {
            tips.push('When there is no publication date, use: (no date)');
        } else if (correctAnswer.endsWith(',') && !userAnswer.endsWith(',')) {
            tips.push('Date should end with a comma: 15 March,');
        } else if (correctAnswer.endsWith('.') && !userAnswer.endsWith('.')) {
            tips.push('Date should end with a full stop: 15 March.');
        }
    }

    if (field === 'page') {
        if (userAnswer.toLowerCase().includes('p.') || userAnswer.includes(')')) {
            tips.push('Enter just the page number — "p." and the brackets are already shown for you (e.g., type 56, not p. 56)');
        } else {
            tips.push('Enter just the page number (e.g., 56)');
        }
    }

    if (field === 'pages') {
        if (!userAnswer.includes('pp.')) tips.push('Pages format: pp. 45-68. (use "pp." for a range)');
        if (!userAnswer.includes('(') || !userAnswer.includes(')')) {
            tips.push('Pages need brackets: (pp. 45-68).');
        }
    }

    if (field === 'doi') {
        if (!userAnswer.startsWith('doi:')) tips.push('DOI format: doi:10.xxxx/xxxxx. Must start with doi: (no https://)');
    }

    if (field === 'volume') {
        if (question.fields.includes('doi') || question.fields.includes('journal')) {
            if (!userAnswer.includes('(') || !userAnswer.includes(')')) {
                tips.push('Volume format: 34(2), issue number in brackets, followed by a comma');
            }
            if (userAnswer.includes('(') && !userAnswer.endsWith(',')) {
                tips.push('Volume should end with a comma: 34(2),');
            }
        }
    }

    if (field === 'url') {
        if (correctAnswer.startsWith('Available at:') && !userAnswer.toLowerCase().startsWith('available at:')) {
            tips.push('URL should start with "Available at: " followed by the full web address');
        }
    }

    if (field === 'accessed') {
        if (!userAnswer.startsWith('(Accessed:')) {
            tips.push('Format: (Accessed: Day Month Year). Begin with "(Accessed:"');
        } else if (!userAnswer.endsWith(').')) {
            tips.push('End with closing bracket and full stop: (Accessed: 15 March 2024).');
        }
    }

    if (field === 'version') {
        if (!userAnswer.includes('(') || !userAnswer.includes(')')) {
            tips.push('Version goes in brackets: (4) or (3.5)');
        }
    }

    if (field === 'type') {
        if (!userAnswer.includes('[')) {
            tips.push('Type goes in square brackets: [Large language model].');
        } else if (!userAnswer.endsWith('].')) {
            tips.push('Add a full stop after the closing bracket: [Large language model].');
        }
    }

    if (field === 'authors') {
        if (!userAnswer.includes('and')) tips.push('Format for two authors: Surname1 and Surname2,');
        if (userAnswer.includes('&')) tips.push('Use "and" not "&"');
        if (!userAnswer.includes(',')) tips.push("Don't forget the comma after the authors");
    }

    if (field === 'creator' || field === 'host' || field === 'director') {
        if (!userAnswer.includes(',')) tips.push('Name format: Surname, I. (same as author format)');
    }

    if (field === 'platform') {
        if (!userAnswer.endsWith('.')) tips.push('Platform name should end with a full stop: YouTube.');
    }

    if (field === 'production') {
        if (!userAnswer.endsWith('.')) tips.push('Production company should end with a full stop: BBC Films.');
    }

    if (field === 'podcast') {
        if (correctAnswer.endsWith(',') && !userAnswer.endsWith(',')) {
            tips.push('Podcast name should end with a comma: Tech Insights Weekly,');
        }
    }

    if (field === 'episode') {
        if (!userAnswer.startsWith("'")) {
            tips.push("Episode title goes in single quotes: 'Episode title',");
        } else if (!userAnswer.endsWith("',")) {
            tips.push("Episode title should end with a comma after the closing quote: 'Title',");
        }
    }

    if (field === 'person') {
        if (!userAnswer.includes('.') && !userAnswer.includes(',')) {
            tips.push('Name format: Initial. Surname, e.g. S. Johnson,');
        } else if (!userAnswer.endsWith(',')) {
            tips.push('Person name should end with a comma: S. Johnson,');
        }
    }

    if (field === 'communication') {
        if (userAnswer.length > 0 && /^[A-Z]/.test(userAnswer)) {
            tips.push('Communication type should be lowercase: personal communication,');
        }
        if (!userAnswer.endsWith(',')) {
            tips.push('Communication type should end with a comma: personal communication,');
        }
    }

    if (field === 'ai') {
        if (userAnswer.includes('(') || userAnswer.includes(')')) {
            tips.push('Just the AI tool name here, no brackets: ChatGPT');
        }
        if (/openai|anthropic|google|microsoft/i.test(userAnswer)) {
            tips.push('Use the tool name (e.g. ChatGPT), not the company name (e.g. OpenAI)');
        }
    }

    return tips;
}
function normaliseQuotes(str) {
    return str
        .replace(/[“”]/g, '"')  // curly double quotes → straight
        .replace(/[‘’]/g, "'")  // curly single quotes → straight
        .trim();
}

// Build field-aware hints for intermediate mode wrong answers
function getIntermediateHints(question) {
    const fields = question.fields;
    const hints = [];

    if (fields.includes('author') || fields.includes('authors')) {
        const isInText = question.correctAnswerFull &&
            (question.correctAnswerFull.startsWith('"') || question.correctAnswerFull.startsWith('('));
        hints.push(isInText
            ? 'Author: surname only, no initial — e.g. (Blackwell, ...'
            : 'Author: Surname, I. — check comma and initial placement');
    }
    if (fields.includes('creator') || fields.includes('host') || fields.includes('director')) {
        hints.push('Creator/Host/Director: Surname, I. Same format as author');
    }
     
    if (fields.includes('editor')) {
        hints.push('Write editor Surname and initial followed by (ed.). e.g., Smith, J. (ed.).');
    }
    if (fields.includes('year')) {
        const needsBrackets = question.correctAnswers && question.correctAnswers.year && question.correctAnswers.year.includes('(');
        hints.push(needsBrackets ? 'Year in brackets: (2024)' : 'In-text year without brackets: 2024');
    }
    if (fields.includes('title') && fields.includes('newspaper')) {
        hints.push("Newspaper article title in single quotes ending with comma: 'Article title',");
    } else if (fields.includes('title') && fields.includes('journal')) {
        hints.push("Article title in single quotes ending with full stop: 'Article title.'");
        hints.push('Journal name in italics, followed by a comma');
    } else if (fields.includes('title')) {
        const noAuthor = !fields.includes('author') && !fields.includes('authors');
        if (noAuthor) {
            hints.push('Title: sentence case, no full stop after the title — the year bracket follows directly. Italicise the title');
        } else {
            hints.push('Title: sentence case, full stop at end. Italicise book/journal/newspaper/media titles');
        }
    }
    if (fields.includes('newspaper') && !fields.includes('title')) {
        hints.push('Newspaper name in italics, followed by a comma');
    }
    if (fields.includes('date')) {
        const dateCorrAns = question.correctAnswers && question.correctAnswers.date || '';
        hints.push(dateCorrAns.endsWith(',') ? 'Date ends with a comma: 15 March,' : 'Date ends with a full stop: 15 March.');
    }
    if (fields.includes('page')) {
        const isInText = question.correctAnswerFull &&
            (question.correctAnswerFull.startsWith('"') || question.correctAnswerFull.startsWith('('));
        hints.push(isInText
            ? 'Page inside brackets: p. 67 — "p." prefix, no full stop after the number'
            : 'Single page: p. 12. — "p." prefix, full stop at end');
    }
    if (fields.includes('pages')) {
        hints.push('Page range: pp. 45–68. — "pp." prefix, full stop at end');
    }
    if (fields.includes('volume')) {
        hints.push('Volume and issue: 34(2), issue in brackets, comma after');
    }
    if (fields.includes('doi')) {
        hints.push('DOI: doi:10.xxxx/... must start with doi: (no https://)');
    }
    if (fields.includes('url')) {
        hints.push('URL: Available at: https://... include "Available at:" before the address');
    }
    if (fields.includes('accessed')) {
        hints.push('Accessed: (Accessed: Day Month Year). full stop after the closing bracket');
    }
    if (fields.includes('episode')) {
        hints.push("Episode title in single quotes ending with comma: 'Episode title',");
    }
    if (fields.includes('podcast')) {
        hints.push('Podcast name in italics, followed by a comma');
    }
    if (fields.includes('publisher')) {
        hints.push('Publisher ends with full stop: HMSO.');
    }
    if (fields.includes('production')) {
        hints.push('Production company ends with full stop: BBC Films.');
    }
    if (fields.includes('platform')) {
        hints.push('Platform ends with full stop: YouTube.');
    }
    if (fields.includes('type')) {
        hints.push('Type in square brackets with full stop: [Large language model].');
    }
    if (fields.includes('version')) {
        hints.push('Version in brackets: (4)');
    }

    return hints;
}

function checkIntermediateAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    const richBox = document.getElementById('rich-answer');
    const feedbackDiv = document.getElementById('feedback');

    const studentPlainText = normaliseQuotes(richBox.innerText).replace(/\s+/g, ' ').replace(/\.$/, '').trim();
    const correctPlainText = normaliseQuotes(question.correctAnswerFull || '').replace(/\s+/g, ' ').replace(/\.$/, '').trim();

    if (!correctPlainText) {
        feedbackDiv.className = 'feedback show incorrect';
        feedbackDiv.innerHTML = '<strong>⚠️ No correct answer available for this question in intermediate mode yet.</strong>';
        return;
    }

    if (studentPlainText !== correctPlainText) {
        const hints = getIntermediateHints(question);
        let hintHTML = '';
        if (hints.length > 0) {
            hintHTML = `
            <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                <strong>💡 Check:</strong>
                <ul style="padding-left: 20px; margin-top: 5px; margin-bottom: 0;">
                    ${hints.map(h => `<li>${h}</li>`).join('')}
                </ul>
            </div>`;
        } else {
            hintHTML = `
            <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                💡 Every comma, full stop, and bracket matters. Check spacing too.
            </div>`;
        }
        feedbackDiv.className = 'feedback show incorrect';
        feedbackDiv.innerHTML = `<strong>✗ Not quite.</strong> Check your punctuation, spacing, and formatting carefully.${hintHTML}`;
        return;
    }

    // Text is correct - now check italics using computed styles on the live rendered element
    const requiredItalicFields = question.italicFields || [];

    const expectedItalicParts = requiredItalicFields.map(field => {
        const val = question.correctAnswers[field] || '';
        return val.replace(/[.,]$/, '').trim();
    });

    // Collect all italic text by walking the rendered richBox and checking computed font-style
    const italicTextParts = [];
    const walker = document.createTreeWalker(richBox, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = walker.nextNode())) {
        if (!textNode.parentElement) continue;
        const computed = window.getComputedStyle(textNode.parentElement);
        if (computed.fontStyle === 'italic') {
            const text = textNode.textContent.trim();
            if (text) italicTextParts.push(text);
        }
    }
    const studentItalicText = italicTextParts.join(' ').trim();

    // Check for unexpected italics: remove each expected italic part from the joined italic text;
    // if meaningful non-punctuation text remains, extra things have been italicised
    let remainingItalic = studentItalicText.toLowerCase();
    for (const part of expectedItalicParts) {
        remainingItalic = remainingItalic.replace(part.toLowerCase(), '');
    }
    const hasUnexpectedItalics = remainingItalic.replace(/[\s.,()[\]'"]/g, '').length > 0;

    if (requiredItalicFields.length === 0) {
        if (studentItalicText.length > 0) {
            feedbackDiv.className = 'feedback show incorrect';
            feedbackDiv.innerHTML = `
                <strong>Almost there!</strong> Your text is correct but check your italics.
                <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                    💡 Nothing should be in italics for this citation. Select any italicised text and click the <em>I</em> button to remove italics.
                </div>
            `;
        } else {
            markIntermediateCorrect(richBox, feedbackDiv);
        }
        return;
    }

    const allExpectedItalicised = expectedItalicParts.every(part =>
        studentItalicText.toLowerCase().includes(part.toLowerCase())
    );

    if (hasUnexpectedItalics && !allExpectedItalicised) {
        const missingParts = expectedItalicParts.filter(part =>
            !studentItalicText.toLowerCase().includes(part.toLowerCase())
        );
        feedbackDiv.className = 'feedback show incorrect';
        feedbackDiv.innerHTML = `
            <strong>Almost there!</strong> Your text is correct but check your italics.
            <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                💡 Only <em>${missingParts.join('</em> and <em>')}</em> should be in italics — and it must be italicised. Remove italics from anything else by selecting it and clicking the <em>I</em> button.
            </div>
        `;
    } else if (hasUnexpectedItalics) {
        feedbackDiv.className = 'feedback show incorrect';
        feedbackDiv.innerHTML = `
            <strong>Almost there!</strong> Your text is correct but check your italics.
            <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                💡 Only <em>${expectedItalicParts.join('</em> and <em>')}</em> should be in italics. Remove italics from any other text by selecting it and clicking the <em>I</em> button.
            </div>
        `;
    } else if (!allExpectedItalicised) {
        const missingParts = expectedItalicParts.filter(part =>
            !studentItalicText.toLowerCase().includes(part.toLowerCase())
        );
        const italicDetail = missingParts.length > 0
            ? `The following should be in italics: <em>${missingParts.join('</em>, <em>')}</em>. Select the text and click the <em>I</em> button.`
            : 'Make sure the correct text is italicised. Select it and click the <em>I</em> button.';
        feedbackDiv.className = 'feedback show incorrect';
        feedbackDiv.innerHTML = `
            <strong>Almost there!</strong> Your text is correct but check your italics.
            <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                💡 ${italicDetail}
            </div>
        `;
    } else {
        markIntermediateCorrect(richBox, feedbackDiv);
    }
}

function markCorrectedReferenceCorrect(richBox, feedbackDiv) {
    feedbackDiv.className = 'feedback show correct';
    feedbackDiv.innerHTML = '<strong>✓ Correct!</strong> Click "Next Question".';
    richBox.contentEditable = false;
    richBox.style.backgroundColor = '#d4edda';
    richBox.style.borderColor = '#28a745';
    document.getElementById('next-button').classList.remove('hidden');

    document.getElementById('show-answer-button').classList.add('hidden');
    event.target.disabled = true;
}

function markIntermediateCorrect(richBox, feedbackDiv) {
    feedbackDiv.className = 'feedback show correct';
    feedbackDiv.innerHTML = '<strong>✓ Correct!</strong> Click "Next Question".';
    richBox.contentEditable = false;
    richBox.style.backgroundColor = '#d4edda';
    richBox.style.borderColor = '#28a745';
    document.getElementById('next-button').classList.remove('hidden');

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
    document.getElementById('submit-button').disabled = true;
    document.getElementById('next-button').classList.remove('hidden');
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
        
            document.getElementById('show-answer-button').classList.add('hidden');
            event.target.disabled = true;
        } else {
            feedbackDiv.className = 'feedback show incorrect';
            feedbackDiv.innerHTML = '<strong>✗ Incorrect.</strong> The correct answer is highlighted above.';
            document.getElementById('next-button').classList.remove('hidden');
        
            document.getElementById('show-answer-button').classList.add('hidden');
            event.target.disabled = true;
        }

        return; // Exit function - don't run the fill-in-the-blank code
    }

    // Handle correctedReference with rich text + italics checking
    if (question.fields.includes('correctedReference')) {
        const richBox = document.getElementById('rich-corrected');
        const feedbackDiv = document.getElementById('feedback');
        feedbackDiv.classList.add('show');

        const correctFull = question.correctAnswers.correctedReference || '';
        const correctPlainText = normaliseQuotes(correctFull.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
        const studentPlainText = normaliseQuotes(richBox.innerText).replace(/\s+/g, ' ').trim();

        if (studentPlainText !== correctPlainText) {
            let hintHTML = '';
            if (question.note) {
                hintHTML = `<div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">💡 ${question.note}</div>`;
            }
            feedbackDiv.className = 'feedback show incorrect';
            feedbackDiv.innerHTML = `<strong>✗ Not quite.</strong> Check your text carefully.${hintHTML}`;
            return;
        }

        // Text is correct — now check italics
        const emMatches = correctFull.match(/<em>(.*?)<\/em>/g) || [];
        const expectedItalicParts = emMatches.map(m => m.replace(/<\/?em>/g, '').replace(/[.,]$/, '').trim()).filter(Boolean);

        const italicTextParts = [];
        const walker = document.createTreeWalker(richBox, NodeFilter.SHOW_TEXT);
        let textNode;
        while ((textNode = walker.nextNode())) {
            if (!textNode.parentElement) continue;
            if (window.getComputedStyle(textNode.parentElement).fontStyle === 'italic') {
                const text = textNode.textContent.trim();
                if (text) italicTextParts.push(text);
            }
        }
        const studentItalicText = italicTextParts.join(' ').trim();

        let remainingItalic = studentItalicText.toLowerCase();
        for (const part of expectedItalicParts) {
            remainingItalic = remainingItalic.replace(part.toLowerCase(), '');
        }
        const hasUnexpectedItalics = remainingItalic.replace(/[\s.,()[\]'"]/g, '').length > 0;

        if (expectedItalicParts.length === 0) {
            if (studentItalicText.length > 0) {
                feedbackDiv.className = 'feedback show incorrect';
                feedbackDiv.innerHTML = `<strong>Almost there!</strong> Your text is correct but nothing should be in italics here.
                    <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                        💡 Select the italicised text and click the <em>I</em> button to remove italics.
                    </div>`;
            } else {
                markCorrectedReferenceCorrect(richBox, feedbackDiv);
            }
            return;
        }

        const allExpectedItalicised = expectedItalicParts.every(p => studentItalicText.toLowerCase().includes(p.toLowerCase()));

        if (hasUnexpectedItalics && !allExpectedItalicised) {
            const missingParts = expectedItalicParts.filter(p => !studentItalicText.toLowerCase().includes(p.toLowerCase()));
            feedbackDiv.className = 'feedback show incorrect';
            feedbackDiv.innerHTML = `<strong>Almost there!</strong> Your text is correct but check your italics.
                <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                    💡 Only <em>${missingParts.join('</em> and <em>')}</em> should be in italics — and it must be italicised. Remove italics from anything else.
                </div>`;
        } else if (hasUnexpectedItalics) {
            feedbackDiv.className = 'feedback show incorrect';
            feedbackDiv.innerHTML = `<strong>Almost there!</strong> Your text is correct but check your italics.
                <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                    💡 Only <em>${expectedItalicParts.join('</em> and <em>')}</em> should be in italics. Remove italics from any other text.
                </div>`;
        } else if (!allExpectedItalicised) {
            const missingParts = expectedItalicParts.filter(p => !studentItalicText.toLowerCase().includes(p.toLowerCase()));
            feedbackDiv.className = 'feedback show incorrect';
            feedbackDiv.innerHTML = `<strong>Almost there!</strong> Your text is correct but check your italics.
                <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 6px;">
                    💡 <em>${missingParts.join('</em> and <em>')}</em> should be in italics. Select it and click the <em>I</em> button.
                </div>`;
        } else {
            markCorrectedReferenceCorrect(richBox, feedbackDiv);
        }
        return;
    }

    let allCorrect = true;
    let allTips = [];

   for (const field of question.fields) {
    if (field === 'quote') continue;

    const input = document.getElementById(`field-${field}`);
    const userAnswer = input.tagName === 'SELECT' ? input.value.trim() : input.value.trim();
    const correctAnswer = question.correctAnswers[field];

    const isCorrect = userAnswer === correctAnswer;

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
        document.getElementById('submit-button').disabled = true;
        document.getElementById('next-button').classList.remove('hidden');

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
        // Fill and lock the rich text box
        const richBox = document.getElementById('rich-corrected');
        if (richBox) {
            richBox.innerHTML = question.correctAnswers.correctedReference;
            richBox.contentEditable = false;
            richBox.style.backgroundColor = '#fff3cd';
            richBox.style.borderColor = '#ffc107';
        }
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
    document.getElementById('submit-button').disabled = true;

    // Show next button
    document.getElementById('next-button').classList.remove('hidden');

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
