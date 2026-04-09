# Harvard Referencing Tool - Code Structure Guide

This guide explains how the code is organized and what each file does. Since you don't read code directly, this should help you understand what's happening when you need to make changes.

## 📁 Project Organization

Your project is now organized into these folders and has a **Style Editor tool** built in:

```
harvard-referencing-tool/
├── index.html                 ← Main home page (entry point)
├── style-editor.html          ← 🎨 Style editor tool (customize without coding)
├── src/                       ← All code and data files
│   ├── styles/
│   │   └── styles.css      ← All the styling (colors, fonts, layout)
│   ├── scripts/
│   │   ├── script.js       ← Accordion/tutorial page functionality
│   │   └── practice-handler.js  ← Practice question system
│   └── data/
│       └── questions-bank.json  ← All the practice questions
├── pages/                  ← Content pages (10 files)
│   └── book.html, journal.html, etc.
├── tutorials/              ← Tutorial pages with expandable sections (9 files)
│   └── book-tutorial.html, journal-tutorial.html, etc.
└── practice/               ← Practice exercise pages (11 files)
    └── book-practice.html, custom-practice.html, etc.
```

## 🎨 Style Editor

**New feature!** There's now a built-in **Style Editor** at `style-editor.html`.

### What it does:
- Change colors (buttons, text, secondary text) with a color picker
- Adjust typography (heading and body text sizes)
- Tweak spacing and border radius
- Preview changes live on any page in the tool
- Download or copy the customized CSS

### Why use it:
You don't need to edit CSS files directly. Just open the Style Editor, adjust the sliders and colors, and see the changes instantly on a live preview.

### How to access it:
1. Open `style-editor.html` in a browser, OR
2. Click the "🎨 Style Editor" button on the home page

### For your colleague:
This is perfect for them to experiment with the look and feel without touching any code.

---

## 🔧 How the Code Works

### **script.js** (Simple - Accordions only)
- **What it does:** Makes the expandable sections on tutorial pages work
- **When it runs:** When any tutorial page loads
- **How it works:** 
  1. Finds all section headers (e.g., "In-text Citations")
  2. When you click a header, it shows/hides the content below
  3. If you open one section, it automatically closes the previous one
  4. The arrow icon rotates to show if a section is open or closed

**Key function:** `initializeAccordions()` - Sets up all the accordion sections

---

### **practice-handler.js** (Complex - Question system)
- **What it does:** Manages the entire practice question system
- **When it runs:** When any practice page loads
- **Main flow:**

  1. **Loading Questions** (Section 1)
     - Fetches all questions from `questions-bank.json`
     - Loads them once when practice starts

  2. **Initializing** (Section 2)
     - When user clicks "Start Practice", questions are selected
     - You can choose which types of questions to include
     - Two modes available: **Beginner** and **Intermediate**

  3. **Displaying** (Section 3)
     - Questions appear one at a time
     - Shows source info (author, title, year, etc)
     - **Beginner mode:** Shows separate input boxes for each field
     - **Intermediate mode:** Shows one big text area to type the full reference

  4. **Checking Answers** (Section 4)
     - Compares user's answer to correct answer
     - If wrong, gives helpful tips about what to fix
     - Example tips: "Author format: Surname, I." or "Year needs brackets"

  5. **Navigation** (Section 5)
     - "Submit Answer" → Checks if correct
     - "Next Question" → Moves to the next question
     - "Skip Question" → Moves on without answering
     - "Show Answer" → Reveals the correct answer

  6. **Progress & Results** (Section 6)
     - Progress bar shows how many questions done
     - At the end, shows results summary

**Key functions:**
- `loadQuestions()` - Gets all questions from JSON file
- `initializePractice()` - Starts a practice session
- `displayQuestion()` - Shows the current question
- `checkAnswer()` - Checks if the user's answer is correct
- `nextQuestion()` - Moves to the next question

---

## 📊 questions-bank.json

This JSON file contains all the practice questions. Structure:

