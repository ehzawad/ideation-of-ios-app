# Glossary

Terms used across the seven days, with the day that teaches each one.

[← Back to the plan](README.md)

[A](#a) · [B](#b) · [C](#c) · [D](#d) · [E](#e) · [F](#f) · [G](#g) · [H](#h) · [I](#i) · [J](#j) · [K](#k) · [L](#l) · [M](#m) · [N](#n) · [O](#o) · [P](#p) · [Q](#q) · [R](#r) · [S](#s) · [T](#t) · [U](#u) · [V](#v) · [W](#w) · [X](#x)

## A

**Access control** — Keywords that set who can see a declaration: `private`, `fileprivate`, `internal` (the default: the whole module), `package`, `public` and `open`. Only `public` symbols cross a module boundary, which is why local packages enforce an app's structure. *[Day 1](day1-swift-and-concurrency.md)*

**Accessibility label** — The name VoiceOver speaks and Voice Control listens for, set with `accessibilityLabel(_:)` or taken from a button's title. Every icon-only control needs one; the element's state goes in `accessibilityValue(_:)` and its kind in traits. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Actor** — A reference type (`actor`) whose mutable state only its own code can touch, one piece of work at a time; callers outside it `await`. Actors are reentrant: while one method is suspended at an `await`, other calls run on the actor, so re-check state after every `await`. *[Day 1](day1-swift-and-concurrency.md)*

**Adapter** — `SystemLanguageModel.Adapter`, an iOS 26-era way to customize the on-device model that older tutorials still show. It isn't in the iOS 27 reference (its page returns 404); to bring your own model, Apple now documents Core AI. *[Day 5](day5-apple-intelligence-and-ml.md)*

**App Attest** — `DCAppAttestService` lets your server check that a request comes from a genuine copy of your app on a real Apple device, using a Secure Enclave key that Apple attests and signed assertions on later requests. Put it in front of anything that costs you money, such as a proxy to a cloud model. *[Day 7](day7-ship-like-a-senior.md)*

**App entity** — A noun (`AppEntity`): a lightweight, identifiable version of one of your data objects, with a stable `id`, a `displayRepresentation` and a `defaultQuery`. The system can find, show and pass entities between actions without running your UI. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**App Group** — An entitlement that gives your app and its extensions a shared container: the SwiftData store, a `UserDefaults(suiteName:)` suite, files, and Keychain items with a shared access group. Extensions are separate processes and share nothing else with the app. *[Day 3](day3-data-lifecycle-system.md)*

**App intent** — A verb (`AppIntent`): a struct with a static `title`, inputs marked `@Parameter`, and a `perform()` method; an `AppEnum` covers fixed sets of choices. Write the intent once and Siri, Shortcuts, Spotlight, widgets, Controls, the Action button and your own buttons can all run it. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**App Review Guidelines** — Apple's rules for App Store apps, last updated June 8, 2026, which shape architecture and not only metadata. The ones that trip agentic apps are 2.1, 2.3, 2.5.2 (no downloaded code that adds features, so model output must be data for tools compiled into the app), 3.1.1, 4.2, 4.7, 5.1.1 and 5.1.2(i). *[Day 7](day7-ship-like-a-senior.md)*

**App schema** — An Apple-defined shape for a common action, entity or enum, such as "create a reminder," grouped into domains such as mail and photos (iOS 27 adds audio, calendar, clock, maps, messages, notes, phone and reminders). Conform with `@AppIntent(schema:)`, `@AppEntity(schema:)` or `@AppEnum(schema:)` so Siri AI can map everyday requests to your code; the compiler checks the conformance. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**App Shortcut** — A preconfigured shortcut for one of your intents, declared in an `AppShortcutsProvider`, with phrases that must include your app's name. It works as soon as the app is installed, and each app can offer up to 10. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**App Store Connect** — Apple's portal where you upload builds, run TestFlight, fill in the privacy nutrition label and Notes for Review, and submit for App Review. It rejects uploads that use required-reason APIs without a declared reason. *[Day 7](day7-ship-like-a-senior.md)*

**App Transport Security (ATS)** — The system policy that requires HTTPS for your app's network connections. Exceptions weaken it, and some need a justification at App Store submission, so fix the server instead. *[Day 7](day7-ship-like-a-senior.md)*

**Apple Intelligence** — Apple's generative models and the features built on them. The system calls into your app through App Intents (Siri AI, Spotlight, visual intelligence) and adds Writing Tools and Genmoji to standard text views, while your code calls the models through Foundation Models on a supported device, such as an iPhone 15 Pro or later, with Apple Intelligence turned on. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Approachable Concurrency** — A build setting (`SWIFT_APPROACHABLE_CONCURRENCY`) that turns on a set of upcoming Swift features. The two that change behavior are `NonisolatedNonsendingByDefault` (a nonisolated `async` function runs on its caller's actor unless marked `@concurrent`) and `InferIsolatedConformances`. *[Day 1](day1-swift-and-concurrency.md)*

**`@AppStorage`** — A SwiftUI property wrapper for an app-wide preference stored in `UserDefaults`. It's for small, non-sensitive settings, and using it counts as using a required-reason API. *[Day 3](day3-data-lifecycle-system.md)*

**ARC (Automatic Reference Counting)** — Swift's memory management for reference types: every class instance, actor and closure has a count of owners, and when it reaches zero, `deinit` runs and the memory is freed at once. There's no garbage collector, so objects that own each other in a circle leak. *[Day 1](day1-swift-and-concurrency.md)*

**Argument buffer** — A Metal buffer that holds references to other resources (buffers, textures, samplers), so a shader can reach many resources through one binding. Day 6's renderer binds through argument tables instead; you'll meet argument buffers in Apple's Metal documentation and in bindless rendering code. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Argument table** — Metal 4's `MTL4ArgumentTable`: the resource bindings (buffer addresses, textures, samplers) a pass's shaders use, filled once and attached to encoders with `setArgumentTable`. Metal takes a snapshot of it at each draw or dispatch, and Metal 4 encoders have no `setVertexBuffer`-style binding methods. *[Day 6](day6-metal4-graphics-and-compute.md)*

**`async let`** — Starts a fixed number of child tasks in parallel, which the parent later awaits by name; leaving the scope early cancels any it didn't await. For a dynamic number of children, use a task group. *[Day 1](day1-swift-and-concurrency.md)*

**`AsyncSequence`** — Values that arrive over time, consumed with `for await`. `AsyncStream` turns callbacks or delegate events into one, and `Observations` turns changes to `@Observable` properties into one. *[Day 1](day1-swift-and-concurrency.md)*

**`await`** — Marks a suspension point: the task may pause there while other work runs, including other calls on the same actor, so the world can change before it resumes. Every call that crosses an isolation boundary needs one. *[Day 1](day1-swift-and-concurrency.md)*

## B

**Background Inference entitlement** — An iOS 27 entitlement (`com.apple.developer.background-tasks.continued-processing.inference`) that the system requires for any Neural Engine use while your app is in the background. It works with `BGContinuedProcessingTask`. *[Day 3](day3-data-lifecycle-system.md)*

**Background push** — A push with `content-available` that may wake your app for about 30 seconds. It's a hint, not a channel: the system throttles it past two or three an hour, keeps only the newest, and discards held ones after a force-quit. *[Day 3](day3-data-lifecycle-system.md)*

