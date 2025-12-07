# Ozobot Evo 2D Simulator

## Overview
A fully functional Ozobot Evo simulator built in a single HTML file. The simulator allows you to draw paths with colored squares and watch a virtual robot follow the path while responding to color-coded commands.

## What Was Fixed

### Critical Issues Resolved:
1. **Incomplete JavaScript**: The original HTML file was truncated, cutting off in the middle of the `updateUI()` function. Added complete implementation of:
   - `updateUI()` - Updates status display
   - `render()` - Draws the grid, colors, and robot
   - Proper closing tags for `</script>`, `</body>`, and `</html>`

2. **Robot Visibility**: Added white outline to the robot so it's visible on all background colors (especially important on black paths)

3. **State Management**: Added proper state updates when starting the robot so the UI reflects "Running" status

4. **Code Comment Accuracy**: Fixed misleading comment about color code order to accurately reflect "first to last encountered" order

5. **Demo Track**: Improved the demo track with better color code placement and clearer examples

## Features

### ✅ Core Features (As Requested)
1. **Grid-based Drawing**: Adjustable grid size (10-50 cells) where you can paint paths
2. **Color Palette**: Black (path), Red, Green, Blue (codes), White (eraser)
3. **Clear Button**: Resets the entire grid
4. **Play/Pause Button**: Start and stop the robot simulation
5. **Example Button**: Loads a pre-built demo track with various color codes
6. **Floating Buttons**: Two compact buttons in bottom-right corner:
   - **⚙️ Settings**: Opens Grid Size and Timer Settings modal
   - **❓ Help**: Opens Color Code Reference modal
8. **Save/Load State**: Export and import simulator state as JSON files

### 🎨 Drawing Controls
- Click and drag to paint paths on the grid
- Select colors from the palette on the right
- White acts as an eraser
- **🤖 Set Robot Position button**: Click to enable robot placement mode, then click on any cell to move the robot there
  - **Automatically pauses the simulation** when placing the robot
- **Robot Direction controls**: Use the arrow buttons (↑ → ↓ ←) to set which direction the robot faces
  - ↑ = North (up)
  - → = East (right) 
  - ↓ = South (down)
  - ← = West (left)
  - **Automatically pauses the simulation** when changing direction
- Cannot draw paths while robot is running (but can set robot position/direction)

### 🤖 Robot Behavior
The robot follows these rules:
- Follows colored paths (avoids white cells)
- Detects and executes color code sequences
- **At intersections without a turn command: makes a RANDOM choice**
- **Pauses simulation** if it reaches a white cell (off the path) - button changes to "▶ Start Robot"
- **Pauses simulation** if it reaches a dead end - button changes to "▶ Start Robot"
- **Pauses simulation** when position or direction is manually changed

### 🎯 Color Codes Reference (Official Ozobot Codes)

#### Speed Commands (3 colors)
- **Nitro Boost** (50ms): Blue-Green-Red
- **Turbo** (80ms): Blue-Green-Blue
- **Fast** (150ms): Blue-Black-Blue
- **Cruise** (300ms): Green-Black-Green ← Default
- **Slow** (500ms): Red-Black-Red
- **Short Super Slow** (900ms): Red-Green-Blue

#### At Intersections (3 colors)
- **Left**: Green-Black-Red
- **Straight**: Blue-Black-Red
- **Right**: Blue-Red-Green

#### Line Switch (3 colors)
- **Left**: Green-Red-Green
- **Straight**: Green-Blue-Green
- **Right**: Red-Green-Red

#### Special Moves
- **U-Turn (line end)** (2 colors): Blue-Red (executes on red cell)

#### Timer (4 colors)
- **Timer Stop** (configurable): Red-Black-Blue-Green
  - Starts a countdown timer when detected
  - Robot automatically stops when timer expires
  - Duration configurable in "⏱️ Timer Settings" (1-60 seconds, default: 30)
  - Timer shows countdown in settings panel
  - Can be used to create timed challenges or delays

## How to Use

### Method 1: Using the HTTP Server (Currently Running)
A Python HTTP server is running on port 8000:
```bash
# Access the simulator at:
http://localhost:8000
```

### Method 2: Direct File Access
Simply open `index.html` in any modern web browser.

