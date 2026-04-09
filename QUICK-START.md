# Quick Start Guide for Your Colleague

## What You Need to Know

Your project is now set up so your colleague can work entirely through **prompting to Claude** without understanding the code.

### The Three Key Tools

#### 1. 🎨 Style Editor (No Code Needed)
**What it is:** A visual tool to change colors and fonts without writing code.

**How to access it:**
- Click the "🎨 Customize Styles" button in the top navigation bar (appears on every page)
- OR open `style-editor.html` directly

**What they can do:**
- Change button colors
- Adjust text colors
- Make fonts bigger or smaller
- Round or square corners
- See changes live in a preview
- Download or copy their custom CSS

#### 2. 📚 Tutorial & Practice Pages
**Already built in.** Your colleague can:
- Add more tutorial pages in `tutorials/` folder
- Add more practice questions by editing `src/data/questions-bank.json`
- Edit content on any page

#### 3. 📝 Edit Content Directly
**For simple text changes:**
- Open any `.html` file
- Find the text they want to change
- Edit it
- Prompt Claude to help if needed

---

## The Navbar (Top Navigation)

Every page now has a **sticky navbar** at the top that:
- Shows "← Harvard Referencing Tool" or home link
- Has a "🎨 Customize Styles" button
- Always stays visible when scrolling
- Works on every page automatically

They don't need to add it anywhere—it's already there!

---

## Telling Them to Make Changes

Your colleague can now make changes by:

1. **"Add more practice questions"**
   - Edit `src/data/questions-bank.json`
   - Prompt Claude to help add questions

2. **"Change the color scheme"**
   - Click "🎨 Customize Styles" button
   - Use sliders and color pickers
   - No code needed!

3. **"Edit tutorial text"**
   - Open the tutorial file
   - Edit the text directly
   - Prompt Claude if confused

4. **"Add a new tutorial page"**
   - Prompt Claude: "Create a new tutorial page for [topic]"
   - Claude will create it with the right structure
   - Navbar appears automatically

---

## Files They'll Interact With

| File | What to do | How | Code needed? |
|------|-----------|-----|--------------|
| `style-editor.html` | Customize colors/fonts | Click button on navbar | ❌ No |
| `src/data/questions-bank.json` | Add questions | Edit JSON, prompt Claude | ✅ Ask Claude |
| `pages/*.html` | Edit topic content | Open file, edit text | ❌ Just text |
| `tutorials/*.html` | Edit tutorial content | Open file, edit text | ❌ Just text |
| `src/styles/styles.css` | Advanced styling | Prompt Claude for help | ✅ Ask Claude |
| `index.html` | Edit home page | Open file, edit | ❌ Just text |

---

## The Simplest Workflow for Them

1. **Open a page** in their browser
2. **See the navbar at the top**
3. **Click "🎨 Customize Styles"** to change looks
4. **Click home/back links** to navigate
5. **Edit HTML files** for content changes
6. **Prompt Claude** for anything code-related

---

## What's Automatic (No Work Needed)

✅ Navigation bar on every page  
✅ Style editor accessible everywhere  
✅ Links all point the right direction  
✅ Home button works from any page  
✅ Accordion sections expand/collapse  
✅ Practice questions load and check answers  

---

## What They Need to Do

❌ Understand JavaScript  
❌ Understand CSS  
❌ Edit complex code files  

Just:
- 💬 Prompt Claude when they want code changes
- 🎨 Use the Style Editor for look & feel
- ✏️ Edit HTML text directly for content

---

**That's it!** They're ready to go. 🚀
