[← Day 5](../day5-apple-intelligence-and-ml.md) · [Learning hub](../README.md)

# Cheat sheet · AI and ML (iOS 27)

One page to keep open while you build. Every symbol was checked with `scripts/appledoc.py` against Apple's iOS 27 documentation; versions are in the footer.

## Foundation Models API map

| You want to… | Use | Since |
|---|---|---|
| Check the on-device model | `SystemLanguageModel.default.availability` (`.available`, `.unavailable(.deviceNotEligible / .appleIntelligenceNotEnabled / .modelNotReady)`) | 26.0 |
| Start a context | `LanguageModelSession(instructions:)`, `init(model:tools:instructions:)` | 26.0 |
| Resume from history | `init(model:tools:transcript:)`, `Transcript(entries:)` | 26.0 |
| Load before a known request (≥ 1 s ahead) | `prewarm(promptPrefix:)` | 26.0 |
| Get text | `respond(to:options:)` → `Response<String>.content` | 26.0 |
| Get a Swift value | `respond(to:generating:includeSchemaInPrompt:options:)` | 26.0 |
| Stream partial values | `streamResponse(to:generating:…)` → `Snapshot.content` (`PartiallyGenerated`), then `collect()` | 26.0 |
| Build a prompt with images | `respond { "text"; Attachment(cgImage).label("x") }` | 27.0 (`Attachment`) |
| Tune sampling | `GenerationOptions(samplingMode:temperature:maximumResponseTokens:)`, `.greedy` | 26.0 |
| Force or forbid tools | `GenerationOptions(toolCallingMode: .required / .allowed / .disallowed)` | 27.0 |
| Ask for reasoning (PCC) | `respond(to:options:contextOptions:metadata:)` with `ContextOptions(reasoningLevel: .light / .moderate / .deep)` | 27.0 |
| Count tokens | `SystemLanguageModel.tokenCount(for:)` (prompt, `Instructions`, `[any Tool]`, `GenerationSchema`, transcript entries) | 26.4 |
| Know the limit | `SystemLanguageModel.contextSize` (4,096 on device); `PrivateCloudComputeLanguageModel.contextSize` (async) | 26.0 / 27.0 |
| See tokens used | `Response.usage`, `LanguageModelSession.usage` | 27.0 |
| One request at a time | `isResponding`; else `LanguageModelSession.Error.concurrentRequests` | 26.0 / 27.0 |
| Server model | `PrivateCloudComputeLanguageModel()` + entitlement | 27.0 |
| Any model | a type conforming to `LanguageModel` | 27.0 |
| State-dependent instructions and tools | `DynamicInstructions`, `init(model:dynamicInstructions:history:)` | 27.0 |
| Switch model and settings by state | `LanguageModelSession.DynamicProfile`, `Profile`, `init(profile:history:)` | 27.0 |
| Shared state across profile and tools | `@SessionPropertyEntry` on `SessionPropertyValues`, `@SessionProperty(\.key)` | 27.0 |
| Topic tagging model | `SystemLanguageModel(useCase: .contentTagging)` | 26.0 |
| Sensitive source text | `SystemLanguageModel(guardrails: .permissiveContentTransformations)` (string output only) | 26.0 |
| Which on-device variant | `SystemLanguageModel.variant` (`.core3`, `.coreAdvanced3`) | 27.0 |
| Report bad output to Apple | `logFeedbackAttachment(sentiment:issues:desiredOutput:)` | 26.0 |

## Where should this request run?

| Question | On device `SystemLanguageModel` | Private Cloud Compute `PrivateCloudComputeLanguageModel` | Third party via `LanguageModel` |
|---|---|---|---|
| Data leaves the device? | No | Yes, to Apple's PCC (Apple: "Preserves privacy") | Yes, to the provider |
| Offline? | Yes | No | No |
| Context | 4K (4,096) | 32K | Provider |
| Reasoning levels | Not supported | Light, moderate, deep | Provider |
| Limits | Unlimited (watch for `rateLimited`) | Daily quota per person; iCloud+ raises it | Your bill |
| Your setup | Availability check | Managed entitlement `com.apple.developer.private-cloud-compute`; Small Business Program; < 2M first-time downloads | Package, key server, consent UI |
| Consent | No sharing, normal permission rules | Disclose server use (HIG) | **5.1.2(i): disclose the provider and get explicit permission first** |
| Typical Errand use | Plan a short errand; classify; extract | Long email or document; multi-turn planning | Only what Apple's models can't do, after consent |