**Barrier** — A Metal 4 command that orders GPU stages, needed because Metal 4 treats every resource as untracked and ignores automatic hazard tracking. A consumer barrier, `barrier(afterQueueStages:beforeStages:visibilityOptions:)`, placed right before the pass that reads, makes it wait for earlier stages; a fence (`MTLFence`) orders two specific passes. *[Day 6](day6-metal4-graphics-and-compute.md)*

**`BGAppRefreshTask`** — A background task the system runs when it decides a refresh is useful, for up to 30 seconds. Only one refresh request can be pending at a time; in SwiftUI, handle it with `.backgroundTask(.appRefresh(_:))`. *[Day 3](day3-data-lifecycle-system.md)*

**`BGContinuedProcessingTask`** — An iOS 26 background task that must start from a person's action in the foreground and keeps running after they leave, showing its title, subtitle and progress in a Live Activity. The system can cancel it and ends tasks that show little progress first, so save and report progress after every item. *[Day 3](day3-data-lifecycle-system.md)*

**`BGProcessingTask`** — A background task for maintenance, such as rebuilding an index, that the system runs when it chooses, optionally only on power or with a network. Up to ten processing requests can be pending; in iOS 27, SwiftUI handles it with `.backgroundTask(.processingTask(_:))`. *[Day 3](day3-data-lifecycle-system.md)*

**`BGTaskScheduler`** — The Background Tasks class that registers task handlers and submits task requests. In iOS 27, `submit(_:)` is deprecated in favor of the async `submitTaskRequest(_:)`, which you shouldn't call from the main thread, and every identifier must be listed in `BGTaskSchedulerPermittedIdentifiers`. *[Day 3](day3-data-lifecycle-system.md)*

**Binding** — Borrowed read-write access to a value someone else owns: the child declares `@Binding var x`, and the owner passes `$x`. For bindings to an `@Observable` object's properties, use `@Bindable`. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Bundle ID** — Your app's unique reverse-DNS identifier, such as `com.example.errand`, set under Signing & Capabilities. With your team prefix it forms the App ID in a provisioning profile, and it's the usual `Logger` subsystem. *[Day 7](day7-ship-like-a-senior.md)*

## C

**Cancellation** — Cooperative in Swift: `cancel()` only sets a flag, and your code checks `Task.isCancelled` or calls `try Task.checkCancellation()`, while APIs like `Task.sleep` throw `CancellationError`. Cancelling a parent cancels its children, and Swift 6.4's `withTaskCancellationShield` (iOS 27) lets cleanup finish anyway. *[Day 1](day1-swift-and-concurrency.md)*

**Capture list** — The `[weak self]` or `[unowned self]` at the start of a closure, which stops it from owning what it uses. You need it for closures stored on `self` and tasks that never end, not for closures and tasks that finish. *[Day 1](day1-swift-and-concurrency.md)*

**CloudKit** — Apple's iCloud database and sync service, which SwiftData can sync through. It brings its own rules: relationships must be optional, unique constraints and the `.deny` delete rule aren't supported, and a schema promoted to production is additive only. *[Day 3](day3-data-lifecycle-system.md)*

**`Codable`** — The conformance that converts your types to and from formats such as JSON. The compiler writes `init(from:)`, `encode(to:)` and a `CodingKeys` enum for you; write `CodingKeys` yourself to rename fields. *[Day 1](day1-swift-and-concurrency.md)*

**Code signing** — The signature on your app that proves who built it and what it's allowed to do; the entitlements it claims must appear in the provisioning profile. Use automatic signing, and have more than one person able to manage the team account. *[Day 7](day7-ship-like-a-senior.md)*

**Command allocator** — Metal 4's `MTL4CommandAllocator`: the memory that encoded commands live in. Keep one per frame in flight, and reset it only after the GPU has finished every command buffer that used it. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Command buffer** — A recording of GPU work that the GPU runs later. In Metal 4, the device makes an `MTL4CommandBuffer` that you reuse every frame with `beginCommandBuffer(allocator:)` and commit in arrays to the queue, and it doesn't keep the resources it references alive. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Command queue** — Metal 4's `MTL4CommandQueue`: where you commit command buffers, and where the GPU waits for and signals drawables and events. It holds residency sets and replaces `MTLCommandQueue` in new code. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Composition root** — The one place, a thin app target, that picks the real services and wires them together. Everything else lives in local packages behind seams, so tests and previews can swap in fakes. *[Day 7](day7-ship-like-a-senior.md)*

**`@concurrent`** — Makes a nonisolated `async` function run on the concurrent thread pool, off its caller's actor. It's the named way to move CPU-heavy work off the main actor; prefer it to `Task.detached`. *[Day 1](day1-swift-and-concurrency.md)*

**Concurrent thread pool** — The limited set of threads where Swift runs nonisolated async work, also called the cooperative pool. Never block it with a semaphore, `DispatchQueue.sync` or a lock that waits for async work, or the app can freeze. *[Day 1](day1-swift-and-concurrency.md)*

**Context window** — The token budget of a language model session. Everything in it counts (instructions, every prompt and response, tool definitions and outputs, the schema of each `@Generable` type), and when it's full the session throws `LanguageModelError.contextSizeExceeded(_:)`; Private Cloud Compute's window is 32K tokens. *[Day 5](day5-apple-intelligence-and-ml.md)*

**`contextSize`** — `SystemLanguageModel.contextSize`, the on-device model's limit in tokens, which you read at runtime instead of hard-coding. Apple's documentation says 4,096 tokens per session, while the iOS 27 sample in WWDC26 session 241 prints 8,192, so treat 4,096 as the safe design target. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Continuation** — A bridge from a one-shot callback API to `async`, such as `withCheckedThrowingContinuation`, which must be resumed exactly once on every path. iOS 27 adds a noncopyable `Continuation` that rejects a second resume at compile time and traps if it's dropped without being resumed. *[Day 1](day1-swift-and-concurrency.md)*

**Control** — A button or toggle in Control Center, on the Lock Screen or on the Action button, built with `ControlWidget` in the widget extension and backed by an app intent. An `OpenIntent` that a control uses must belong to both the app and the extension. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**Copy-on-write** — Arrays, dictionaries, sets and strings share one buffer between copies until one copy is changed, and only then duplicate it. That's why passing and returning values is cheap. *[Day 1](day1-swift-and-concurrency.md)*

**Core AI** — An iOS 27 framework that runs your own neural networks, converted to `.aimodel` files, on the CPU, GPU and Neural Engine. The first load specializes the model for the device (slow once, then cached), and a language model exported this way can serve a `LanguageModelSession` through `CoreAILanguageModel`. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Core ML** — The long-standing framework for running your own models (`MLModel`), trained with Create ML or converted with Core ML Tools. It remains the path for non-neural models such as decision trees and tabular pipelines; modern neural networks go to Core AI. *[Day 5](day5-apple-intelligence-and-ml.md)*

## D

**Data race** — Two threads touching the same mutable memory at once, with at least one of them writing. The Swift 6 language mode turns possible data races into compile errors. *[Day 1](day1-swift-and-concurrency.md)*

**Deep link** — A URL that opens a specific screen, from a custom URL scheme or a universal link, delivered in SwiftUI to `onOpenURL(perform:)`. Handle it by setting navigation state, such as `path = [id]`, and treat every incoming URL as untrusted input. *[Day 3](day3-data-lifecycle-system.md)*