## Usage Instructions

### Quick Start:
1. **Adjust Settings** (optional): Click ⚙️ button to configure grid size and timer
2. **Load Demo**: Click "🕹️ Load Demo Track" to see a pre-built example
3. **Start Robot**: Click "▶ Start Robot" to run the simulation
4. **Watch**: Observe the robot follow the path and respond to color codes
5. **Experiment**: Click "🗑 Clear Board" and draw your own paths!

### Settings Modal (⚙️ Button):
Access grid and timer settings anytime:
1. Click the **⚙️ button** in the bottom-right corner (left of help button)
2. A modal window will pop up with all settings
3. Sections: Grid Size and Timer Settings
4. Make changes and apply
5. Close by clicking **×** or outside the modal

### Adjusting Grid Size:
In the Settings modal (⚙️):
1. View current grid size at the top
2. Enter desired **Width** (10-50 cells)
3. Enter desired **Height** (10-50 cells)
4. Click **"Apply Grid Size"**
5. Grid clears and resizes automatically
6. Settings modal remains open for additional changes

### Timer Settings:
In the Settings modal (⚙️):
1. Enter **Timer Duration** (1-60 seconds, default: 30)
2. View timer status and color code reference
3. Add Timer code to path: **Red-Black-Blue-Green** (4 colors)
4. When robot reads this code, timer starts countdown
5. Timer status displays in two places:
   - **Main Status panel**: Shows "Xs remaining" during countdown
   - **Settings modal**: Shows detailed status with code reference
6. Robot automatically stops when timer reaches 0

**Timer Use Cases:**
- Time-based challenges (reach goal in X seconds)
- Create automated pauses in robot behavior
- Test robot speed by timing loops
- Educational timing demonstrations
- Adjust duration in Settings modal (⚙️ button)

### Drawing Your Own Track:
1. Select **Black** from the color palette
2. Draw a continuous path by clicking and dragging
3. Add color codes:
   - Select a color (Red, Green, or Blue)
   - Paint the code sequence on your path (e.g., Blue-Green-Blue for Turbo)
4. Place the robot at the start of your path (robot starts in center by default)
5. Click "▶ Start Robot"

### Save & Load State:
Save your current track and robot configuration:
1. **💾 Save State**: Click to download current state as JSON file
   - Saves: Grid size, all cell colors, robot position, direction, speed
   - File naming: `ozobot-state-[timestamp].json`
   - Downloads automatically to your browser's download folder

2. **📂 Load State**: Click to load a previously saved JSON file
   - Opens file picker dialog
   - Validates file format before loading
   - Automatically resizes grid if needed
   - Restores robot to saved position and direction (but not running)
   - **Speed always resets to Cruise** (300ms) regardless of saved speed
   - Timer always resets to inactive state
   - Shows error message if file is invalid

**Use Cases:**
- Share track designs with others
- Save complex tracks for later testing
- Create a library of test scenarios
- Backup before making changes

### Color Code Reference:
Access the complete color code guide anytime:
1. Click the **❓ button** in the bottom-right corner of the screen
2. A modal window will pop up with the Color Code Reference
3. Shows all 14 color codes with visual representations
4. Organized by category: Speeds, Turns, Line Switch, Special Moves, Timer
5. Close the modal by:
   - Clicking the **×** button in the top-right of the modal
   - Clicking anywhere outside the modal window

### Tips:
- **Intersections**: Use turn commands (Left/Right/Straight) before reaching an intersection
- **Speed Changes**: Speed commands take effect immediately and persist
- **Color Sequence**: Robot reads colors in the order it encounters them (first to last)
- **Path Continuity**: Make sure your path is continuous (no gaps)
- **Quick Access**: Two compact floating buttons (bottom-right): ⚙️ Settings | ❓ Help
- **Settings**: Adjust grid size and timer duration
- **Help**: View all color codes and references

## Demo Track Description

The demo includes a **simple rectangular loop** with key speed codes from the official Ozobot chart:

### Included Speed Codes:
1. **Turbo** (Blue-Green-Blue) - Very fast (top of loop)
2. **Slow** (Red-Black-Red) - Slow speed (right side)
3. **Fast** (Blue-Black-Blue) - Fast speed (bottom)
4. **Cruise** (Green-Black-Green) - Default/normal speed (left side)

