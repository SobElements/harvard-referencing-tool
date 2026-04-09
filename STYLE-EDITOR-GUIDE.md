# Style Editor Guide

## What is the Style Editor?

The Style Editor is a visual tool that lets you customize how the Harvard Referencing Tool looks **without writing any code**. Change colors, fonts, and spacing with simple sliders and color pickers.

## How to Open It

1. **From the Home Page:** Click the "🎨 Style Editor" button
2. **Direct:** Open `style-editor.html` in your browser

## What You Can Change

### 🎨 Colours
- **Primary Color** - Buttons, links, and interactive elements
- **Headings & Body Text** - Main text color throughout the site
- **Secondary Text** - Lighter text like descriptions and labels

### ✍️ Typography
- **Heading Size** - Make titles bigger or smaller (20px - 48px)
- **Body Text Size** - Adjust the main text size (12px - 20px)

### 📐 Spacing & Shape
- **Border Radius** - Make corners rounded or square (0px - 50px)
- **Padding** - Add more or less space inside boxes (8px - 32px)

## How to Use It

1. **Pick a color** - Click any color box to open a color picker
2. **Adjust sliders** - Drag to change sizes and spacing
3. **See changes live** - The preview updates instantly on the right
4. **Switch preview pages** - Click "Book", "Journal", "Website", or "Home" to see how your changes look on different pages
5. **Check accessibility** - The tool shows contrast ratios to ensure text is readable

## Saving Your Changes

Once you're happy with your customizations:

### Option 1: Download CSS File
- Click "Download CSS"
- This saves your custom CSS that can be added to the project

### Option 2: Copy Code
- Click "Copy Code"
- Paste it into your project's CSS file

### Option 3: Share Your Settings
- Take a screenshot of your final settings
- Share with your team to recreate the same look

## Color Picker Tips

- **Use the color picker** - Click on the color square to choose from a full spectrum
- **Or paste hex codes** - Type in hex codes like #667eea if you have them
- **Check the contrast badge** - Makes sure colors are readable (AA = good, Fail = needs adjustment)

## Accessibility

The tool automatically checks **color contrast** to ensure text is readable:
- **AA** = Meets WCAG AA standard (readable for most people)
- **AA+** = Exceeds standard for large text
- **Fail** = Not accessible, adjust your colors

## Examples

### Corporate Look
- Primary: Dark blue (#1e40af)
- Text: Near black (#111827)
- Tight spacing (4px border radius)

### Warm & Friendly
- Primary: Warm orange (#b45309)
- Text: Dark brown (#1c1917)
- Rounded corners (12px border radius)
- Bigger spacing

### Bold & Modern
- Primary: Purple (#7c3aed)
- Text: Pure black (#0f0f0f)
- Sharp corners (0px border radius)
- Lots of spacing

## Troubleshooting

### Preview isn't updating
- Refresh the page
- Make sure you're adjusting the controls on the left sidebar

### Colors look different in the live preview
- Check your monitor color settings
- The preview should match what you see in the editor

### I want to undo my changes
- Simply refresh the page to start over
- Or manually adjust the sliders back

## Need Help?

If the style editor doesn't do what you need:
- Ask Claude to explain any styling concept
- For complex changes, ask Claude to edit the CSS directly in `src/styles/styles.css`

---

**Happy customizing!** 🎨