**Default Actor Isolation** — A build setting (`SWIFT_DEFAULT_ACTOR_ISOLATION`) that, set to `MainActor`, makes unannotated code in the module `@MainActor`. Swift packages opt in with `.defaultIsolation(MainActor.self)`; mark model, intent and entity types `nonisolated` when they must work off the main actor. *[Day 1](day1-swift-and-concurrency.md)*

**Device Hub** — Xcode 27's window for running your app on simulators and physical devices, mirroring device screens, and pairing iOS 27 devices over the network. *[Day 0](00-mental-models.md)*

**Dynamic profile** — `LanguageModelSession.DynamicProfile` (iOS 27): a session configuration that picks the model, instructions, tools and settings from app state, re-evaluated before every request. Lifecycle modifiers such as `onToolCall` let your code count, check or block tool calls. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Dynamic Type** — The system text-size setting, including the larger accessibility sizes. Built-in text styles such as `.body` (17 pt by default on iOS) and `.headline` follow it; scale your own spacing with `@ScaledMetric`, and change the layout rather than truncate at huge sizes. *[Day 2](day2-swiftui-liquid-glass-design.md)*

## E

**Entitlement** — A signed claim in your code signature for a capability such as iCloud, App Groups or Private Cloud Compute. Each claim must appear in the provisioning profile's allowlist, and *managed* entitlements need Apple's approval first. *[Day 0](00-mental-models.md)*

**Entity query** — How the system finds app entities (`EntityQuery`): by ID with `entities(for:)`, by the words someone said or typed with `EntityStringQuery.entities(matching:)`, or as suggestions with `suggestedEntities()`. Most "Siri didn't understand me" bugs are really "the query couldn't find the noun." *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**Environment** — SwiftUI's way to pass values and models down the view tree. An ancestor calls `.environment(model)` and a descendant reads `@Environment(Model.self)` (reading a model nobody set stops the app, so previews must inject one too); `@Entry` declares a custom environment value in one line. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Evaluations** — An iOS 27 framework that runs a dataset of `ModelSample`s through your AI feature, scores each response with code or a model judge, and aggregates the scores. It runs inside Swift Testing with `@Test(.evaluates(...))`, so a changed OS model shows up as a number in your tests. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Extension** — A separate process that shows part of your app elsewhere in the system, such as a widget, an App Intents extension, a share extension or a notification service extension. It has tight memory and time limits and shares data with the app only through an App Group. *[Day 0](00-mental-models.md)*

## F

**File protection** — The data protection class of a file (`FileProtectionType`). `.complete` can't be read while the device is locked; `.completeUntilFirstUserAuthentication`, the default for new files, can be read once the person has unlocked after a restart, which background work needs. *[Day 7](day7-ship-like-a-senior.md)*

**Foundation Models** — Apple's framework with one session API for language models: the on-device model, Private Cloud Compute, or any type that conforms to `LanguageModel`. It gives you typed output (guided generation) and tool calling. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Frames in flight** — The number of frames the CPU and GPU work on at once; three is usual: one on the display, one rendering on the GPU, one being encoded on the CPU. Anything the CPU writes every frame needs one copy per frame in flight and a wait on a shared event before reuse. *[Day 6](day6-metal4-graphics-and-compute.md)*

## G

**`@Generable`** — A Foundation Models macro that turns a Swift struct or enum into a schema the model must follow, so `respond(to:generating:)` returns an instance of your type. Properties are generated in declaration order, and their names and guides cost tokens. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Glass effect** — `glassEffect(_:in:)` applies Liquid Glass to a custom view, using the `regular` variant in a capsule by default. Use `clear` only over rich media such as photos and video, `.tint(_:)` to suggest prominence, and `.interactive()` so a custom control reacts to touch. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**`GlassEffectContainer`** — Groups custom glass shapes so they render faster, blend when they're close, and morph during animated changes when you give them `glassEffectID(_:in:)` values from one `@Namespace`. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Guardrails** — The on-device model's safety checks on input and output; tripping one throws `LanguageModelError.guardrailViolation`. `SystemLanguageModel.Guardrails` also has a permissive mode for transforming sensitive source text. *[Day 5](day5-apple-intelligence-and-ml.md)*

**`@Guide`** — Adds a short description or a hard constraint to a `@Generable` property: `.range` for numbers, `.count` or `.maximumCount` for arrays, `.anyOf` or a regex for strings. Descriptions become part of the schema and cost tokens, so try without guides first. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Guided generation** — Asking the model for a value of your own `@Generable` type instead of text. The framework uses constrained sampling, so the model can only produce tokens that fit your type; it guarantees shape, not truth, and a refusal arrives as a thrown `LanguageModelError.refusal(_:)`. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Guideline 5.1.2(i)** — The App Review rule to clearly disclose where personal data is shared with third parties, "including with third-party AI," and get explicit permission first. In practice, a consent screen that names the provider, lists what's sent, and appears before the first request. *[Day 5](day5-apple-intelligence-and-ml.md)*

## H

**Hang** — A noticeable delay after a tap, almost always from work on the main thread. Most of Apple's tools report one when the main run loop stays busy for more than 250 ms; fix hangs before hitches. *[Day 7](day7-ship-like-a-senior.md)*

**HIG (Human Interface Guidelines)** — Apple's design guidance on hierarchy, typography, color, symbols, spacing, motion, materials and accessibility. In June 2026 it reintroduced its design principles: purpose, agency, responsibility, familiarity, flexibility, simplicity, craft and delight. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**`HistoryObserver`** — An iOS 27 SwiftData type that watches for changes written elsewhere, such as by an extension, for the model types and authors you choose. It bumps its `eventCounter` as your cue to read persistent history. *[Day 3](day3-data-lifecycle-system.md)*

**Hitch** — A frame that isn't ready for its screen refresh, so an animation or scroll stutters. The budget is one refresh interval, generally 8 to 16 ms, and Xcode 27's Organizer has a Hitches metric. *[Day 7](day7-ship-like-a-senior.md)*

## I

**`IndexedEntity`** — An app entity that goes into your Spotlight index, which Siri also searches to find content "even when someone describes it vaguely." Index with Core Spotlight's `indexAppEntities(_:priority:)`; in iOS 27, `SpotlightSearchTool` lets a Foundation Models session search the same index. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**Info.plist** — Your app's property list of configuration the system reads before running your code, such as purpose strings, `BGTaskSchedulerPermittedIdentifiers`, `NSSupportsLiveActivities` and the scene manifest. *[Day 3](day3-data-lifecycle-system.md)*

