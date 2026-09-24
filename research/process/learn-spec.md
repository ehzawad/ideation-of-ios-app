# Learning hub spec (for chapter-writer agents)

You are writing one chapter of a public learning hub inside the GitHub repo at /home/user/ideation-of-ios-app (folder `learn/`). Today is 2026-09-24. iOS 27 shipped on September 14, 2026 with Xcode 27 and **Swift 6.4**.

## The reader and the promise
The reader wants, in **7 days**, the *mental model* an iOS developer builds over ~5 years: how the platform thinks, which APIs matter, why things are designed the way they are, what bites you in production, and where Apple is heading (Apple Intelligence, Siri AI, on-device ML, Liquid Glass, Metal 4). Assume a capable programmer who knows at least one other language well and may be new to Swift and iOS. They have limited time: every paragraph must earn its place.

**Target iOS 27 only. No backward compatibility.** Use only current APIs: `@Observable` (not `ObservableObject`/`@StateObject`), `NavigationStack` (not `NavigationView`), async/await (not completion handlers), Swift Testing (`@Test`, `#expect`) for new tests, SwiftData for new persistence, App Intents (not SiriKit), Foundation Models for on-device LLMs, Metal 4 (`MTL4...`) for new Metal code. A senior also *recognizes* legacy code, so each chapter may include one short "Legacy you'll still meet" box that names old patterns and their modern replacement, without teaching them.

## Hard accuracy rules (most important)
1. **Verify every API before you use it** with the repo's doc tool:
   `python3 /home/user/ideation-of-ios-app/scripts/appledoc.py <path>`  e.g. `foundationmodels/languagemodelsession`, `swiftui/view/glasseffect(_:in:)`, `appintents/longrunningintent`, `metal/mtl4commandqueue`.
   It prints the declaration, platforms with the iOS version that introduced it, and child topics with their paths. Exit code 2 = the page does not exist (so the API name is wrong). Use `--search <framework> <word>` to find symbols. Paths are lowercase; method paths include argument labels like `respond(to:options:)`.
2. Only use symbols you verified exist and are available on iOS ≤ 27.0. Match their real signatures (argument labels, async/throws). If you can't verify something, don't write it.
3. Code must be idiomatic Swift 6.4 that would compile in Xcode 27 with strict concurrency. Keep code blocks short (5-40 lines), complete enough to understand, with no placeholder APIs. Prefer Apple's own documented usage patterns (the doc pages contain code samples; adapt them).
4. Never invent WWDC session numbers, dates, numbers, or quotes. Link to developer.apple.com pages you actually fetched (use the "URL:" line appledoc prints). Web search is limited; don't rely on it. developer.apple.com is fully reachable through appledoc.
5. At the end of the chapter, include a collapsed "Verified APIs" list: each symbol with the iOS version appledoc reported.

## Source pack (read what's relevant to your chapter first)
Folder: /tmp/claude-0/-home-user-ideation-of-ios-app/a4bf8afe-dfe0-5e4c-8040-f570940c25ed/scratchpad/updates/
- `<framework>.md`: Apple's "What's new" notes per framework, newest first (June 2026 = iOS 27; September 2026 = iPhone Duo / iOS 27 additions). E.g. swiftui.md, uikit.md, foundationmodels.md, appintents.md, swiftdata.md, speech.md, vision.md, coreml.md, apple-intelligence.md, visualintelligence.md, xcode.md, accessibility.md, backgroundtasks.md, usernotifications.md, activitykit.md, widgetkit.md, storekit.md, security.md, authenticationservices.md, healthkit.md, passkit.md, foundation.md, network.md, metrickit.md, swift.md, realitykit.md, arkit.md, symbols.md, tipkit.md, swiftcharts.md, corespotlight.md...
- `doc_*.md`: converted Apple doc pages (Liquid Glass overview and adoption guide, HIG and materials, Metal 4 core API / triangle / ML passes / compilation API, Foundation Models overview / context window / PCC / generating content / tool calling, App Intents overview).
- Background on the agentic-app landscape (optional): /home/user/ideation-of-ios-app/docs/*.md

## Chapter structure (use these headings, in order)
```
[← Learning hub](README.md)

# Day N · <Title>
> <One sentence: what you'll understand by tonight.>  **Time:** ~6–8 hours.

## Today's map
(one Mermaid diagram showing how today's concepts connect)

## Mental models
(4–7 models. Each: a bold one-line model, 1–3 short paragraphs explaining the *why*, optionally a small diagram, and "**Senior tell:**" one sentence on how experienced devs apply it.)

## The APIs that matter
(Table: API | What it's for | Since | Link. Group rows into "Everyday", "Intermediate", "Advanced". 20–40 rows.)

## Core patterns in code
(3–7 short verified code blocks, each introduced by one sentence and followed by 1–3 bullets on what to notice.)

## What's new in iOS 27 (and what old tutorials get wrong)
(bullets, from the update notes)

## Pitfalls you only learn by shipping
(6–10 bullets: symptom → cause → fix)

## Legacy you'll still meet
(short table: Old → New, no teaching)

## Practice
(3–5 exercises, each with "Done when:" criteria. The last one is today's step of the capstone app — see below.)

## Check yourself
(6–8 questions; answers inside <details><summary>Answer</summary>...</details>)

## Go deeper
(5–10 links to developer.apple.com pages you fetched: articles, sample code, HIG pages)

<details><summary>Verified APIs</summary>
(symbol — iOS version, one per line)
</details>
```

## Capstone thread
Across the 7 days, the reader builds one small agentic app, **"Errand"**: you describe an errand ("renew my library books before Friday", "find a plumber for Saturday"), the app breaks it into steps with the on-device model, tracks them, exposes them to Siri and Shortcuts through App Intents, shows progress in a Live Activity, asks for approval before any side effect, and has one custom Metal-rendered visual (e.g., a progress ring shader or background). Your chapter's last Practice item is that day's step. Keep it achievable in ~1.5 hours.

Day steps: 1 = Swift model types + an actor-isolated task store with tests; 2 = SwiftUI screens with Liquid Glass, navigation, accessibility; 3 = SwiftData persistence, notifications, a BGContinuedProcessingTask for batch work; 4 = App Intents + app entities + an interactive snippet + a Live Activity + a Control; 5 = Foundation Models planner with @Generable output, a tool, PCC fallback, consent screen; 6 = a Metal 4 (or SwiftUI shader) progress visual; 7 = Swift Testing suite, Instruments pass, App Review checklist, TestFlight.

## Style
- Plain, direct English. Short sentences. Explain each term the first time. No hype words (seamless, powerful, leverage, unlock, robust, delve).
- Diagrams: Mermaid that renders on GitHub (flowchart / sequenceDiagram / stateDiagram-v2 / classDiagram / timeline). Put all labels in double quotes. Avoid parentheses and special characters inside unquoted labels. No emojis in diagrams.
- Tables over long lists when comparing.
- Length: aim for 4,000–7,000 words per day chapter (the mental-models chapter: 5,000–8,000).
- Write the file(s) with the Write tool at the exact path given in your task. Don't run git.
- When finished, reply with the file path(s), word count, and a list of any facts you could NOT verify.
