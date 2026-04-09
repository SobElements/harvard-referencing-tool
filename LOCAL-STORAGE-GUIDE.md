# Auto-Saving Style Customizations

## What Changed

The Style Editor now automatically saves all customizations to the browser's localStorage. Your colleague no longer needs to download or copy CSS—changes persist across the entire site automatically.

## How It Works

### For Your Colleague

1. **Open the Style Editor**
   - Click "🎨 Customize Styles" button from any page

2. **Make Changes**
   - Adjust colors, fonts, spacing—anything you want
   - Changes appear instantly in the preview

3. **Automatic Saving**
   - Every time you adjust a slider or color picker, the change is saved
   - No download needed. No copy-paste needed.

4. **See Changes Everywhere**
   - Visit any page in the Harvard Referencing Tool
   - Your custom styles are already applied
   - Changes persist even after closing and reopening the browser

5. **Reset to Defaults** (optional)
   - Click "Reset to Default" button if you want to start over
   - Confirm the action and the page refreshes with default colors

## Technical Details

### Files Modified

- **style-editor.html** - Added localStorage save/load functions
- **src/scripts/style-loader.js** - New utility script (created)
- **index.html** - Added style-loader.js script tag
- **All pages in pages/, tutorials/, practice/** - Added style-loader.js script tag

### How It Works Behind the Scenes

**In the Style Editor:**
```javascript
function saveToLocalStorage() {
  const vals = getValues();
  localStorage.setItem('harvardToolStyles', JSON.stringify(vals));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('harvardToolStyles');
  if (saved) {
    const vals = JSON.parse(saved);
    // Apply saved values to form controls
  }
}
```

Every time a control changes, `saveToLocalStorage()` is called automatically.

**On Every Page:**
The `style-loader.js` script loads on every page and:
1. Checks if there are saved styles in localStorage
2. If found, extracts the CSS variable values
3. Injects them as a `<style>` tag at the top of the page
4. All page elements automatically use the custom colors and fonts

### localStorage Key

The custom styles are stored under: `harvardToolStyles`

If you ever need to clear it manually (in browser DevTools):
```javascript
localStorage.removeItem('harvardToolStyles');
```

## Benefits

✅ **Zero Friction** - Changes appear everywhere automatically
✅ **Persistent** - Styles survive page refreshes and browser restarts
✅ **No Downloads** - No files to manage or copy
✅ **Undo Option** - "Reset to Default" button clears everything
✅ **Works Offline** - Uses browser storage, no server needed

## What If It Doesn't Work?

1. **Scripts not loading?** - Check browser console for errors (F12 → Console)
2. **Changes not appearing?** - Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
3. **Want to clear everything?** - Use the "Reset to Default" button, or clear localStorage from DevTools

---

**For your colleague:** Just use the Style Editor normally—everything works automatically! 🎨
