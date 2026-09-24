# Contributing

This atlas is only useful if it stays honest and current. Three ways to help:

1. **Propose an idea.** Open an issue with the *New idea* template. A rough idea is fine. Say which tier you think it belongs in and why.
2. **Challenge a card.** If a Whitespace idea already exists, or a Moonshot turned buildable because of a new iOS release, open an issue or a PR that moves it and links the evidence.
3. **Fix facts.** APIs, policies, and products change every WWDC. Corrections with a source link are always welcome.

## How the repo is built

Everything under `ideas/`, the index tables in `README.md`, and the charts in `assets/charts/` are generated from one file, [`data/ideas.json`](data/ideas.json).

```bash
python3 scripts/build.py          # regenerate cards, index, charts, README tables
python3 scripts/build.py --check  # validate the data and fail if outputs are stale (CI runs this)
```

Edit the JSON, run the script, and commit both. Don't hand-edit a generated card; your change will be overwritten.

## The idea schema

| Field | What goes in it |
|---|---|
| `id` | `B-nn` (Being built now), `W-nn` (Whitespace), or `M-nn` (Moonshot). Never reuse an ID; if an idea moves tier, give it the next free ID in the new tier and note the old one in `moved_from`. |
| `slug` | kebab-case, used in the file name |
| `title`, `tagline` | A name and a single sentence a stranger understands |
| `tier` | `building-now`, `whitespace`, or `moonshot` |
| `category` | One of the categories listed in `scripts/build.py` |
| `moment` | A concrete scene where the agent earns its keep. Second person, present tense. |
| `problem` | The job to be done and why today's apps fail at it |
| `loop` | The agent loop: `trigger`, `senses`, `decides`, `checks_with_you`, `acts`, `remembers`. Short phrases; they become a diagram. |
| `ios_blocks` | The real iOS frameworks it would use, each with `name` and `why` |
| `hard_parts` | What makes it hard. Be specific about platform walls. |
| `risks` | How it fails or hurts someone |
| `assumptions` | What the idea quietly depends on being true |
| `unknowns` | Open questions nobody has answered |
| `prior_art` | Products, papers, or repos, each with `name`, `url`, `note`. For Whitespace ideas, list the nearest things and say why they fall short. |
| `first_version` | The smallest version worth shipping |
| `scores` | Integers 1–5: `difficulty`, `novelty`, `feasibility` (on iOS today), `impact` |
| `horizon` | `now`, `1-2y`, `3-5y`, or `5y+` |
| `autonomy` | `suggest`, `draft-approve`, `act-report`, or `autonomous` (see the autonomy ladder in the README) |

## Scoring guide

- **Difficulty**: 1 is a weekend with App Intents and a hosted model. 5 needs research breakthroughs, platform changes, or partnerships you can't count on.
- **Novelty**: 1 means many apps already do this well. 5 means you can't find anyone doing it.
- **Feasibility on iOS today**: 5 means every API exists and App Review would likely approve it. 1 means iOS blocks it outright.
- **Impact**: How much better life gets for the people it serves, weighted by how many people that is.

Scores are judgment calls. When you disagree with one, say why in the PR.
