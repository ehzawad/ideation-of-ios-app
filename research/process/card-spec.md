# Idea card spec (for card-writer agents)

You are writing entries for a public GitHub "idea atlas" of AGENTIC iPhone apps (iOS only; Watch/AirPods/Vision Pro/CarPlay only as extensions of an iPhone app). Today is 2026-09-24. "Agentic" = the app plans and takes multi-step actions toward a goal for the user (tool use, API calls, App Intents, background work, monitoring, negotiating), not just chat.

Three tiers:
- `building-now` (IDs `B-nn`): categories of agentic iPhone apps that are shipping or clearly in active development in 2025–2026. Name real products in prior_art.
- `whitespace` (IDs `W-nn`): feasible on today's iPhone with today's APIs and models, but almost nobody is building it (or only in a weak form). prior_art must list the NEAREST existing things and say exactly why they fall short. If you discover a real product that already does this well, say so in your notes so it can be re-tiered.
- `moonshot` (IDs `M-nn`): worth wanting but genuinely hard: blocked by iOS platform walls, trust/liability, unsolved research, hardware, or regulation. Say which wall.

## Hard rules
1. Facts must be real. Only name iOS frameworks/APIs that exist (as of iOS 26/27). If unsure about an API, check developer.apple.com via WebSearch/WebFetch (load them with ToolSearch "select:WebSearch,WebFetch"). Never invent products, companies, papers, URLs, prices, or statistics. Every prior_art URL must be one you actually saw in search results or opened.
2. Be honest about iOS walls: third-party apps cannot read SMS/iMessage, cannot read other apps' screens or drive their UI, cannot run indefinitely in the background, cannot access Mail.app data, cannot answer/record calls silently, etc. If an idea depends on a wall, say so in hard_parts and pick a workaround (App Intents, Shortcuts automations, share sheet, email forwarding address, OAuth to Gmail/Outlook APIs, notifications, Live Activities, BGContinuedProcessingTask, a server-side agent + push, etc.).
3. Plain, concrete language. No hype words ("revolutionary", "seamless", "leverage", "unlock", "empower", "game-changing"). Write for a smart builder who has never heard of the idea. Short sentences.
4. Respect people: no dark patterns, no surveillance of others without consent; for health/finance/legal/kids, name the safety line in risks.

## JSON shape (one object per idea)
```json
{
  "id": "W-07",
  "slug": "kebab-case-name",
  "title": "Short name (2-5 words)",
  "tagline": "One sentence a stranger understands, <= 110 chars.",
  "tier": "building-now | whitespace | moonshot",
  "category": "one of: Life admin | Money & commerce | Health & body | Mind & focus | Family & care | Work & business | Learning & memory | Physical world | Social & communication | Accessibility | Safety & civic | Creativity & media",
  "moment": "2-4 sentences, second person, present tense: a concrete scene where the agent earns its keep.",
  "problem": "2-4 sentences: the job to be done and why today's apps fail at it.",
  "loop": {
    "trigger": "<= 45 chars, what starts a run",
    "senses": "<= 45 chars, what it reads",
    "decides": "<= 45 chars, what it reasons about",
    "checks_with_you": "<= 45 chars, where the human approves (or 'Nothing: acts within set limits')",
    "acts": "<= 45 chars, what it does",
    "remembers": "<= 45 chars, what it keeps for next time"
  },
  "ios_blocks": [{"name": "Real framework/API name", "why": "what it's used for, one clause"}],
  "hard_parts": ["2-4 specific bullets"],
  "risks": ["2-3 specific bullets"],
  "assumptions": ["2-3 unsaid assumptions this idea quietly depends on"],
  "unknowns": ["2-3 open questions nobody has answered"],
  "prior_art": [{"name": "Product/paper/repo", "url": "https://...", "note": "what it does / why it falls short"}],
  "first_version": "2-3 sentences: the smallest version worth shipping.",
  "scores": {"difficulty": 1, "novelty": 1, "feasibility": 1, "impact": 1},
  "horizon": "now | 1-2y | 3-5y | 5y+",
  "autonomy": "suggest | draft-approve | act-report | autonomous",
  "notes_for_editor": "optional: anything uncertain, re-tier suggestions, or facts you could not verify"
}
```

## Scoring guide (integers 1-5)
- difficulty: 1 = a weekend with App Intents and a hosted model; 3 = a funded small team for a year; 5 = needs research breakthroughs, platform changes, or partnerships you can't count on.
- novelty: 1 = many apps already do this well; 3 = some attempts, none good; 5 = you can't find anyone doing it.
- feasibility (on iOS today): 5 = every API exists and App Review would likely approve; 3 = needs workarounds (server-side agent, email forwarding, manual steps); 1 = iOS blocks it outright.
- impact: how much better life gets for the people served, weighted by how many.
Consistency expectations: building-now ideas usually have novelty 1-2; whitespace usually novelty 4-5 and feasibility 3-5; moonshots usually difficulty 4-5 and feasibility 1-3.

## Autonomy ladder
- suggest (L1): points something out; you act.
- draft-approve (L2): does the work; you approve before anything leaves the phone.
- act-report (L3): acts inside limits you set (spend caps, allowlists), reports after, with undo.
- autonomous (L4): owns a long-running goal for days or weeks.

## Tools and extra rules for card writers (added)
- Verify every iOS framework/API name you put in `ios_blocks` with the repo's doc tool: `python3 /home/user/ideation-of-ios-app/scripts/appledoc.py <path>` (e.g. `appintents/longrunningintent`, `activitykit`, `healthkit`, `foundationmodels/privatecloudcomputelanguagemodel`, `financekit`, `eventkit`, `callkit`, `visualintelligence`). Exit code 2 means it doesn't exist. Use `--search <framework> <word>` to find names. Prefer naming frameworks (e.g. "HealthKit", "ActivityKit (Live Activities)") plus one or two specific APIs where they matter.
- `ios_blocks` names should be accurate for iOS 27. Apple's per-framework "what's new" notes are in /tmp/claude-0/-home-user-ideation-of-ios-app/a4bf8afe-dfe0-5e4c-8040-f570940c25ed/scratchpad/updates/<framework>.md.
- Web search budget is tiny. Only use prior_art URLs that appear in the candidate JSON, the research digest, or that you verified.
- For ideas marked FLAGSHIP, add a `deep_dive` field: markdown (400–700 words) with a `## Deep dive` heading, one Mermaid `sequenceDiagram` showing the end-to-end flow across the phone, the agent, and outside parties (quote all labels; no notes; no emojis), and 2–3 short subsections: "What the first 90 days look like", "The hardest engineering problem", "How it makes money". Also add `why_flagship` (copy from the task).
- Add `related` (list of 1–3 other IDs from the manifest that are closely related), and keep `mockup` out (the editor adds it).
- If a candidate has merge sources, fold their best ideas into the card and note merged titles in `notes_for_editor`.
