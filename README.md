# Ableton Note ID Fix

**Free online tool to repair corrupted Ableton Live project files with "Non-unique Note IDs" error**

🔗 **Live Demo**: https://yokotoka.github.io/Ableton-Note-ID-are-not-unique-fix/

## The Problem

![Ableton Error Screenshot](images/ableton-error.png)

If you've encountered this error when opening your Ableton Live project:

```
"Non-unique Note IDs"
```

Your project file is corrupted due to duplicate MIDI note IDs in the XML structure. This tool automatically fixes it in your browser - no installation required.

## Features

- 🔒 **100% Client-Side** - Your file never leaves your browser
- 🔧 **Automatic Repair** - Finds and fixes all duplicate Note IDs
- 📊 **Detailed Statistics** - Shows exactly what was fixed
- ⚡ **Instant Download** - Get your repaired file immediately
- ✅ **All Versions** - Works with all Ableton Live versions

## How to Use

1. Go to https://yokotoka.github.io/Ableton-Note-ID-are-not-unique-fix/
2. Upload your corrupted .als file (drag & drop or click to browse)
3. Wait for processing (usually takes a few seconds)
4. Download the fixed file
5. Open in Ableton Live

## How It Works

The tool:
1. Decompresses the gzipped .als file
2. Parses the XML structure
3. Identifies duplicate Note IDs
4. Assigns unique IDs to duplicates
5. Recompresses and provides the fixed file for download

## Credits

Based on:
- [rjomulus's Python script](https://github.com/rjomulus/Ableton_Live_Unique_Note_IDs_fix)
- Community solution from [this Reddit thread](https://www.reddit.com/r/ableton/comments/eeiyn5/)

## Technical Details

- Pure JavaScript (no backend required)
- Uses pako.js for gzip compression/decompression
- Built-in browser APIs for XML parsing
- Hosted on GitHub Pages

## License

MIT License
