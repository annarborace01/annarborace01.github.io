# Raffle Picker

Single-page raffle website with two modes:

- Number Mode: wheel spin with `Space` hold/release behavior.
- Text Mode: scratch card reveal with random text selection.

## Run

Open `/Users/xipengwang/projects/games/raffle_tickets/index.html` directly in a browser.

Or use a local static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Number Mode

- Enter integer `Min` and `Max`, then click `Apply Range`.
- Focus the wheel and hold `Space` to spin.
- Release `Space` to slow down and stop.
- Selected number is removed from future spins and shown in `Removed Numbers`.

## Text Mode

- Enter options in textarea, one per line.
- Click `Apply Options` to validate and save options.
- Click `Reset Scratch Card` to pick a random option and reset the covered card.
- Scratch the gray card with mouse or touch to reveal the selected text.
- Selected text is not removed from the option list.

## Rules

- Number range is inclusive (`min` through `max`) and must contain 2 to 500 values.
- Text mode requires at least 2 options and at least 2 distinct options, max 500.
- Data is session-only and resets on refresh.