```json
{
  "book": {
    "in-text-quotes": [
      { "id": "book_dq_1", "scenario": "...", "source": {...}, "correctAnswers": {...} },
      { "id": "book_dq_2", "scenario": "...", "source": {...}, "correctAnswers": {...} }
    ],
    "reference-list": [...]
  },
  "journal": {...},
  "web": {...},
  ...
}
```

- Each source type (book, journal, web, etc.) has categories (in-text quotes, reference lists, etc.)
- Each question has:
  - **id:** Unique identifier
  - **scenario:** What the user is supposed to do
  - **source:** The source info (author, title, year, etc.)
  - **correctAnswers:** What the right answer should be

---

## 🧭 Global Navigation Bar

Every page now has a **sticky navigation bar at the top** that appears automatically.

### What it shows:
- **← Back to home** link on the left
- **Quick navigation links** (Home, Learn)
- **🎨 Customize Styles button** - Always accessible from anywhere

### How it works:
Two JavaScript files inject the navbar:
- `src/scripts/navbar.js` - For pages in pages/, tutorials/, and practice/ folders
- `src/scripts/navbar-home.js` - For the home page (index.html)

The navbar automatically:
- Appears at the top of every page
- Stays visible when scrolling (sticky)
- Links to the Style Editor from anywhere
- Provides a quick way home

Your colleague doesn't need to do anything — it's automatically on all pages!

---

## 🎯 How to Add New Questions

The practice questions come from `src/data/questions-bank.json`. To add more:

1. Open `src/data/questions-bank.json` in a text editor
2. Find the section for the source type you want to add questions to (e.g., "book")
3. Find the category (e.g., "in-text-quotes")
4. Add a new question object with this structure:
   ```json
   {
     "id": "book_dq_NEW",
     "scenario": "What the user should do",
     "source": {
       "author": "Smith",
       "title": "Example Book",
       "year": 2020,
       ...
     },
     "correctAnswers": {
       "author": "Smith",
       "title": "Example Book",
       ...
     }
   }
   ```

---

## 💡 Making Changes

### Adding a new tutorial page?
1. Create a new HTML file in the `tutorials/` folder
2. Use the same structure as `tutorials/book-tutorial.html`
3. Make sure stylesheets and scripts point to: `../src/styles/styles.css` and `../src/scripts/script.js`

### Adding a new practice page?
1. Create a new HTML file in the `practice/` folder
2. Use the same structure as `practice/book-practice.html`
3. Make sure stylesheets and scripts point correctly
4. Update the JavaScript to load questions for your new source type

### Changing the styling?
- Edit `src/styles/styles.css`
- All pages automatically use this stylesheet

### Adding more questions?
- Edit `src/data/questions-bank.json`
- Add to the existing source type or create a new one

---

## 🔗 File Reference Chart

| File | Purpose | Edit this if you want to... |
|------|---------|-----|
| `index.html` | Home page | Change main menu buttons or add new sections |
| `src/styles/styles.css` | All styling | Change colors, fonts, layout |
| `src/scripts/script.js` | Accordion logic | Change how tutorials expand/collapse |
| `src/scripts/practice-handler.js` | Question system | Change how practice works, feedback, difficulty |
| `src/data/questions-bank.json` | All questions | Add/edit/remove practice questions |
| `pages/*.html` | Content pages | Edit the content users see on each topic |
| `tutorials/*.html` | Tutorial pages | Edit tutorial content or structure |
| `practice/*.html` | Practice pages | Change practice page layout or buttons |

---

## 🐛 Debugging Tips

If something breaks, check these files:

1. **Page won't load?** → Check `index.html` links
2. **Tutorial sections won't expand?** → Check `src/scripts/script.js`
3. **Practice questions won't show?** → Check `src/scripts/practice-handler.js`
4. **Questions won't load?** → Check `src/data/questions-bank.json` format
5. **Styling looks wrong?** → Check `src/styles/styles.css`

---

**Questions?** Ask Claude to explain any specific part of the code!
