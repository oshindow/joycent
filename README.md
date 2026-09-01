# Accent demo page

A dependency-free static research project page inspired by the interaction and visual rhythm of the NeuROK homepage. All displayed evaluation samples come from `retained_samples_39.json`; the seven same-speaker samples come from the aligned Speaker 129 export.

## Preview

From this folder run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. A web server is required because the page loads JSON with `fetch()`.

## Replace placeholders

- Edit the title, authors, institutions and abstract directly in `index.html` (they are also `contenteditable` in the browser for quick mock-up editing).
- Replace the GitHub and Paper URLs in `index.html`.
- Replace `assets/method-placeholder.svg` with the final method figure, keeping the filename, or update the CSS URL.
- Add four environmental reconstruction pairs under `audio/environment/`, named `case-1-reference.wav` / `case-1-generated.wav` through `case-4-reference.wav` / `case-4-generated.wav`. Missing files are intentional placeholders.

## Data layout

- `audio/same-speaker/`: Speaker 129, fixed text, seven accent conditions.
- `audio/same-speaker/speaker-129-reference.wav`: reference voice shown above the seven accent conditions.
- `audio/same-speaker/accent-prompt_*.wav`: original accent prompts paired with the seven generated outputs.
- `audio/refs/`: speaker and accent reference recordings from the retained set.
- `audio/systems/ours/`: generated samples used by the speaker-control and cross-accent sections.
- `audio/systems/{diffusion_TTS,accentbox,dart,ours}/`: outputs used by the 39-case model comparison panel.
- `data/retained_samples_39.json`: metadata for all 39 retained samples.

The page intentionally displays only the `ours` system. The source JSON retains paths for all systems if comparison rows are needed later.
