# Ideator brief

You generate candidate ideas for a public GitHub "idea atlas" of AGENTIC iPhone apps (iOS only; Watch / AirPods / Vision Pro / CarPlay / Meta glasses only as extensions of an iPhone app). Today is 2026-09-24.

Before generating, read these two files completely (the digest is long; read it in chunks with offset/limit):
1. /tmp/claude-0/-home-user-ideation-of-ios-app/a4bf8afe-dfe0-5e4c-8040-f570940c25ed/scratchpad/RESEARCH_DIGEST.md  (what exists, what iOS 26/27 allows, walls, demand signals)
2. /tmp/claude-0/-home-user-ideation-of-ios-app/a4bf8afe-dfe0-5e4c-8040-f570940c25ed/scratchpad/CARD_SPEC.md  (tiers, iOS walls, scoring, autonomy ladder)

## Quality bar
- Specific and surprising beats generic. "AI assistant for X" is not an idea. Name the exact job, the moment, the actions, where it stops to ask.
- Every idea must be genuinely AGENTIC on iPhone: it plans and takes multi-step actions for the user.
- At least a third of your ideas should be things most builders have not thought about yet: new user groups, second-order effects of agents (agents dealing with other agents, agents creating new problems another agent solves), inverted roles, unglamorous chores, institutions that already use AI against consumers.
- Be honest about iOS walls (see CARD_SPEC). A great whitespace idea routes around the walls (App Intents, Shortcuts, Live Activities, email-forwarding addresses, OAuth to web APIs, cloud telephony, server-side agents with push, Visual Intelligence, HealthKit, EventKit, FinanceKit, Foundation Models/PCC, Messages for Business...).
- Moonshots must name the specific wall that makes them hard (platform, trust/liability, research, hardware, regulation) and what would have to change.
- You may run a FEW web searches (load with ToolSearch "select:WebSearch") to check whether an idea already exists; the search budget is small (about 12 per agent), so use them on your most novel ideas. If you find a real product that already does it well, drop the idea or re-tier it as building-now and say so.

## Output
Write a JSON array to the output path given in your task. Each element:
{
  "title": "2-5 words",
  "tagline": "one sentence, <= 110 chars",
  "tier": "building-now | whitespace | moonshot",
  "category": "Life admin | Money & commerce | Health & body | Mind & focus | Family & care | Work & business | Learning & memory | Physical world | Social & communication | Accessibility | Safety & civic | Creativity & media",
  "moment": "2-3 sentences, second person, present tense",
  "what_it_does": ["3-5 concrete actions the agent takes, including where it asks the user"],
  "why_now": "what changed in 2025-2026 that makes this possible or urgent",
  "why_nobody_yet_or_wall": "whitespace: why nobody built it yet; moonshot: the specific wall; building-now: who is building it",
  "ios_hooks": ["real iOS frameworks / surfaces"],
  "nearest_existing": ["names of nearest products/research, with a URL if you saw one"],
  "unsaid_assumption": "one thing this idea quietly assumes is true",
  "rough_scores": {"difficulty": 1-5, "novelty": 1-5, "feasibility": 1-5, "impact": 1-5},
  "surprise": "one sentence: why this is non-obvious (or 'obvious but important')"
}
Validate the JSON parses (python3 -c "import json;json.load(open(PATH))"). Your final message: the path and the count.