The track is a simple loop that demonstrates speed changes as the robot travels around. Perfect for testing and learning the basic functionality. The robot will continuously loop around the track, speeding up and slowing down at different sections.

**All color codes are based on the official Ozobot Evo color codes chart.**

## Technical Details

### Grid Specifications
- Grid Size: **Adjustable** (default 20 × 20 cells)
  - Min: 10 × 10 cells
  - Max: 50 × 50 cells
- Cell Size: 30 × 30 pixels (fixed)
- Canvas Size: Dynamic based on grid size

### Robot Specifications
- Starting Position: **Bottom-left corner** (row 18, col 1) for better visibility
- Starting Direction: **East (right) by default** - can be changed using direction buttons
- Default Speed: 300ms per cell (Cruise)
- Visual: **Dark circle with prominent green arrow** showing movement direction
  - White outline for visibility on all colors
  - Arrow correctly points in the direction of travel
  - Rotates smoothly when changing direction
- Direction display shows current orientation in status panel

### Code Detection Logic
At **every cell**, the robot reads a **7-cell window** to detect color codes:
1. Reads **3 cells behind** (opposite to direction of travel)
2. Reads **current cell**
3. Reads **3 cells ahead** (in direction of travel)
4. Checks for code patterns in order:
   - **4-color patterns** (Timer: Red-Black-Blue-Green)
   - **3-color patterns** (Speed, Turn, Line Switch codes)
   - **2-color patterns** (U-Turn line end: Blue-Red)

### Action Execution
Actions execute based on their type:
- **Speed codes**: Execute immediately when detected
- **U-Turn (line end)** (Blue-Red): Executes immediately on the red cell (180° turn)
- **Timer code** (Red-Black-Blue-Green): Starts countdown timer immediately, stops robot when timer expires
- **Turn codes** (Left/Right/Straight): Stored and executed at the next intersection
- **Line Switch codes**: Stored and executed at the next intersection

### Movement Logic
At each step:
1. Reads current cell color
2. Updates color history
3. Checks for code matches
4. Finds valid neighboring cells (excludes white and 180° turns)
5. If at intersection and has turn command, executes it
6. Otherwise, makes a random choice among valid paths at the intersection

### State File Format
Saved state files are JSON with the following structure:
```json
{
  "version": "1.0",
  "timestamp": "2025-12-07T12:34:56.789Z",
  "gridSize": {
    "width": 20,
    "height": 20
  },
  "grid": [[...], [...], ...],
  "robot": {
    "r": 18,
    "c": 1,
    "dir": 1,
    "speedDelay": 300,
    "active": false,
    "nextTurn": null
  }
}
```

**Fields:**
- `version`: File format version
- `timestamp`: When the state was saved
- `gridSize`: Grid dimensions (width × height)
- `grid`: 2D array of cell colors ("white", "black", "red", "green", "blue")
- `robot`: Complete robot state including position (r, c), direction (0-3), speed delay, and stored turn command

## Browser Compatibility
Works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- CSS3 (for styling)

Tested on: Chrome, Firefox, Safari, Edge

## Files
- `index.html` - Complete simulator (single file, ~1000 lines)
- `README.md` - This documentation
- `*.json` - Saved state files (created by Save State feature)

## Troubleshooting

**Robot doesn't move:**
- Ensure the path is continuous under the robot
- Check that the robot isn't on a white cell
- Press Play button to start

**Color codes don't work:**
- Verify the exact color sequence matches the reference
- Ensure colors are continuous (no gaps)
- Robot must pass through all colors in sequence

**Can't draw on grid:**
- Make sure robot is stopped (not running)
- Check that you've selected a color from the palette

**Robot gets lost:**
- Robot stops when it reaches white cells
- Ensure your path has no gaps
- Use Clear Board and try again

## Future Enhancements (Optional)
- Adjustable grid size
- Save/load custom tracks
- Multiple robots
- Custom color code programming
- Speed visualization
- Path recording/playback
- Score tracking for completing loops

---

**Created**: December 2025  
**Status**: ✅ Fully Functional  
**License**: Open source for educational use