**Rule of thumb (Apple's words):** "Start with the on-device model and evaluate it with the `Evaluations` framework. If you determine your feature needs more reasoning capability or context size, then use PCC."

```swift
// Route one request. Measure the fixed cost instead of guessing.
let local = SystemLanguageModel.default
let cloud = PrivateCloudComputeLanguageModel()
let needed = try await local.tokenCount(for: prompt)
    + local.tokenCount(for: tools)                      // [any Tool]
    + local.tokenCount(for: MyOutput.generationSchema)
let useCloud = needed + 900 > local.contextSize         // 900 = instructions + answer, tune it
    && cloud.isAvailable && !cloud.quotaUsage.isLimitReached
let session = useCloud
    ? LanguageModelSession(model: cloud, dynamicInstructions: MyInstructions())   // your DynamicInstructions type
    : LanguageModelSession(model: local, dynamicInstructions: MyInstructions())
```

## `@Generable` and `@Guide` patterns

```swift
@Generable(description: "A plan for one errand")   // on structs, enums, actors
struct Plan {
    var title: String                     // generated first: declaration order matters
    @Guide(description: "One sentence")   // descriptions cost tokens; add only when needed
    var rationale: String
    @Guide(.maximumCount(6))              // caps list length and output tokens
    var steps: [Step]
}

@Generable
struct Step {
    var id: GenerationID                  // stable identity while streaming
    @Guide(description: "Minutes", .range(5...240)) var minutes: Int
    @Guide(.anyOf(["low", "medium", "high"])) var effort: String
    @Guide(.count(2)) var tags: [String]
    var kind: Kind
}

@Generable
enum Kind {                               // enums bound the output: a safety tool too
    case phone
    case visit
    case online
}
```

| Guide | Applies to |
|---|---|
| `.range(a...b)`, `.minimum(_:)`, `.maximum(_:)` | numbers |
| `.count(_:)`, `.minimumCount(_:)`, `.maximumCount(_:)`, `.element(_:)` | arrays |
| `.anyOf(_:)`, `.constant(_:)`, `.pattern(_:)`, or a `Regex` | strings |

```swift
// Scalars work too
let cups = try await session.respond(to: "How many tablespoons are in a cup?", generating: Float.self)

// Classification: greedy sampling always picks the most likely case
let kind = try await session.respond(generating: Kind.self,
                                     options: GenerationOptions(samplingMode: .greedy)) {
    "Choose the kind that fits this step:"
    stepText
}

// Streaming into SwiftUI state
let stream = session.streamResponse(to: prompt, generating: Plan.self)
for try await snapshot in stream { draft = snapshot.content }   // Plan.PartiallyGenerated, all optional
let plan = try await stream.collect().content

// Later requests in the same session that repeat the type: skip the schema to save tokens
_ = try await session.respond(to: next, generating: Plan.self, includeSchemaInPrompt: false)

// Schema unknown until runtime
let menu = DynamicGenerationSchema(name: "Menu", properties: [
    DynamicGenerationSchema.Property(name: "soup",
        schema: DynamicGenerationSchema(name: "soup", anyOf: ["Tomato", "Clam Chowder"]))
])
let content = try await session.respond(to: prompt, schema: try GenerationSchema(root: menu, dependencies: [])).content
let soup = try content.value(String.self, forProperty: "soup")
```

**Guarantees shape, not truth.** A refusal can't fit your type, so it's thrown as `LanguageModelError.refusal(_:)`.

## Tool calling

```swift
struct LookupTool: Tool {
    let name = "lookupOpeningHours"                       // short, unique
    let description = "Returns opening hours for a saved place."
    let places: PlaceStore                                // your actor: tools must be Sendable

    @Generable
    struct Arguments {
        @Guide(description: "Saved place name") var place: String
    }

    func call(arguments: Arguments) async throws -> String {   // String, GeneratedContent, or @Generable
        await places.hours(for: arguments.place) ?? "Unknown place."
    }
}

let session = LanguageModelSession(tools: [LookupTool(places: store)], instructions: "…")
let r = try await session.respond(to: "When does the library open?",
                                  options: GenerationOptions(toolCallingMode: .required))
```

- **3–5 tools per request, max** (Apple). Every definition is tokens.
- **`.required` needs an exit:** throw from `call(arguments:)`, or switch to `.allowed` after the first call with a dynamic profile and `onToolCall`.
- **Errors:** `LanguageModelSession.ToolCallError` carries `tool` and `underlyingError`. Or return a short string like "Cannot access the database."
- **Inspect calls:** `session.transcript` entries `.toolCalls`, `.toolOutput`, `.reasoning`, `.response`.
- **Built-in Vision tools:** `OCRTool()`, `BarcodeReaderTool()` (iOS 27, not in Simulator). Label images with `Attachment(image).label("…")`. Custom image tools take an `ImageReference` argument and call `resolved(in:)` on the history.

## Context budgeting

| Fact | Number or API |
|---|---|
| On-device window | 4,096 tokens per session (everything counts) |
| PCC window | 32K |
| English | ~3–4 characters per token |
| Chinese, Japanese, Korean | ~1 character per token |
| Instructions and prompts | Apple suggests at most three paragraphs |
| Measure | `tokenCount(for:)`, `#Playground` canvas, Foundation Models instrument |

```swift
do {
    let answer = try await session.respond(to: prompt)
} catch LanguageModelError.contextSizeExceeded(_) {
    // Fresh window, keep the first entry (instructions) and the last (most recent context)
    let t = session.transcript
    let condensed = Transcript(entries: [t.first, t.last].compactMap { $0 })
    let fresh = LanguageModelSession(transcript: condensed)
    fresh.prewarm()
}
```

Other levers: one-shot sessions; chunk long text into separate sessions and summarize the summaries; `.maximumCount` on arrays; short property names; `historyTransform { Array($0.suffix(20)) }` in a profile; keep instructions and tools stable so the cached prefix survives.

## Errors → what to do

| Error | Meaning | Do |
|---|---|---|
| `LanguageModelError.contextSizeExceeded` | Transcript too big | New session, condense, chunk, or PCC |
| `LanguageModelError.guardrailViolation` | Input or output tripped safety | Explain, offer rewording; rephrase your built-in prompts |
| `LanguageModelError.refusal` | Model declined (typed output) | Show `try await refusal.explanation.content` |
| `LanguageModelError.rateLimited` | Too many requests or background streaming | Space requests; use `respond` in background |
| `LanguageModelError.unsupportedLanguageOrLocale` | Language not supported | Check `supportsLocale(_:)` first |
| `LanguageModelError.unsupportedCapability` | Model lacks a feature (tools, guided generation…) | Check `model.capabilities` |
| `SystemLanguageModel.Error.assetsUnavailable` | On-device assets missing | Show "getting ready", retry later |
| `LanguageModelSession.Error.concurrentRequests` | Second request while responding | Disable UI on `isResponding` |
| `LanguageModelSession.ToolCallError` | Your tool threw | Read `tool.name`, `underlyingError` |
| `PrivateCloudComputeLanguageModel.Error.quotaLimitReached` | Daily quota used | Status label, `limitIncreaseSuggestion?.show()`, `resetDate`, fall back on device |
| `PrivateCloudComputeLanguageModel.Error.networkFailure` / `.serviceUnavailable` | PCC unreachable | Retry on device |
| `LanguageModelSession.GenerationError` | iOS 26 type, deprecated in 27 | Migrate to the types above |

## Private Cloud Compute in 12 lines

```swift
let pcc = PrivateCloudComputeLanguageModel()
switch pcc.availability {
case .available: break
case .unavailable(.deviceNotEligible): useOnDeviceOnly()   // your own functions
case .unavailable(.systemNotReady): retryLater()
case .unavailable: useOnDeviceOnly()
}
if case .belowLimit(let info) = pcc.quotaUsage.status, info.isApproachingLimit { showNearLimitLabel() }
let session = LanguageModelSession(model: pcc)
let r = try await session.respond(to: longPrompt, contextOptions: ContextOptions(reasoningLevel: .moderate))
```

Eligibility (Apple's access page): enrolled in the App Store Small Business Program, fewer than 2 million first-time downloads across your apps, entitlement assigned; no cloud API cost; cross the threshold and you have 6 months to migrate. Test quota UI with Scheme > Run > Options > "Simulated Apple Foundation Models Availability".

## Dynamic profiles (agentic flows)

```swift
extension SessionPropertyValues {
    @SessionPropertyEntry
    var toolCallCount: Int = 0
}

struct Planner: LanguageModelSession.DynamicProfile {
    var hard = false
    @SessionProperty(\.toolCallCount) var toolCallCount

    var body: some LanguageModelSession.DynamicProfile {
        if hard {
            Profile { MyInstructions() }                    // a DynamicInstructions type
                .model(PrivateCloudComputeLanguageModel())
                .reasoningLevel(.moderate)
        } else {
            Profile { MyInstructions() }
                .temperature(0.2)
                .toolCallingMode(toolCallCount < 1 ? .required : .allowed)
                .onToolCall { toolCallCount += 1 }          // throw here to block a call
                .historyTransform { Array($0.suffix(20)) }  // what this request sees
        }
    }
}
let session = LanguageModelSession(profile: Planner())
```

- Precedence: call-site `GenerationOptions` > innermost profile modifier > outer dynamic profile modifier.
- Lifecycle: `onActivate`, `onDeactivate`, `onPrompt`, `onReasoning`, `onResponse`, `onToolCall`, `onToolOutput`. Callbacks accumulate across nesting; a throw propagates to `respond`.
- `transcriptErrorHandlingPolicy(.preserveTranscript)` keeps a partial transcript after an error.
- Switching profiles changes the prefix and invalidates the key-value cache. Switch at natural boundaries, not every turn.

## Safety and prompt injection checklist

- [ ] Nothing from the person, the web, a file, OCR or a tool goes into `Instructions`.
- [ ] Person and fetched text sits in the prompt, delimited and labelled as data.
- [ ] Tools return the minimum (times, not event titles; IDs, not documents).
- [ ] Output is typed: enums and guides bound what the model can say.
- [ ] Tools read or draft. The app asks the person before sending, paying, booking or deleting.
- [ ] Deterministic gate in code (`onToolCall`, argument checks, call caps).
- [ ] Deny list checked on input and output if people can type freely.
- [ ] A risk assessment table: feature, harm, severity, mitigation.
- [ ] Safety prompts in your evaluation suite, re-run on every OS model update.
- [ ] A way for people to report bad output; `logFeedbackAttachment` for reports to Apple.
- [ ] Instruments traces treated as user data (prompts are stored unencrypted).
- [ ] Third-party model: consent screen names the provider and lists what's sent **before** the first call (5.1.2(i)).

## The rest of the stack: entry points

| Task | API | Since | Notes |
|---|---|---|---|
| Text in images | `RecognizeTextRequest().perform(on:)` → `[RecognizedTextObservation]`, `.transcript` | 18.0 | 26 languages; async Swift API |
| Structured documents | `RecognizeDocumentsRequest` → `DocumentObservation` | 26.0 | Tables, lists, paragraphs |
| Barcodes | `DetectBarcodesRequest` → `BarcodeObservation.payloadString` | 18.0 | |
| Classify an image | `ClassifyImageRequest` | 18.0 | |
| Smudged lens | `DetectLensSmudgeRequest` | 26.0 | |
| Segment by taps or scribbles | `GenerateIterativeSegmentationRequest` | 27.0 | |
| Your Core ML model on images | `CoreMLRequest` | 18.0 | |
| Speech to text | `SpeechAnalyzer` + `SpeechTranscriber(locale:preset:)` | 26.0 | `DictationTranscriber` for older devices; `SpeechDetector` for voice activity |
| Speech assets | `AssetInventory.assetInstallationRequest(supporting:)` → `downloadAndInstall()` | 26.0 | |
| Audio from file or mic | `AssetInputSequenceProvider`, `CaptureInputSequenceProvider`, `AnalyzerInputConverter` | 27.0 | |
| Translate | `.translationTask(source:target:action:)`, `TranslationSession.translate(_:)` | 18.0 | On device; `init(installedSource:target:)` (26.0) without UI |
| Translation quality | `TranslationSession.Strategy` `.highFidelity` / `.lowLatency` | 26.4 | High fidelity uses Apple Intelligence |
| Language ID | `NLLanguageRecognizer.dominantLanguage(for:)` | 12.0 | |
| Names, parts of speech | `NLTagger(tagSchemes: [.nameType])` | 12.0 | |
| Similarity | `NLEmbedding`, `NLContextualEmbedding` | 13.0 / 17.0 | |
| Your model, classic | `MLModel.load(contentsOf:configuration:)`, `MLModelConfiguration.computeUnits` | 15.0 / 12.0 | Train with Create ML; convert with Core ML Tools |
| Your neural model, modern | Core AI `AIModel(contentsOf:)`, `loadFunction(named:)`, `NDArray` | 27.0 | Needs Xcode's Metal Toolchain component |
| Your LLM in a session | `CoreAILanguageModel(resourcesAt:)` from Apple's coreai-models package | 27.0 | Same session API |
| Open-source runtime | MLX Swift (github.com/ml-explore/mlx-swift); `MLXLanguageModel` in mlx-swift-lm | — | Package, not a system framework |
| Measure quality | Evaluations: `Evaluation`, `ModelSample`, `Evaluator`, `@Test(.evaluates(...))` | 27.0 | Also tool-call trajectories |

```swift
// Vision
let lines = try await RecognizeTextRequest().perform(on: cgImage).map(\.transcript)
let codes = try await DetectBarcodesRequest().perform(on: cgImage).compactMap(\.payloadString)

// Natural Language
let language = NLLanguageRecognizer.dominantLanguage(for: text)
var places: [String] = []
let tagger = NLTagger(tagSchemes: [.nameType])
tagger.string = text
tagger.enumerateTags(in: text.startIndex..<text.endIndex, unit: .word,
                     scheme: .nameType, options: [.omitWhitespace, .joinNames]) { tag, range in
    if tag == .placeName { places.append(String(text[range])) }
    return true
}

// Core ML
let config = MLModelConfiguration()
config.computeUnits = .cpuAndNeuralEngine          // .cpuOnly for background or GPU-heavy moments
let classifier = try await MLModel.load(contentsOf: compiledModelURL, configuration: config)

// Core AI
let model = try await AIModel(contentsOf: aimodelURL)  // specializes on first load, then cached
guard let main = try model.loadFunction(named: "main") else { return }
let input = NDArray(shape: [3, 4], scalarType: .float32)
var outputs = try await main.run(inputs: ["input": input])
let prediction = outputs.remove("prediction")?.ndArray

// Evaluations (in a test target)
struct StepCountEval: Evaluation {
    let dataset = ArrayLoader(samples: [ModelSample(prompt: "Renew library books by Friday", expected: 3)])
    let withinOne = Metric("WithinOne")
    func subject(from sample: ModelSample<Int>) async throws -> ModelSubject<Int> {
        let session = LanguageModelSession()
        let r = try await session.respond(to: sample.prompt, generating: Plan.self)
        return ModelSubject(value: r.content.steps.count, transcript: session.transcript.structuredTranscript)
    }
    var evaluators: Evaluators {
        Evaluator { input, subject in
            guard let expected = input.expected else { return withinOne.ignore() }
            return abs(subject.value - expected) <= 1 ? withinOne.passing() : withinOne.failing()
        }
    }
    func aggregateMetrics(using aggregator: inout MetricsAggregator) { aggregator.computeMean(of: withinOne) }
}
```

## Energy, latency and drift

- **Stream in the foreground, `respond` in the background** (fewer `rateLimited` errors).
- **`prewarm(promptPrefix:)`** only with at least a second to spare. It's a hint, not a guarantee.
- **Background Neural Engine** use needs the Background Inference entitlement (iOS 27), used with `BGContinuedProcessingTask`.
- **Core AI specialization** is slow the first time: check `AIModelCache.default.model(for:options:)`, specialize ahead with `AIModel.specialize(...)`, or compile at build time with `coreai-build`.
- **Show specific progress** ("Finding free times in your calendar"), not "Processing…" (HIG).
- **The on-device model changes with the OS:** versions for 26.0–26.3, 26.4 and 27.0 so far. Keep prompts versioned, run evaluations on each beta, and log `SystemLanguageModel.variant`.
- **Profile** with the Foundation Models instrument (Product > Profile > Foundation Models) and the Core AI instrument and debug gauge.

<details><summary>Verified APIs</summary>

SystemLanguageModel, .default, .availability, .isAvailable — iOS 26.0
SystemLanguageModel.Availability.UnavailableReason — iOS 26.0
SystemLanguageModel.init(useCase:guardrails:), UseCase.contentTagging — iOS 26.0
SystemLanguageModel.Guardrails.permissiveContentTransformations — iOS 26.0
SystemLanguageModel.contextSize — iOS 26.0 (back-deployed)
SystemLanguageModel.tokenCount(for:) (all five overloads) — iOS 26.4
SystemLanguageModel.supportsLocale(_:) — iOS 26.0
SystemLanguageModel.variant, Variant (.core3, .coreAdvanced3) — iOS 27.0
SystemLanguageModel.Error (.assetsUnavailable) — iOS 27.0
LanguageModelSession — iOS 26.0
LanguageModelSession.init(model:tools:instructions:), init(model:tools:transcript:) — iOS 26.0
LanguageModelSession.init(model:dynamicInstructions:history:), init(profile:history:) — iOS 27.0
LanguageModelSession.prewarm(promptPrefix:), isResponding, transcript — iOS 26.0
LanguageModelSession.respond(to:options:), respond(to:generating:includeSchemaInPrompt:options:) — iOS 26.0
LanguageModelSession.respond(options:prompt:), respond(generating:includeSchemaInPrompt:options:prompt:) — iOS 26.0
LanguageModelSession.respond(to:schema:includeSchemaInPrompt:options:) — iOS 26.0
LanguageModelSession.respond(to:options:contextOptions:metadata:) — iOS 27.0
LanguageModelSession.streamResponse(to:generating:includeSchemaInPrompt:options:) — iOS 26.0
LanguageModelSession.ResponseStream, Snapshot, collect() — iOS 26.0
LanguageModelSession.Response.usage, LanguageModelSession.usage, Usage — iOS 27.0
LanguageModelSession.logFeedbackAttachment(sentiment:issues:desiredOutput:) — iOS 26.0
LanguageModelSession.Error (.concurrentRequests) — iOS 27.0
LanguageModelSession.ToolCallError — iOS 26.0
LanguageModelSession.GenerationError — iOS 26.0, deprecated 27.0
LanguageModelSession.DynamicProfile, Profile — iOS 27.0
DynamicProfile modifiers model(_:), temperature(_:), reasoningLevel(_:), toolCallingMode(_:), onToolCall(perform:), historyTransform(_:), transcriptErrorHandlingPolicy(_:) — iOS 27.0
DynamicInstructions — iOS 27.0
LanguageModelSession.SessionProperty, SessionPropertyValues, SessionPropertyEntry() — iOS 27.0
Transcript, Transcript.init(entries:) — iOS 26.0
Instructions, Prompt — iOS 26.0
Generable, Generable(description:), Guide(description:), Guide(description:_:) — iOS 26.0
GenerationGuide (.range, .minimum, .maximum, .count, .minimumCount, .maximumCount, .element, .anyOf, .constant, .pattern) — iOS 26.0
GenerationID — iOS 26.0
DynamicGenerationSchema, DynamicGenerationSchema.Property, GenerationSchema.init(root:dependencies:) — iOS 26.0
GeneratedContent.value(_:forProperty:) — iOS 26.0
Tool — iOS 26.0
GenerationOptions, init(samplingMode:temperature:maximumResponseTokens:), SamplingMode.greedy — iOS 26.0
GenerationOptions.ToolCallingMode, init(samplingMode:temperature:maximumResponseTokens:toolCallingMode:) — iOS 27.0
ContextOptions, ContextOptions.ReasoningLevel — iOS 27.0
LanguageModelError (all cases listed above), Refusal.explanation — iOS 27.0
PrivateCloudComputeLanguageModel, availability, isAvailable, contextSize, quotaUsage — iOS 27.0
PrivateCloudComputeLanguageModel.QuotaUsage (isLimitReached, status, resetDate, limitIncreaseSuggestion), Status.belowLimit, BelowLimit.isApproachingLimit, LimitIncreaseSuggestion.show() — iOS 27.0
PrivateCloudComputeLanguageModel.Error (.quotaLimitReached, .networkFailure, .serviceUnavailable) — iOS 27.0
LanguageModel, LanguageModelCapabilities — iOS 27.0
Attachment, Attachment.label(_:), ImageReference, ImageReference.resolved(in:) — iOS 27.0
Vision.OCRTool, Vision.BarcodeReaderTool — iOS 27.0
Vision.RecognizeTextRequest, RecognizedTextObservation.transcript — iOS 18.0
Vision.DetectBarcodesRequest, BarcodeObservation.payloadString — iOS 18.0
Vision.ClassifyImageRequest, Vision.CoreMLRequest — iOS 18.0
Vision.RecognizeDocumentsRequest, Vision.DetectLensSmudgeRequest — iOS 26.0
Vision.GenerateIterativeSegmentationRequest — iOS 27.0
Speech.SpeechAnalyzer, SpeechTranscriber, DictationTranscriber, SpeechDetector, AssetInventory — iOS 26.0
Speech.AssetInputSequenceProvider, CaptureInputSequenceProvider, AnalyzerInputConverter — iOS 27.0
Translation.TranslationSession, translate(_:), Response.targetText, LanguageAvailability — iOS 18.0
SwiftUI translationTask(source:target:action:) — iOS 18.0
TranslationSession.init(installedSource:target:) — iOS 26.0
TranslationSession.Strategy — iOS 26.4
NaturalLanguage.NLLanguageRecognizer.dominantLanguage(for:), NLTagger, NLTagger.string, NLTagger.Options.joinNames, NLTag.placeName, NLTagScheme.nameType — iOS 12.0
NaturalLanguage.NLEmbedding — iOS 13.0
NaturalLanguage.NLContextualEmbedding — iOS 17.0
CoreML.MLModel — iOS 11.0
MLModel.load(contentsOf:configuration:) — iOS 15.0
MLModelConfiguration, computeUnits, MLComputeUnits — iOS 12.0 (.cpuAndNeuralEngine iOS 16.0)
CreateML.MLImageClassifier, MLTextClassifier — iOS 15.0
CoreAI.AIModel, init(contentsOf:options:), loadFunction(named:), specialize(contentsOf:options:cache:cachePolicy:) — iOS 27.0
CoreAI.InferenceFunction.run(inputs:states:outputViews:), NDArray.init(shape:scalarType:), AIModelCache, SpecializationOptions, ComputeUnitKind — iOS 27.0
Evaluations.Evaluation, ModelSample, ModelSubject, ArrayLoader, Metric, Evaluator, MetricsAggregator.computeMean(of:), EvaluationTrait — iOS 27.0
Entitlement com.apple.developer.private-cloud-compute — iOS 27.0
Entitlement com.apple.developer.background-tasks.continued-processing.inference — iOS 27.0
CoreAILanguageModel(resourcesAt:) — from Apple's coreai-models package, as shown in Apple's article "Running a Core AI model in a Foundation Models session" (not an SDK symbol)

</details>
