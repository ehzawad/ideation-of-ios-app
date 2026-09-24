# Preface

Picture a friend's living room. There is a speaker on the shelf, and you want the playlist from last night to play on it. On a phone today you unlock, find Settings, open Bluetooth, wait for the list to fill, tap the speaker, go back to the home screen, open the music app, find the playlist, start it, then find the output picker and choose the speaker. None of these steps is hard. There are just a lot of them, each on a screen owned by some app and laid out for someone who already knows where things live. The phone knows the speaker's name and last night's playlist. It still makes you walk the whole route.

This book is about a phone where you say "play last night's playlist on that speaker," the phone asks one question ("Pair the JBL Flip 6? It can reconnect later without asking."), and the music starts. The exchange stays on screen as a record, with a button to undo.

## Why the phone feels static

The front door of a phone is a grid of icons. Each icon is a separate program with its own screens, settings and idea of who you are. The grid is the unit of nearly everything: installing, granting permissions, paying, branding, competing for attention. To get something done, you translate a goal into an app, the app into a screen, and the screen into taps. The phone is fast at each step and has no idea what the steps are for.

That is what "static" means here. The screens don't rearrange themselves around what you are trying to do. You rearrange yourself around the screens. Widgets, Control Center and Spotlight shave steps off, but they are shortcuts through the same map.

## The Siri bottleneck