**Instructions** — The trusted, developer-written guidance for a `LanguageModelSession`, which the model follows over prompts. Never put untrusted text (the person's input, web pages, tool output) in them; put it in the prompt, labeled as data. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Instruments** — Xcode's profiler. Its templates include Time Profiler, Hangs, SwiftUI, Allocations, Leaks, App Launch, Power Profiler, Foundation Models and Swift Executors; profile on a real device, and treat Foundation Models traces as user data, because they store prompts and responses unencrypted. *[Day 7](day7-ship-like-a-senior.md)*

**`IntentValueQuery`** — The query that answers visual intelligence searches: it takes a `SemanticContentDescriptor` (a few labels and a pixel buffer) and returns matching entities. An app has one such query, and an `OpenIntent` opens the result the person taps. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**iPhone Duo** — The foldable iPhone (September 2026), with a compact outer display and a large inner one that a partly folded hinge divides. It makes adaptive layout mandatory; its own APIs (`ArrangementView`, `ReservedRegion`, hinge state) are in the **iOS 27.1 beta**, and its simulator ships with the **Xcode 27.1 beta**. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Isolated conformance** — A protocol conformance usable only on one actor, such as `T: @MainActor P`. Default main-actor isolation makes a model's conformances main-actor-isolated, which causes "main actor-isolated conformance … cannot be used in nonisolated context"; mark the type `nonisolated` to fix it. *[Day 1](day1-swift-and-concurrency.md)*

**Isolation domain** — A region where code runs one piece at a time: the main actor, one actor instance, or a task's local variables. Crossing between domains takes `await`, and only `Sendable` values, or values the compiler can prove you handed over, may cross. *[Day 1](day1-swift-and-concurrency.md)*

## J

**Jetsam** — The system terminating apps to reclaim memory, most often apps in the background under memory pressure; an app that passes its own memory limit is terminated too. A jetsam event report has no backtrace, so lower your memory use at suspension and free caches in the background. *[Day 7](day7-ship-like-a-senior.md)*

## K

**Keychain** — Encrypted system storage for small secrets such as tokens, passwords and keys, used through `SecItemAdd`, `SecItemCopyMatching`, `SecItemUpdate` and `SecItemDelete`. Its `kSecAttrAccessible` attribute decides when an item is readable: the default, `kSecAttrAccessibleWhenUnlocked`, blocks background reads on a locked phone, so use `kSecAttrAccessibleAfterFirstUnlock` for items background work needs. *[Day 3](day3-data-lifecycle-system.md)*

## L

**`LanguageModel`** — An iOS 27 protocol that lets any model sit behind `LanguageModelSession`: `SystemLanguageModel`, `PrivateCloudComputeLanguageModel`, a model you run with Core AI or MLX, or a third party's server model. Instructions, tools and `@Generable` types stay the same when the model changes. *[Day 5](day5-apple-intelligence-and-ml.md)*

**`LanguageModelError`** — The iOS 27 error type for any model, with cases such as `.contextSizeExceeded`, `.guardrailViolation`, `.refusal` and `.rateLimited`. It replaces the deprecated `LanguageModelSession.GenerationError`, which old `catch` clauses stop matching once you rebuild with Xcode 27. *[Day 5](day5-apple-intelligence-and-ml.md)*

**`LanguageModelSession`** — One model context: instructions, a transcript of every prompt and response, and the requests you make with `respond` or `streamResponse`. It serves one request at a time, and short sessions, one per task, keep the context window small. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Launch** — Starting your process, as opposed to a resume, which wakes a process that's still in memory; a cold launch after eviction is the slowest. If launch takes too long, the watchdog ends the app, so do the minimum before the first frame. *[Day 7](day7-ship-like-a-senior.md)*

**Layout negotiation** — How SwiftUI layout works: the parent proposes a size, the child chooses its own size, and the parent places the child. A proposal can also be zero (the child's minimum), infinity (its maximum) or unspecified (its ideal size). *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Liquid Glass** — The iOS 26+ material for the functional layer (bars, tab bars, sidebars, controls) that floats above your content, blurring and reflecting what's behind it. Standard components adopt it when you build with the current SDK; keep it out of the content layer, and note there's no opt-out when you build for iOS 27. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Live Activity** — Live status for a task happening now, on the Lock Screen and in the Dynamic Island, built with ActivityKit (`ActivityAttributes`) and SwiftUI. It has no timeline: your app or server pushes updates, it stays active up to 8 hours plus up to 4 more on the Lock Screen, and its static and dynamic data together can't exceed 4 KB. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**LLDB** — Xcode's debugger. `v` reads values straight from memory without running code, while `p` and `po` (aliases for `dwim-print`) compile and run code when the expression needs it, and `po` prints the object's own description; Xcode 27 adds `language swift task tree` to list every Swift task. *[Day 7](day7-ship-like-a-senior.md)*

**Load action** — What a render pass does with an attachment's old contents at the start: `.load` copies the old image into tile memory, `.clear` fills tile memory with a color, and `.dontCare` does nothing. Loading what you don't need is wasted bandwidth. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Local package** — A Swift package inside your project that holds one feature or layer. The compiler enforces its boundary (only `public` symbols cross), it builds and tests on its own, and pure logic can run with `swift test` on a Mac. *[Day 7](day7-ship-like-a-senior.md)*

**`Logger`** — The `os` framework's structured logging, with a subsystem (usually your bundle ID) and a category. Interpolated strings and objects are redacted by default; mark only safe values `privacy: .public`, and never what a person typed. *[Day 7](day7-ship-like-a-senior.md)*

**`LongRunningIntent`** — An iOS 27 protocol that lets an app intent run past the 30-second background limit by wrapping its work in `performBackgroundTask(options:operation:)`. The extra time lasts only while you keep updating `progress`, which the system shows as a Live Activity; adopt `CancellableIntent` too to learn whether a cancel was `.userCancelled` or a `.timeout`. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**Low Power Mode** — A setting in which the system pauses discretionary and background activity. Check `ProcessInfo.processInfo.isLowPowerModeEnabled`, and at a `.serious` or `.critical` `thermalState`, cut optional work. *[Day 3](day3-data-lifecycle-system.md)*

## M

**Machine learning pass** — A Metal 4 pass that runs a Core ML model, converted to a Metal package, on the GPU timeline with `MTL4MachineLearningCommandEncoder`, reading and writing `MTLTensor`s. Barriers order it against compute and render passes, and the system may run it on the Neural Engine while the GPU does other work. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Macro** — Compile-time code generation that only adds code next to yours, such as `@Observable`, `@Model`, `@Generable`, `#Preview`, `#expect` and, in Xcode 27, `@State`. In Xcode, choose Expand Macro to read what it writes; you can set breakpoints there too. *[Day 1](day1-swift-and-concurrency.md)*

**Main actor** — The global actor for UI work (`@MainActor`), whose executor is the main queue; in practice, the main thread. SwiftUI's `View` protocol and UIKit's `UIView` are `@MainActor`. *[Day 1](day1-swift-and-concurrency.md)*

**Main thread** — The thread that owns the UI, modeled in Swift as the main actor. Anything slow on it is a bug people feel: a hang, a hitch, or at launch a watchdog termination. *[Day 0](00-mental-models.md)*

**Memoryless texture** — A texture with `MTLStorageMode.memoryless`, which exists only in tile memory and never gets system memory. Use it for depth, stencil or multisample attachments you don't read after the pass. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Metal 4** — The `MTL4` generation of Metal (iOS 26+), in which you declare residency, bindings (argument tables) and ordering (barriers) yourself and keep resources alive until the GPU is done. It lowers CPU overhead; gate it with `supportsFamily(.metal4)` and keep a fallback. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Metal debugger** — Xcode's GPU frame capture, which shows passes, load and store actions, bindings, resources, dependencies and per-line shader cost. Turn on API Validation and Shader Validation in the scheme's Diagnostics; Shader Validation reports accesses to non-resident resources. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Metal Shading Language (MSL)** — The C++-based language for Metal shaders; iOS 27 brings MSL 4.1. MSL 4 added tensor types and operations you can call from any shader stage. *[Day 6](day6-metal4-graphics-and-compute.md)*

**MetalFX** — Apple's GPU upscaling (spatial and temporal scalers) and frame interpolation, which generates an extra frame between two. The Metal 4 versions encode into `MTL4CommandBuffer`s; create them at launch, because they're slow to initialize. *[Day 6](day6-metal4-graphics-and-compute.md)*

**MetricKit** — The framework (since iOS 13) for performance data and diagnostics from people's devices. In iOS 27, `MetricManager` delivers daily `MetricReport`s and per-event `DiagnosticReport`s (crash, hang, exceptions, launch) as async sequences and replaces `MXMetricManager`, which Apple's reference marks deprecated in the **iOS 27.2 beta**. *[Day 7](day7-ship-like-a-senior.md)*

**`@Model`** — The SwiftData macro that makes a class persistent and observable, adding backing storage and `PersistentModel` conformance. *[Day 3](day3-data-lifecycle-system.md)*

**`@ModelActor`** — A macro that makes an actor with its own `ModelContext` for background SwiftData work. That context starts with autosave off, so call `save()` yourself. *[Day 3](day3-data-lifecycle-system.md)*

**`ModelContainer`** — SwiftData's store: the schema plus its configuration. It's `Sendable` and created once, and the app and its extensions can open the same store through an App Group with `ModelConfiguration(groupContainer:)`. *[Day 3](day3-data-lifecycle-system.md)*

**`ModelContext`** — A scratchpad that tracks inserted, changed and deleted models until you save. Models belong to the context that fetched them; the container's `mainContext` autosaves, and every other context doesn't. *[Day 3](day3-data-lifecycle-system.md)*

**Module** — A unit of compiled code: an app target, a framework or a package target. Access control works at module level, and module selectors (`SwiftUI::View`, Swift 6.3) say which module a name comes from. *[Day 1](day1-swift-and-concurrency.md)*

**`MTKView`** — MetalKit's view that owns drawables and calls your delegate's `draw(in:)` every frame. `currentMTL4RenderPassDescriptor` gives a Metal 4 render pass for the current drawable, and the view's and its layer's residency sets must be added to your queue. *[Day 6](day6-metal4-graphics-and-compute.md)*

**`MTLTensor`** — A Metal resource for multidimensional arrays, used as the inputs and outputs of machine learning passes and by MSL 4's tensor operations. iOS 27 adds multi-plane tensors for quantized models and 8-bit and 4-bit float types. *[Day 6](day6-metal4-graphics-and-compute.md)*

**`Mutex`** — A lock from the Synchronization module that guards a small value for short, synchronous access with `withLock`. Never `await` inside it; use an actor for async shared state and `Atomic` for counters and flags. *[Day 1](day1-swift-and-concurrency.md)*

## N

**`NavigationStack`** — A stack of screens driven by a path, an array of `Hashable` values, with `navigationDestination(for:destination:)` mapping each value type to a screen. A deep link is `path = [id]`, and popping to the root is `path.removeAll()`. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Neural Engine** — Apple silicon's machine learning accelerator, used by Core AI, Core ML and Metal machine learning passes alongside the CPU and GPU. In iOS 27, any Neural Engine use while your app is in the background needs the Background Inference entitlement. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Noncopyable type** — A type marked `~Copyable`, whose values can't be copied, only moved or borrowed, so the compiler can enforce single ownership. iOS 27's `Continuation` and the elements of `UniqueArray` are noncopyable. *[Day 1](day1-swift-and-concurrency.md)*

**`nonisolated`** — Marks code that belongs to no isolation domain; it runs in whatever domain calls it, or on the concurrent pool. `nonisolated(unsafe)` opts a variable out of checking entirely and, like `@unchecked Sendable`, needs a comment saying why it's safe. *[Day 1](day1-swift-and-concurrency.md)*

**`nonisolated(nonsending)`** — Spells approachable concurrency's behavior on a single function: a nonisolated `async` function that runs on its caller's actor. `@concurrent` is the opposite choice. *[Day 1](day1-swift-and-concurrency.md)*

**Notes for Review** — Free text in App Store Connect for the App Review team: a demo account, what the AI features do, device requirements and where data goes. Write it before code freeze, and describe new features specifically, as guideline 2.3 asks. *[Day 7](day7-ship-like-a-senior.md)*

## O

**`@Observable`** — The Observation macro that makes a class track which stored properties each `body` reads, so a change updates only the views that read that property. Pass the object as a plain property, use `@Bindable` for bindings to its properties, and share it with the environment; it replaces `ObservableObject` and `@Published`. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**`Observations`** — An iOS 26 async sequence of changes to `@Observable` values, which emits the current value first and then the latest value after each change. *[Day 1](day1-swift-and-concurrency.md)*

**`OCRTool`** — An iOS 27 Vision tool you give a Foundation Models session so the model can read text in an attached image; `BarcodeReaderTool` is its sibling. Neither is available in Simulator, so test them on a device. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Onscreen annotation** — Telling Siri which entity a view shows, with `appEntityIdentifier(_:)` in SwiftUI or `NSUserActivity.appEntityIdentifier`, so "this errand" resolves correctly. Annotate only entities the view really shows. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**`OpenIntent`** — An app intent that opens your app to an entity or screen. Route it to a SwiftUI scene with `TargetContentProvidingIntent` and `onAppIntentExecution(_:perform:)`. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**Optional** — A value that might be `nil`, written `String?` and unwrapped with `if let`, `guard let`, `??` or `?.`. A force unwrap (`!`) crashes on `nil`, so keep it for real programmer errors. *[Day 1](day1-swift-and-concurrency.md)*

**Organizer** — Xcode's window of data from participating users' devices: crashes, hangs, launch time, battery and more. Xcode 27 adds an Insights overview of regressions, a Hitches metric that replaces Scrolling, storage metrics and Generate Recommendations. *[Day 7](day7-ship-like-a-senior.md)*

## P

**`@Parameter`** — An app intent input (`IntentParameter`) that the system resolves before `perform()` runs, asking the person with your `requestValueDialog` when a required value is missing. Treat every parameter as untrusted, and never let one decide whether a safety gate applies. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**`PartiallyGenerated`** — The streaming mirror of a `@Generable` type, with every property optional, delivered in snapshots by `streamResponse`. SwiftUI can bind to it and fill in as the model writes, and a `GenerationID` property keeps generated elements stable. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Permission** — The system prompt that asks a person for access to protected data or hardware, such as the camera, contacts or notifications. The system shows it once and remembers the answer, so ask at the moment a feature needs it, and design the "denied" and "limited" (partial access) paths first. *[Day 3](day3-data-lifecycle-system.md)*

**Persistent identity (App Intents)** — The identity (`PersistentlyIdentifiable`) of an intent, entity, enum or query, which people's saved shortcuts refer to; it defaults to the type name. Renaming the type breaks those shortcuts unless you keep `persistentIdentifier` stable. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**`PersistentIdentifier`** — A SwiftData model's `Sendable` ID (`persistentModelID`). To hand work to another actor, pass the identifier and fetch the model again in that actor's context. *[Day 3](day3-data-lifecycle-system.md)*

**Phased release** — An App Store update rolled out to people with automatic updates over 7 days: 1%, 2%, 5%, 10%, 20%, 50%, then 100%. You can pause it for up to 30 days in total, and anyone can still download the update by hand. *[Day 7](day7-ship-like-a-senior.md)*

**Pipeline state** — A compiled GPU program: shader functions plus fixed state such as output pixel formats and blending. Creating one is expensive, so compile ahead of time, ideally asynchronously with `MTL4Compiler`, and never in the draw loop. *[Day 6](day6-metal4-graphics-and-compute.md)*

**`#Preview`** — A macro that renders a view live in Xcode's canvas; its code runs on the main actor. `PreviewProvider` is deprecated in iOS 27, and `#Preview(_:traits:arguments:body:)` renders one preview per argument. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Privacy manifest** — A `PrivacyInfo.xcprivacy` file, in your app and in each third-party SDK, that lists the data you collect and your reasons for using required-reason APIs. Since May 1, 2024, App Store Connect rejects uploads that use those APIs without a declared reason. *[Day 3](day3-data-lifecycle-system.md)*

**Privacy nutrition label** — The privacy details you fill in on App Store Connect, covering what you and your third-party SDKs collect. It must agree with your privacy manifest and the consent your app asks for. *[Day 7](day7-ship-like-a-senior.md)*

**Private Cloud Compute (PCC)** — Apple's privacy-preserving servers. `PrivateCloudComputeLanguageModel` (iOS 27) runs there with a 32K-token context, `.light`, `.moderate` and `.deep` reasoning levels and a per-person daily quota, and it needs the managed `com.apple.developer.private-cloud-compute` entitlement plus eligibility (the App Store Small Business Program and fewer than 2 million first-time downloads). *[Day 5](day5-apple-intelligence-and-ml.md)*

**Prompt injection** — Instructions hidden in data, such as an email, a web page, a calendar event title or text in a photo, that a model might follow. Defend in code: keep untrusted text out of instructions, return minimal tool output, type the output, and require a person's approval for side effects. *[Day 4](day4-app-intents-siri-system-surfaces.md), [Day 5](day5-apple-intelligence-and-ml.md)*

**Property wrapper** — A type marked `@propertyWrapper` that adds hidden storage and accessors to a property, with a projected value reached through `$`. SwiftUI's `@Binding` and `@AppStorage` are property wrappers; `@State` expands through a macro when you build with Xcode 27. *[Day 1](day1-swift-and-concurrency.md)*

**Protocol** — A description of what a type can do, which structs, enums, classes and actors can all conform to, with default implementations in protocol extensions. Swift uses protocols where other languages use inheritance; `View`, `AppIntent` and `Tool` are all protocols. *[Day 1](day1-swift-and-concurrency.md)*

**Provisioning profile** — An Apple-signed authorization that ties together who may sign (certificates), which app (App ID), where it runs (devices), when (expiration) and how it's entitled (an entitlements allowlist). App Store builds end up with no profile, because Apple re-signs them after review. *[Day 7](day7-ship-like-a-senior.md)*

**Purpose string** — The `Info.plist` text shown in a permission prompt, such as `NSCameraUsageDescription`. Without it, access fails, and the app may crash the moment it touches the resource. *[Day 3](day3-data-lifecycle-system.md)*

## Q

**`@Query`** — The SwiftData macro for live fetch results in a view, read through the main context in the environment. In iOS 27, `@Query(..., sectionBy:)` returns `SectionedResults` grouped by a string key path. *[Day 3](day3-data-lifecycle-system.md)*

## R

**Reduce Motion** — An accessibility setting that asks apps to remove or replace non-essential motion; read it with `@Environment(\.accessibilityReduceMotion)`. Liquid Glass also adapts when people turn on Reduce Transparency or Increase Contrast. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Region-based isolation** — The compiler rule that lets you pass a non-`Sendable` value into another isolation domain if it can see you never touch the value again; a `sending` parameter demands exactly that. The error "sending 'x' risks causing data races" means you did touch it, or could. *[Day 1](day1-swift-and-concurrency.md)*

**Render pass** — A group of draws into a set of attachments, with a load action and a store action at its edges. On Apple's tile-based GPUs, its pixels are shaded in tile memory and written back to system memory only if they're stored. *[Day 6](day6-metal4-graphics-and-compute.md)*

**`requestConfirmation`** — The App Intents method that pauses `perform()` until the person approves in a system prompt, optionally with a snippet that spells out the side effect; it throws if they cancel. It's the gate for every side effect, because Siri AI might not display your result dialog. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**Required-reason API** — An API whose use you must justify in your privacy manifest with a reason code: `UserDefaults`, file timestamps, system boot time, disk space and active keyboards. For `UserDefaults`, the usual code is `CA92.1` (data only your app reads), or `1C8F.1` for an App Group suite. *[Day 3](day3-data-lifecycle-system.md)*

**Residency set** — `MTLResidencySet`, the list of allocations the GPU may access. Add resources with `addAllocation(_:)`, call `commit()`, and attach the set to the queue, along with the view's and layer's sets for drawables; a missing entry gives a black screen or a GPU fault, not a compile error. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Result builder** — A type marked `@resultBuilder` that turns the lines, `if`s and `for`s inside a closure into one nested value, the way `ViewBuilder` builds `body`. In Xcode 27, SwiftUI's closures use `@ContentBuilder`, an alias for `ViewBuilder` that builds views, toolbar items and commands. *[Day 1](day1-swift-and-concurrency.md)*

**`ResultsObserver`** — An iOS 27 SwiftData type that gives you live, `Observable` fetch results outside a view. Apple documents it as reacting to changes from the same context, other contexts, other processes and CloudKit. *[Day 3](day3-data-lifecycle-system.md)*

**Retain cycle** — Objects that own each other in a circle, so no reference count reaches zero and `deinit` never runs; the classic case is a stored closure that captures `self`. Break it with a capture list, and find it with Xcode's memory graph. *[Day 1](day1-swift-and-concurrency.md)*

**Run loop** — The event loop on the main thread that receives touches and other events and runs your handlers and UI updates. Apple's tools report a hang when the main run loop stays busy for more than 250 ms. *[Day 7](day7-ship-like-a-senior.md)*

## S

**Safe area** — The part of the screen that no bar, sensor housing or Dynamic Island covers. Content stays inside it by default and backgrounds extend under it; `ignoresSafeArea`, `safeAreaInset` and `safeAreaBar` change that. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Sandbox** — The private container and limits every app runs inside: it can't read other apps' files or see their screens. Every door out is an API guarded by an entitlement, a permission, or both. *[Day 0](00-mental-models.md)*

**Sanitizers** — Runtime checkers you turn on in the scheme's Diagnostics: Address Sanitizer finds memory corruption, Thread Sanitizer finds data races (useful for C, Objective-C, `unsafe` code and third-party binaries), and Main Thread Checker flags main-thread-only APIs called from other threads. Thread Sanitizer runs only in the Simulator and on macOS, not on iOS devices. *[Day 7](day7-ship-like-a-senior.md)*

**Scene** — One instance of your app's UI, such as a window, with a lifecycle separate from the process; in SwiftUI, `WindowGroup` provides them. Apps built with the iOS 27 SDK must use the scene-based lifecycle, or they fail to launch. *[Day 3](day3-data-lifecycle-system.md)*

**Scene phase** — A scene's state, read with `@Environment(\.scenePhase)`: `.active`, `.inactive` or `.background`. In the `App` it's an aggregate of all scenes; treat every move out of `.active` as possibly the last code that will run. *[Day 3](day3-data-lifecycle-system.md)*

**`@SceneStorage`** — Small per-window state, such as the selected tab or errand, that the system restores with the scene. Keep values small, never store secrets in it, and expect it to vanish when the scene is destroyed. *[Day 3](day3-data-lifecycle-system.md)*

**Scroll edge effect** — The blur and fade the system applies to content that scrolls under a bar, styled with `scrollEdgeEffectStyle(_:for:)`. Use it instead of painting a custom bar background. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Seam** — A small protocol at an edge where side effects live, such as the model provider, persistence, the network or the clock, with a fake for tests and previews. The middle of the app stays plain Swift. *[Day 7](day7-ship-like-a-senior.md)*

**`Sendable`** — Marks a type whose values are safe to share across isolation domains; non-public structs and enums made of `Sendable` parts get it automatically, and actors are `Sendable`. `@unchecked Sendable` is a promise the compiler can't check, and Swift 6.4's `~Sendable` says a type is explicitly not `Sendable`. *[Day 1](day1-swift-and-concurrency.md)*

**SF Symbols** — Apple's library of thousands of icons that match the San Francisco font's weights and scale with text. They have four rendering modes (monochrome, hierarchical, palette, multicolor) and symbol effects such as bounce, pulse and replace. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Shader** — A function the GPU runs, written in Metal Shading Language: vertex and fragment functions for render passes, and kernels for compute work. SwiftUI shaders are `[[stitchable]]` functions that SwiftUI runs for you. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Shared event** — `MTLSharedEvent`, a counter the CPU and GPU both see. The queue signals it with a frame number when the GPU finishes that frame, and the CPU waits on it before reusing the frame's slot. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Signpost** — A named interval, such as "planning took 1.8 s," recorded with `OSSignposter` and drawn on the Instruments timeline. In iOS 27, a signposter built on `MetricManager.logHandle(category:)` also feeds MetricKit from real devices. *[Day 7](day7-ship-like-a-senior.md)*

**Siri AI** — The Apple Intelligence version of Siri, new in iOS 27, which handles requests that span apps and reaches third-party apps only through App Intents. Your app can't call other apps' intents, and at launch Siri AI is an opt-in beta in limited regions and languages. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**SiriKit** — The older Siri frameworks (Intents, IntentsUI, `INIntent`), which still provide legacy support for existing Siri and Shortcuts features. New integration with Siri AI and Apple Intelligence uses App Intents. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**Size class** — Compact or regular width and height, the basis of adaptive layout. Decide layout by size class and container size, never by device type or orientation. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**`SnippetIntent`** — An iOS 26 intent that renders an interactive view in Siri, Spotlight or Shortcuts, whose buttons run other intents. The system calls its `perform()` again after every interaction, so it must only read state. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**`some` and `any`** — `some P` is one concrete type that the compiler knows, checked and optimized statically; `any P` is a box that can hold any conforming type, at the cost of dynamic dispatch, a possible heap allocation and lost associated types. Default to generics and `some`, and use `any` for mixed collections. *[Day 1](day1-swift-and-concurrency.md)*

**Source of truth** — The single owner of a piece of mutable state; everyone else reads it or borrows write access through a binding. When two screens show different values for the same thing, there's a second source of truth to delete. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**`SpeechAnalyzer`** — The iOS 26 on-device speech-to-text API, used with modules such as `SpeechTranscriber`; it replaces `SFSpeechRecognizer`. iOS 27's `AssetInputSequenceProvider` feeds it audio files without conversion code of your own. *[Day 5](day5-apple-intelligence-and-ml.md)*

**`@State`** — Owns a view's local value, or a model object, in storage SwiftUI keeps outside the view struct; `$x` gives a binding. Built with Xcode 27, it expands through the `State()` macro, so a class stored in it is created and stored only once. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Store action** — What a render pass does with an attachment's results at the end: `.store` writes the tile back to system memory, and `.dontCare` throws it away for free. Store only what someone reads later, such as the display or a later pass. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Structured concurrency** — Child tasks (`async let`, task groups) that live inside a scope and can't outlive it. Cancellation flows down to the children, and results and errors flow up to the parent. *[Day 1](day1-swift-and-concurrency.md)*

**Suspended** — The app state after a short time in the background: still in memory, but with no CPU time. The system can end a suspended app to reclaim memory without running any of your code, so "save on quit" isn't a strategy: save when data changes. *[Day 3](day3-data-lifecycle-system.md)*

**Swift 6 language mode** — The Swift language mode with complete data-race checking, where every violation is a compile error. Set it with Swift Language Version in Xcode or `swiftLanguageModes: [.v6]` in a package. *[Day 1](day1-swift-and-concurrency.md)*

**Swift Testing** — Apple's framework for new unit tests: `@Test`, `#expect` (record and keep going), `#require` (stop, or unwrap), parameterized tests, traits, and `confirmation` for events you can't await. Tests run in parallel in one process by default, and each test gets a fresh instance of its suite. *[Day 7](day7-ship-like-a-senior.md)*

**SwiftData** — Apple's framework for persisting your model graph: `@Model` classes, a `ModelContainer`, `ModelContext`s and `@Query`. It can sync to iCloud through CloudKit, under CloudKit's rules. *[Day 3](day3-data-lifecycle-system.md)*

**SwiftUI shader** — A `[[stitchable]]` Metal function that SwiftUI runs per pixel through `colorEffect`, `layerEffect`, `distortionEffect` or a `Shader` fill. You get GPU speed without owning a render loop; precompile it with `compile(as:)` to avoid a hitch on first use. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Symbolication** — Turning the hexadecimal addresses in a crash report into function names and line numbers. Upload debug symbols with each build, and Organizer does it for you. *[Day 7](day7-ship-like-a-senior.md)*

**`SyncableEntity`** — An iOS 27 protocol that says an app entity's ID is the same on all of a person's devices, so Siri can carry a conversation from one device to another. Use `SyncableEntityIdentifier` when local and stable IDs differ. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**`SystemLanguageModel`** — Apple's on-device language model: offline, free and unlimited to call, with no reasoning and a small context you read from `contextSize`; check `availability` first, because it can be unavailable with `.deviceNotEligible`, `.appleIntelligenceNotEnabled` or `.modelNotReady`. It ships inside the OS and changes with OS updates (one model for 26.0–26.3, one for 26.4, one for 27.0), so rerun your evaluations on every beta. *[Day 5](day5-apple-intelligence-and-ml.md)*

## T

**Task** — A unit of async work. `Task { }` starts an unstructured task that inherits the current actor, priority and task-local values (`Task.detached` inherits neither); dropping its handle doesn't cancel it, and a thrown error stays inside until someone awaits `.value`. *[Day 1](day1-swift-and-concurrency.md)*

**Task group** — `withTaskGroup` or `withThrowingTaskGroup`, for a dynamic number of child tasks that return results; a child's error surfaces only when you call `next()` or iterate the group. Discarding task groups drop finished children for side-effect-only work, and the throwing one cancels itself and rethrows on the first error. *[Day 1](day1-swift-and-concurrency.md)*

**`.task` modifier** — Async work tied to a view's lifetime: it starts before the view appears, and SwiftUI can cancel it when the view goes away. `task(id:)` cancels and restarts the work when the ID changes. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**TBDR (tile-based deferred rendering)** — How Apple GPUs draw: split the render target into tiles, work out the geometry that touches each tile, remove hidden surfaces, and only then shade the visible pixels in tile memory. Memory traffic, not arithmetic, usually dominates the cost. *[Day 6](day6-metal4-graphics-and-compute.md)*

**TestFlight** — Apple's beta distribution: up to 100 internal and 10,000 external testers, with each build installable for 90 days. The first build you add to an external group goes through App Review. *[Day 7](day7-ship-like-a-senior.md)*

**Threadgroup** — A group of compute threads scheduled together that can share threadgroup memory; inside it, a SIMD group runs in lockstep. Size threadgroups as the SIMD-group width (`threadExecutionWidth`) times as many rows as fit, and let `dispatchThreads` trim the edges. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Tile memory** — The small, fast memory on an Apple GPU where a render pass's pixels live while each tile is shaded. Apple says it has many times the bandwidth and many times lower latency than device memory, and uses significantly less energy; the cheapest pixel is one that never leaves it. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Timeline (widget)** — The series of entries a widget's provider produces; the system archives the views and renders them later in its own process. A frequently viewed widget gets about 40–70 reloads a day, requested with `WidgetCenter.shared.reloadTimelines(ofKind:)`, with entries at least about 5 minutes apart. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**Token** — The unit a language model reads and writes: roughly three to four characters in English and about one character in Chinese, Japanese or Korean. Measure with `tokenCount(for:)` (iOS 26.4) instead of guessing. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Tool** — A `Sendable` type conforming to `Tool`, with a `name`, a `description`, `@Generable` `Arguments` and an async `call(arguments:)` that the model may request. The framework runs your code and feeds the output back as untrusted text, and Apple suggests no more than three to five tools per request. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Tool calling mode** — `GenerationOptions.ToolCallingMode` (iOS 27): `.allowed`, `.required` or `.disallowed` for each request. With `.required`, give the model an exit (switch to `.allowed` after a call, or throw from the tool), or it keeps calling. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Transcript** — A session's history: instructions, prompts, responses, tool calls and tool outputs. You can inspect and trim it, and after the context fills, seed a new session with a condensed one. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Typed throws** — `throws(ParseError)`: a function that throws exactly one error type, so the caller's `catch` can switch over it exhaustively. Use it inside a module or in generic code that only passes errors through; plain `throws` stays the better default for public APIs. *[Day 1](day1-swift-and-concurrency.md)*

## U

**UIKit** — Apple's older, imperative UI framework, still underneath SwiftUI and still the home of advanced text editing, very large collection layouts and views such as PencilKit's canvas. Join the two at the leaves with representables and `UIHostingController`. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**`UIViewRepresentable`** — Wraps a UIKit view for SwiftUI: `makeUIView` runs once per identity, `updateUIView` runs whenever SwiftUI's inputs change, and a coordinator handles delegate callbacks. Compare before assigning in `updateUIView`, or you'll loop. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**`UndoableIntent`** — An App Intents protocol for intents that can be reversed: the intent registers its undo with its `undoManager`. Offer it wherever reversing an action makes sense. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**Unified memory** — On Apple silicon, the CPU and GPU share system memory, so a `.shared` buffer the CPU writes is visible to the GPU without an upload. Same memory doesn't mean safe at the same time; you still pace frames. *[Day 6](day6-metal4-graphics-and-compute.md)*

**Universal link** — An `https` link to your domain that opens your app, delivered in SwiftUI to `onOpenURL(perform:)`. It needs the Associated Domains entitlement, and Apple recommends it over custom URL schemes. *[Day 3](day3-data-lifecycle-system.md)*

**`URLSession`** — Foundation's HTTP client. It throws only for transport errors, so check `statusCode` for a 404 or 500 yourself; set `waitsForConnectivity` instead of checking reachability, and reuse one session per configuration. *[Day 3](day3-data-lifecycle-system.md)*

**`UserDefaults`** — Storage for small preferences, kept unencrypted on disk. Never put secrets in it, and declare it in your privacy manifest, because it's a required-reason API. *[Day 3](day3-data-lifecycle-system.md)*

## V

**Value type** — A struct or enum, copied when you assign or pass it, so nobody can change your copy behind your back. Most model types should be values; use a class only when you need a shared identity. *[Day 1](day1-swift-and-concurrency.md)*

**`VersionedSchema`** — One frozen version of your SwiftData schema, listed with the others in a `SchemaMigrationPlan` of lightweight or custom migration stages. Wrap the first schema in one before the first TestFlight build, and test migrations with real old data, because people skip versions. *[Day 3](day3-data-lifecycle-system.md)*

**View** — A SwiftUI `View` is a small struct whose `body` describes the UI for the current state; SwiftUI calls `body` again when an input it read changes and updates only what differs. `body` runs often and on the main actor, so keep it cheap and free of side effects. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**View identity** — How SwiftUI decides a view is the same one as last time: structural identity (type and position in the tree, such as one branch of an `if`) and explicit identity (IDs in `ForEach` or `.id(_:)`). Same identity keeps state and running tasks; a new identity discards them. *[Day 2](day2-swiftui-liquid-glass-design.md)*

**Vision** — Apple's framework for images: text (`RecognizeTextRequest`), documents, barcodes, faces and body pose, with an async Swift API. Let it read input before any language model sees it; iOS 27 adds `OCRTool` and `BarcodeReaderTool` for Foundation Models sessions. *[Day 5](day5-apple-intelligence-and-ml.md)*

**Visual intelligence** — Searching what the camera or screen shows. The system hands your app's `IntentValueQuery` a `SemanticContentDescriptor` and shows the entities it returns. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**VoiceOver** — The screen reader that speaks an accessibility tree built from your views: each element's label, value, traits, hint and actions. Xcode 27's `XCUIVoiceOverService` drives it from UI tests and reads back what it says. *[Day 2](day2-swiftui-liquid-glass-design.md)*

## W

**Watchdog** — The system monitor that ends an app that stays unresponsive too long, especially at launch; the crash report shows the code `0x8badf00d`. Show the first frame, then do slow work asynchronously. *[Day 0](00-mental-models.md)*

**Widget** — A glanceable SwiftUI view on the Home Screen or Lock Screen, built with WidgetKit from a widget extension's timeline. It's interactive only through `Button(intent:)` and `Toggle(isOn:intent:)`, and it never resolves parameters, so pass intents with every value set. *[Day 4](day4-app-intents-siri-system-surfaces.md)*

**WWDC** — Apple's developer conference each June, where the first betas of the next OS and Xcode ship; the release follows in September. Build with the new Xcode beta in June and clear new warnings before September. *[Day 0](00-mental-models.md)*

## X

**Xcode Cloud** — Apple's CI/CD service. A workflow has start conditions, actions (build, test, analyze, archive) and post-actions such as distributing to TestFlight, and scripts in a `ci_scripts` folder run at three fixed points. *[Day 7](day7-ship-like-a-senior.md)*

**`.xcproj` project file** — A JSON project file that Apple's docs describe replacing `.pbxproj` as the default in **Xcode 27.2 (beta)**, for smaller diffs and fewer merge conflicts. *[Day 7](day7-ship-like-a-senior.md)*

**XCTest** — Apple's older testing framework, still used for UI tests, which drive the app from a separate process through XCUIAutomation, and for `measure` performance tests. Use Swift Testing for new unit tests; since Swift 6.4, each framework's assertions work in the other's tests. *[Day 7](day7-ship-like-a-senior.md)*