Voice assistants were supposed to be the way out. Apple introduced Siri as a beta on the iPhone 4S in October 2011 ([Apple](https://www.apple.com/newsroom/2011/10/04Apple-Launches-iPhone-4S-iOS-5-iCloud/)). Fifteen years later, the main frustration is structural, and speech recognition is no longer the hard part.

An assistant on today's phone is a guest in a system built for apps. It can do only what the system and apps have exposed to it, and every exposure had to be designed ahead of time. SiriKit, introduced in iOS 10, let apps handle a set of standard intents "such as playing music or sending a text message," with sample code for rides, payments and workouts ([Apple](https://developer.apple.com/documentation/sirikit)). Siri Shortcuts arrived in iOS 12: apps "donate" actions the user has performed so Siri can suggest them ([Apple](https://developer.apple.com/documentation/sirikit/donating-shortcuts), [INVoiceShortcutCenter](https://developer.apple.com/documentation/intents/invoiceshortcutcenter)). App Intents, from iOS 16, let any app declare its actions and data in a structured way for Siri, Spotlight, Shortcuts and widgets ([Apple](https://developer.apple.com/documentation/appintents)). Each step widened the door. The house stayed the same shape: the app remains the unit, and the assistant reaches into it.

Some limits are written into the platform. Apple's documentation says "only the user can directly set the system volume" ([AVAudioSession](https://developer.apple.com/documentation/avfaudio/avaudiosession/outputvolume)). There is no public API to turn Bluetooth or Wi-Fi on or off, and apps are sandboxed, so one app can't read or operate another app's interface ([App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)). Those rules exist for good reasons. They also mean no third-party agent on an iPhone can do everyday things this book starts from, such as changing the headphone level or connecting to Bluetooth.

Apple's own attempt to go further shows how hard the problem is. At WWDC in June 2024 it promised a Siri with personal context that could act in and across apps through App Intents. In March 2025 it said the work would take "longer than we thought" and pulled the features ([MacRumors](https://www.macrumors.com/2025/03/07/apple-intelligence-siri-features-delayed/)). Last week, on September 14, 2026, iOS 27 shipped Siri AI as an English (US) beta: a chat-style app with a text box and conversation history, personal context across Messages, Mail and Photos, and actions in and across apps through App Intents ([Apple](https://www.apple.com/newsroom/2026/09/siri-ai-a-profoundly-more-capable-and-personal-assistant-is-here/)). It is a real step. It is also still an assistant on top of the grid, reaching into apps one declared action at a time.

So the bottleneck is architectural. The phone's unit of action is still an app screen, and the assistant is attached to the side of the system instead of sitting at its center.

## What this book is

This book designs the alternative from the ground up. We call it **the agentic phone**. Its home screen is **the Line**: one continuous conversation you type or talk into, where replies, results and controls appear inline. Apps become **capability packs**, signed bundles of **capabilities**: typed, declared actions such as `audio.setVolume` or `alarms.create` that the agent can call, each with a schema, an **effect class** (read, reversible, consequential or irreversible), an undo or compensation, and the **cards** that display its results. A pack can also bring a **surface**, a full-screen app-drawn UI for work that needs one, like a game or turn-by-turn navigation. Between the model that plans (the **planner**) and every capability sits **the Gate**, deterministic code that returns allow, ask or deny from the effect class, your chosen **mode** and your standing **grants**. Everything that happens is written to a **ledger**, with an Undo wherever undo is possible.

It is speculative design, grounded in research. Nobody ships this phone, and no one has the whole stack. Each piece has precedent, though: typed action registries (App Intents, Android AppFunctions, MCP), supervised agents that operate apps (Gemini's screen automation), permission modes and checkpoints from coding agents such as Claude Code and Codex, and prompt-injection defenses from security research. The book's argument is that these pieces, arranged around a conversation instead of a grid, make a phone that is buildable in principle. It tries to say how, what it costs, and where it could go wrong.

The research lives in four files in [`agentic-os/research/`](../research/): 38 products and prototypes, 43 architecture items, 43 interaction-design items and 33 items on how to build it, each with sources and a confidence rating. Claims about the real world are cited inline. Where the evidence is a single report, the text says "reportedly." Where it is thin, the text says that too.

## What this book isn't

- **A product announcement or a leak.** It says nothing about Apple's or anyone's plans.
- **A prediction that apps disappear.** Every "app-less" phone concept so far kept an app drawer or shipped as an ordinary phone with an assistant on top ([Chapter 1](01-the-case.md)). The agentic phone demotes apps to surfaces you open when you need them.
- **A gesture design.** Gesture is out of scope. The Line is text and voice, plus cards you can tap and drag.
- **A claim that the model can be trusted.** The design assumes the planner will sometimes be wrong and sometimes be steered by hostile content, and puts deterministic code around it.
- **Finished.** Every chapter ends with the assumptions it depends on and the questions nobody can answer yet.

## How to read it

The chapters build on each other, but you can enter anywhere.

| If you want... | Read |
|---|---|
| The idea in an hour | This preface, [Chapter 3](03-a-day.md) (a day with the phone), [Chapter 4](04-the-line.md) (the Line) |
| The history and why now | [Chapter 1](01-the-case.md) |
| The design rules | [Chapter 2](02-principles.md) |
| Interaction design | Chapters [4](04-the-line.md), [7](07-cards.md) (cards) and [8](08-voice.md) (voice) |
| The system underneath | Chapters [5](05-architecture.md) (architecture), [6](06-capabilities.md) (capabilities), [10](10-memory.md) (memory), [11](11-models.md) (models) and [Appendix A](appendix-a-manifest.md) |
| Safety | [Chapter 9](09-trust.md), the longest in the book |
| The business | [Chapter 12](12-developers.md) (developers and the economy) |
| Building something now | [Chapter 13](13-building-it.md) and [Chapter 14](14-the-simulator.md) |
| What remains unsolved | [Chapter 15](15-open-problems.md) |

A few conventions. Transcripts of the Line look like a coding-agent terminal: `›` is what you said, `●` is a capability call with its result under `└`, `◆` marks a request for your approval, and `[Undo]` is the undo button on a receipt. When the text describes something that exists, it cites a source. When it describes the book's design, it says so ("In the agentic phone, the Gate...") and tries to name the cost.

The four effect classes come up everywhere, so here they are once:

| Effect class | Example | What the Gate needs |
|---|---|---|
| Read | Check tomorrow's calendar | Nothing. Reads run. |
| Reversible | Set an alarm, change the volume | Runs in Auto mode and reports, with Undo |
| Consequential | Send a message, pair a device | Asks, unless you are in Autopilot and have a grant |
| Irreversible | Pay someone, delete for good | Always asks, with Face ID, in every mode |

## The simulator

This book comes with a working prototype. [The simulator](../prototype/) is a web page that runs the Line in a browser; open `index.html`. A live version runs as a claude.ai artifact, where a real model does the planning.

It implements 26 system capabilities with effect classes (volume, ringer, brightness, Bluetooth including pairing, Wi-Fi, airplane mode, Focus, alarms, timers, flashlight, Low Power Mode, media, calendar, reminders, messages, calls, Wallet payments with a per-payment cap, weather, device status), the Gate with three modes and grants, a ledger with per-action Undo and a checkpoint per request, and cards bound to live state. An offline rule-based planner and a live model planner call the same capabilities through the same Gate. It accepts voice through the browser's speech recognition and simulates incoming events: a low battery, AirPods connecting, a message from Mom, and a message carrying a prompt-injection attempt that the Line treats as data.

Try "Set an alarm for sleep" (it reads tomorrow's calendar, picks a wake time, and says why), "Change the headphone level" (it hands you a slider instead of guessing), "Connect to Bluetooth" (it asks which device), and "Pay Sam $20 for pizza" (a Face ID card with your $50 cap). Then switch to Ask me mode, try again, and undo something from the ledger.

The device state is fake; no real radio or bank is involved. The offline planner is deliberately small. [Chapter 14](14-the-simulator.md) walks through it, and the other chapters point at it when a design idea is easier to try than to read about.

## Sources

- Apple Newsroom, "Apple Launches iPhone 4S, iOS 5 & iCloud" (Oct 4, 2011): https://www.apple.com/newsroom/2011/10/04Apple-Launches-iPhone-4S-iOS-5-iCloud/
- Apple Developer, SiriKit: https://developer.apple.com/documentation/sirikit
- Apple Developer, Donating Shortcuts: https://developer.apple.com/documentation/sirikit/donating-shortcuts
- Apple Developer, INVoiceShortcutCenter: https://developer.apple.com/documentation/intents/invoiceshortcutcenter
- Apple Developer, App Intents: https://developer.apple.com/documentation/appintents
- Apple Developer, AVAudioSession outputVolume: https://developer.apple.com/documentation/avfaudio/avaudiosession/outputvolume
- Apple, App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- MacRumors, "Apple Delays Siri Features" (Mar 7, 2025): https://www.macrumors.com/2025/03/07/apple-intelligence-siri-features-delayed/
- Apple Newsroom, "Siri AI... is here" (Sept 2026): https://www.apple.com/newsroom/2026/09/siri-ai-a-profoundly-more-capable-and-personal-assistant-is-here/
