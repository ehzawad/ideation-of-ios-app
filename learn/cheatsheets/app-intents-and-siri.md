[← Learning hub](../README.md) · [Day 4 chapter](../day4-app-intents-siri-system-surfaces.md)

# App Intents and Siri cheat sheet

> iOS 27, Swift 6.4. Every symbol below was checked against Apple's documentation; versions are in the footer.

## The shape in one table

| Concept | Protocol or macro | Required members | Think of it as |
|---|---|---|---|
| Verb | `AppIntent` | `static title`, `init()`, `perform() async throws -> some IntentResult` | A function the system can call |
| Input | `@Parameter` (`IntentParameter`) | A type the framework supports | An argument the system resolves first |
| Noun | `AppEntity` | `id`, `displayRepresentation`, `static typeDisplayRepresentation`, `static defaultQuery` | A row the system can refer to |
| Finder | `EntityQuery` and subprotocols | `entities(for:)` | How the system turns IDs or words into nouns |
| Fixed set | `AppEnum` | `RawValue` that's `LosslessStringConvertible`, `typeDisplayRepresentation`, `caseDisplayRepresentations` | An enum parameter |
| Phrases | `AppShortcutsProvider` | `static var appShortcuts: [AppShortcut]` | Zero-setup Siri, Spotlight and Action button entries |
| Contract | `@AppIntent(schema:)`, `@AppEntity(schema:)`, `@AppEnum(schema:)` | Whatever the schema lists | "This intent *is* create-a-reminder" for Apple Intelligence |

In a target whose Default Actor Isolation is `MainActor`, declare intents, entities, enums and queries `nonisolated`: the protocols are nonisolated and `Sendable`. Use `static let` for `title`, `description` and friends; a stored `static var` fails Swift 6 checking.

## Which protocol for which system feature

| You want | Adopt | Notes |
|---|---|---|
| An action in Siri and Shortcuts | `AppIntent` | Return `ReturnsValue` so it chains; `ProvidesDialog` so Siri can speak it |
| Siri AI to treat it as a standard action | `@AppIntent(schema: .domain.action)` | iOS 27 adds audio, calendar, clock, maps, messages, notes, phone, reminders. Type `domain_` in Xcode for a template. Mail, Clock, Messages: adopt all or none |
| Open the app to an item or screen | `OpenIntent` (`target` parameter) | Add `TargetContentProvidingIntent` and `onAppIntentExecution(_:perform:)` to route to a SwiftUI scene. Set `UIApplicationSupportsMultipleScenes` |
| Show search results in the app | `ShowInAppSearchResultsIntent` | Spotlight uses it when a search has more than ten results |
| Delete items | `DeleteIntent` | Pair with confirmation |
| Spotlight results | `IndexedEntity` + `OpenIntent` | Index with `CSSearchableIndex(name:).indexAppEntities(_:priority:)` |
| A phrase with no setup, or an Action button entry | `AppShortcutsProvider` | Up to 10 per app. Every phrase contains `\(.applicationName)`. Show one with `SiriTipView` |
| A result view with buttons | `SnippetIntent` | Return with `.result(snippetIntent:)` or `.result(value:dialog:snippetIntent:)`. `perform()` re-runs; no side effects |
| Approval with a custom view | `requestConfirmation(conditions:actionName:dialog:showDialogAsPrompt:snippetIntent:)` | Throws if the person cancels |
| A widget button or toggle | `AppIntent` with `Button(intent:label:)` / `Toggle(isOn:intent:label:)` | Runs in the widget extension by default. Widgets don't resolve parameters: pass them set |
| A configurable widget | `WidgetConfigurationIntent` + `AppIntentConfiguration` + `AppIntentTimelineProvider` | Replaces `IntentConfiguration` / `INIntent` |
| A widget button that runs the person's chosen shortcut or app | `RunSystemShortcutIntent(shortcut:)` with a `SystemShortcut` parameter | iOS 27. Widgets only, via `Button` |
| A Control Center, Lock Screen or Action button button | `ControlWidgetButton(action:)` + `AppIntent` or `OpenIntent` | `OpenIntent` must be in the app and the widget extension |
| A control toggle | `ControlWidgetToggle` + `SetValueIntent` | Don't set `value` yourself; the system fills it |
| A configurable control | `AppIntentControlConfiguration` + `ControlConfigurationIntent` + `AppIntentControlValueProvider` | `promptsForUserConfiguration()` if it can't work unconfigured |
| Start or change a Live Activity from the background | `LiveActivityIntent` | Runs in the app's process |
| Media play or pause from a widget or Live Activity | `AudioPlaybackIntent` | Runs in the app's process |
| Camera from the Lock Screen or Action button | `CameraCaptureIntent` | With a locked camera capture extension |
| A workout from the Action button | `StartWorkoutIntent` | Also `PauseWorkoutIntent`, `ResumeWorkoutIntent` |
| Work longer than 30 seconds | `LongRunningIntent` + `performBackgroundTask(options:operation:)` | iOS 27. Update `progress` or get cancelled. Progress shows as a Live Activity |
| Clean up on cancel | `CancellableIntent` | Reason: `.userCancelled` or `.timeout` |
| Undo | `UndoableIntent` | Register with its `undoManager` |
| Visual intelligence results | `IntentValueQuery` with `SemanticContentDescriptor` input + `OpenIntent` | One such query per app; `@UnionValue` for several entity types |
| Siri to know what's on screen | `appEntityIdentifier(_:)` (SwiftUI), `NSUserActivity.appEntityIdentifier` | Only the entities the view really shows |
| Better suggestions | `IntentDonationManager.shared.donate(intent:)`, `donate()` | Only for actions started in your UI |
| Media suggestions in workouts | `RelevantEntities.shared.updateEntities(_:for:)` | iOS 27. Replaces the previous set each call |
| Apple Watch Smart Stack suggestions | `RelevantIntentManager` | |
| Treat as a universal link | `URLRepresentableIntent`, `URLRepresentableEntity` | |
| App settings as one entity | `UniqueAppEntity` + `UniqueAppEntityQuery` | |
| Replace a SiriKit custom intent | `CustomIntentMigratedAppIntent` | Xcode: Editor > Convert to App Intent |
| Retire an intent | `DeprecatedAppIntent` | Keep old shortcuts working while pointing to the new one |

## Entity patterns

```swift
nonisolated struct ErrandEntity: IndexedEntity {
    static let typeDisplayRepresentation: TypeDisplayRepresentation = "Errand"
    static let defaultQuery = ErrandQuery()

    let errand: Errand                               // your snapshot, not exposed
    init(errand: Errand) { self.errand = errand }
    var id: UUID { errand.id }

    @ComputedProperty(indexingKey: \.displayName)    // exposed + indexed
    var title: String { errand.title }

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(title)")
    }
}
```

| Property macro | Use for | Spotlight variants |
|---|---|---|
| `@Property` (`EntityProperty`) | Stored values you set | `indexingKey:`, `customIndexingKey:` |
| `@ComputedProperty` | Values computed from your model (iOS 26) | `indexingKey:`, `customIndexingKey:` |
| `@DeferredProperty` | Large or expensive values loaded lazily (iOS 26) | `indexingKey:` |

- **Supported types:** `Bool`, `Int`, `Double`, `String`, `AttributedString`, `Duration`, `Date`, `Decimal`, `Measurement`, `URL`; `Array`, `Set`; `EntityCollection`, `IntentPerson`, `IntentFile`, `IntentCurrencyAmount`, `IntentPaymentMethod`, `SystemShortcut`, `@UnionValue`; `DateComponents`, `PersonNameComponents`, `PlaceDescriptor`, `Calendar.RecurrenceRule`, `SemanticContentDescriptor` and others; your own `AppEntity` and `AppEnum`.
- **IDs:** prefer `UUID`, `String` or `Int`. Stable across devices? Add `SyncableEntity` (iOS 27). Different local and stable IDs? `id: SyncableEntityIdentifier<Local, Stable>`.
- **Size:** an entity and its children max out at 10 MB; the system throws past that. Use `@DeferredProperty` or `EntityCollection`.
- **Variants:** `IndexedEntity` (Spotlight), `FileEntity` (documents), `TransientAppEntity`, `UniqueAppEntity` (singletons), `OwnershipProvidingEntity` (iOS 27, `ownership: EntityOwnership` of `.shared`, `.public`, `.unknown`).
- **Bridging:** conform to `Transferable`; add `IntentValueRepresentation` to export `IntentPerson`, `PlaceDescriptor` or `PersonNameComponents`.
- **Spotlight extras:** `attributeSet` for non-wrapped data, `hideInSpotlight`, named index only in production, `deleteAppEntities(identifiedBy:ofType:)` on delete, `associateAppEntity(_:priority:)` for existing `CSSearchableItem` code.

## Query patterns

| Protocol | Implement | When the system calls it | Extra |
|---|---|---|---|
| `EntityQuery` | `entities(for:)`, optional `suggestedEntities()` | Rehydrating saved IDs; filling pickers | Required minimum |
| `EntityStringQuery` | `entities(matching:)` | Words from Siri or a Shortcuts search field | The one that makes Siri "find" things |
| `EnumerableEntityQuery` | `allEntities()` | Small, fixed sets | Adds a Find action in Shortcuts |
| `EntityPropertyQuery` | Predicate-based search | Large sets | Adds a Find action in Shortcuts |
| `IndexedEntityQuery` | `reindexEntities(for:indexDescription:)`, `reindexAllEntities(indexDescription:)` | Spotlight asks you to rebuild | iOS 27 |
| `UniqueAppEntityQuery` | Returns the single entity | Singletons | |
| `IntentValueQuery` | `values(for:)` | Visual intelligence search | Return quickly; cap at about 100 |

Queries can use `@Dependency` and, in iOS 27, `allowedExecutionTargets`.

## Parameter patterns

| Pattern | Code |
|---|---|
| Ask when missing | `@Parameter(title: "Step", requestValueDialog: "Which step?") var step: StepEntity` |
| Optional: system won't ask | `@Parameter(title: "Due") var due: Date?` |
| Default value | `@Parameter(title: "Tag", default: "favorite") var tag: String` |
| Ask again from `perform()` | `throw $step.needsValueError("Which step?")` |
| Let the person pick | `throw $location.needsDisambiguationError(among: matches, dialog: "Which one?")` |
| Choose from a list at runtime | `try await requestChoice(between: options, dialog: "Which one?")` with `IntentChoiceOption` values (iOS 26) |
| Many IDs, no loading | `@Parameter(title: "Photos") var photos: EntityCollection<PhotoEntity>`, then `photos.identifiers` or `try await photos.resolvedEntities()` |
| One of several types | `@UnionValue enum Content { case a(AEntity), b(BEntity) }` (+ `AppUnionValue`, iOS 27) |
| Shortcuts sentence | `static var parameterSummary: some ParameterSummary { Summary("Tag \(\.$photos) with \(\.$tag)") }` |
| Dynamic options | `DynamicOptionsProvider` passed as `optionsProvider:` |

Never add a parameter that decides whether a safety gate applies (`approved`, `skipConfirmation`).

## Results

| Return type | Build with |
|---|---|
| `some IntentResult` | `.result()` |
| `some IntentResult & ProvidesDialog` | `.result(dialog: "Done.")` |
| `some ReturnsValue<E> & ProvidesDialog` | `.result(value: e, dialog: "…")` |
| `some IntentResult & ShowsSnippetView` | `.result(view: MyView())` (static snippet) |
| `some ReturnsValue<E> & ProvidesDialog & ShowsSnippetIntent` | `.result(value:dialog:snippetIntent:)` (interactive) |
| Error | `throw AppIntentError(description: "…")` (iOS 27), or a `CustomLocalizedStringResourceConvertible` error enum |

`IntentDialog(full:supporting:)`: `full` when there's no screen, `supporting` next to a view. Siri AI might not display dialogs or snippets; check `systemContext.isVoiceOnly` (iOS 27) for free-form output.

## Runtime knobs

| Knob | Values | Effect |
|---|---|---|
| `static supportedModes` | `.background`, `.foreground(.immediate)`, `.foreground(.dynamic)`, `.foreground(.deferred)`, combinations | A preference, not a guarantee. App Intents extension code always runs in the background |
| `systemContext.currentMode` | `.foreground` or `.background`; check `canContinueInForeground` | What actually happened |
| `continueInForeground(_:alwaysConfirm:)` | | Ask to come forward. Errors from an extension |
| `static allowedExecutionTargets` | `.main`, `.appIntentsExtension`, `.widgetKitExtension` | iOS 27. Which process may run it |
| `static authenticationPolicy` | `.alwaysAllowed`, `.requiresAuthentication`, `.requiresLocalDeviceAuthentication` | Locked-device behavior |
| `static isDiscoverable` | `Bool` | Hide from Shortcuts, Spotlight and Siri (test intents) |
| `static isAssistantOnly` | `Bool` | Schema intents: hide from Shortcuts during migration |
| `AppDependencyManager.shared.add(dependency:)` | | Register early in `App.init`; read with `@Dependency` |
| `AppIntentsPackage` | `includedPackages` | Surface intents that live in a framework |

## Safety checklist for agent-callable intents

- Treat every `String` parameter as untrusted data. Validate length and format; store it, don't execute it.
- Re-read state by ID inside `perform()`; the entity may be stale.
- Side effects: `requestConfirmation` before acting, with the effect spelled out. Don't rely on `.lowConfidenceSource` for anything that sends, pays, deletes or calls.
- `authenticationPolicy = .requiresAuthentication` for anything personal or destructive.
- Shared or public entities: `OwnershipProvidingEntity`.
- Offer `UndoableIntent` where reversal makes sense.
- Snippet `perform()` reads only.
- Keep dialogs and returned values minimal; Siri may speak them and shortcuts pass them on.
- Test-only intents: `isDiscoverable = false` inside `#if DEBUG`.

## iOS 27 additions

| Symbol | What | Reference version |
|---|---|---|
| App schema domains: audio, calendar, clock, maps, messages, notes, phone, reminders | Siri AI contracts | 27.0 |
| `SyncableEntity`, `SyncableEntityIdentifier` | Cross-device IDs | 27.0 |
| `OwnershipProvidingEntity`, `EntityOwnership` | Automatic confirmations for shared or public data | 27.0 |
| `RelevantEntities`, `AppEntityContext` | Media suggestions | 27.0 |
| `LongRunningIntent`, `performBackgroundTask(options:operation:)`, `performBackgroundTask(options:operation:onCancel:)`, `LongRunningTaskOptions.requiresGPU` | Background time past 30 seconds | 27.0 |
| `IntentExecutionTargets`, `allowedExecutionTargets` | Process pinning | 27.0 |
| `EntityCollection` | ID-only entity arrays | 27.0 |
| `AppUnionValue` | Union parameters with metadata | 27.0 |
| `IndexedEntityQuery`, `CSSearchableIndexDescription` | Spotlight reindexing | 27.0 |
| `AppIntentError(description:)` | Localized failures | 27.0 |
| `RunSystemShortcutIntent`, `SystemShortcut` | Widget buttons that run the person's pick | 27.0 |
| `IntentSystemContext.isVoiceOnly` | Voice-only requests | 27.0 |
| App Intents Testing (`IntentDefinitions`) | Out-of-process intent tests | 27.0 |
| `SpotlightSearchTool` (Core Spotlight) | Foundation Models search over your index | 27.0 |
| Listed in the June 2026 notes, older in the reference: `CancellableIntent`, `IntentCancellationReason`, `IntentValueRepresentation` (26.4); `UndoableIntent`, `supportedModes`, `IntentModes` (26.0) | | 26.x |

## Numbers worth remembering

| Fact | Value |
|---|---|
| Background intent time without `LongRunningIntent` | 30 seconds |
| App Shortcuts per app | Up to 10 (Apple's sample suggests 2–5) |
| App entity size | 10 MB, including children |
| Widget reloads | About 40–70 a day for a frequently viewed widget; entries at least about 5 minutes apart |
| Live Activity lifetime | Up to 8 hours active; up to 4 more on the Lock Screen (12 total) |
| Live Activity data | Static plus dynamic at most 4 KB, including push payloads |
| Ended Live Activity, default policy | Removed within 4 hours |
| Live Activity push priority | `apns-priority` 5 doesn't count against the budget; 10 does |
| Visual intelligence results | Return about the first 100; link to more in the app |

## Two more patterns

Long job with progress (iOS 27):

```swift
nonisolated struct ReplanAllIntent: LongRunningIntent, CancellableIntent {
    static let title: LocalizedStringResource = "Re-plan Errands"
    @Dependency var store: ErrandStore

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let ids = await store.openErrandIDs()
        let count = try await performBackgroundTask {
            progress.totalUnitCount = Int64(ids.count)
            progress.localizedDescription = "Re-planning errands"
            for (index, id) in ids.enumerated() {
                try Task.checkCancellation()
                await store.replan(errandID: id)
                progress.completedUnitCount = Int64(index + 1)
            }
            return ids.count
        } onCancel: { reason in
            // Keep this quick. `reason` is .userCancelled or .timeout.
        }
        return .result(dialog: "Re-planned \(count) errands.")
    }
}
```

Visual intelligence query:

```swift
import AppIntents
import VisualIntelligence

nonisolated struct ErrandVisualQuery: IntentValueQuery {
    @Dependency var store: ErrandStore

    func values(for input: SemanticContentDescriptor) async throws -> [ErrandEntity] {
        // Labels are general English terms like "building", not names.
        let matches = await store.errands(matchingAnyOf: input.labels)
        return matches.prefix(100).map { ErrandEntity(errand: $0) }
    }
}
```

`openErrandIDs()`, `replan(errandID:)` and `errands(matchingAnyOf:)` are your store's methods.

<details><summary>Verified APIs</summary>

- AppIntent — iOS 16.0
- AppIntent.perform() — iOS 16.0
- AppIntent.title — iOS 16.0
- AppIntent.systemContext — iOS 16.0
- AppIntent.authenticationPolicy — iOS 16.0
- AppIntent.isDiscoverable — iOS 17.0
- AppIntent.supportedModes — iOS 26.0
- AppIntent.allowedExecutionTargets — iOS 27.0
- AppIntent.continueInForeground(_:alwaysConfirm:) — iOS 26.0
- AppIntent.requestChoice(between:dialog:) — iOS 26.0
- AppIntent.requestConfirmation(conditions:actionName:dialog:showDialogAsPrompt:snippetIntent:) — iOS 26.0
- AppIntent.donate() — iOS 16.0
- AppIntent.parameterSummary — iOS 16.0
- IntentParameter (@Parameter) — iOS 16.0
- IntentParameter.needsValueError(_:) — iOS 16.0
- IntentParameter.needsDisambiguationError(among:dialog:) — iOS 16.0
- IntentResult.result() — iOS 16.0
- IntentResult.result(dialog:) — iOS 16.0
- IntentResult.result(value:dialog:) — iOS 16.0
- IntentResult.result(view:) — iOS 16.0
- IntentResult.result(snippetIntent:) — iOS 26.0
- IntentResult.result(value:dialog:snippetIntent:) — iOS 26.0
- ReturnsValue — iOS 16.0
- ProvidesDialog — iOS 16.0
- ShowsSnippetView — iOS 16.0
- ShowsSnippetIntent — iOS 26.0
- IntentDialog.init(full:supporting:) — iOS 16.0
- IntentSystemContext.currentMode — iOS 26.0
- IntentSystemContext.isVoiceOnly — iOS 27.0
- IntentModes — iOS 26.0
- IntentModes.foreground(_:) — iOS 26.0
- IntentModes.ForegroundMode.immediate / .dynamic / .deferred — iOS 26.0
- IntentModes.Current — iOS 26.0
- IntentModes.Current.canContinueInForeground — iOS 26.0
- IntentExecutionTargets (.main, .appIntentsExtension, .widgetKitExtension) — iOS 27.0
- IntentAuthenticationPolicy (.alwaysAllowed, .requiresAuthentication, .requiresLocalDeviceAuthentication) — iOS 16.0
- ConfirmationConditions.lowConfidenceSource — iOS 18.0
- AssistantSchemaIntent.isAssistantOnly — iOS 18.0
- AppIntentError.init(description:) — iOS 27.0
- AppEntity — iOS 16.0
- AppEntity.defaultQuery — iOS 16.0
- EntityProperty (@Property) — iOS 16.0
- ComputedProperty(indexingKey:) — iOS 26.0
- DeferredProperty() — iOS 26.0
- DisplayRepresentation — iOS 16.0
- TypeDisplayRepresentation — iOS 16.0
- IndexedEntity — iOS 18.0
- IndexedEntity.attributeSet — iOS 18.0
- IndexedEntity.hideInSpotlight — iOS 18.4
- FileEntity — iOS 18.0
- TransientAppEntity — iOS 16.0
- UniqueAppEntity — iOS 18.0
- UniqueAppEntityQuery — iOS 18.0
- SyncableEntity — iOS 27.0
- SyncableEntityIdentifier — iOS 27.0
- OwnershipProvidingEntity — iOS 27.0
- EntityOwnership (.shared, .public, .unknown) — iOS 27.0
- EntityCollection — iOS 27.0
- EntityCollection.resolvedEntities() — iOS 27.0
- UnionValue() — iOS 18.0
- AppUnionValue — iOS 27.0
- IntentValueRepresentation — iOS 26.4
- IntentPerson — iOS 16.0
- IntentFile — iOS 16.0
- SystemShortcut — iOS 27.0
- EntityQuery — iOS 16.0
- EntityQuery.entities(for:) — iOS 16.0
- EntityQuery.suggestedEntities() — iOS 16.0
- EntityQuery.allowedExecutionTargets — iOS 27.0
- EntityStringQuery.entities(matching:) — iOS 16.0
- EnumerableEntityQuery.allEntities() — iOS 17.0
- EntityPropertyQuery — iOS 16.0
- IndexedEntityQuery.reindexEntities(for:indexDescription:) — iOS 27.0
- IndexedEntityQuery.reindexAllEntities(indexDescription:) — iOS 27.0
- IntentValueQuery.values(for:) — iOS 26.0
- DynamicOptionsProvider — iOS 16.0
- ParameterSummary — iOS 16.0
- AppEnum — iOS 16.0
- AppShortcutsProvider.appShortcuts — iOS 16.0
- AppShortcut.init(intent:phrases:shortTitle:systemImageName:) — iOS 17.0
- AppShortcutPhraseToken.applicationName — iOS 16.0
- SiriTipView — iOS 16.0
- AppDependencyManager.add(key:dependency:) — iOS 16.0
- AppDependency (@Dependency) — iOS 16.0
- AppIntentsPackage — iOS 17.0
- OpenIntent — iOS 16.0
- TargetContentProvidingIntent — iOS 26.0
- ShowInAppSearchResultsIntent — iOS 17.2
- DeleteIntent — iOS 16.0
- SnippetIntent — iOS 26.0
- SnippetIntent.reload() — iOS 26.0
- LongRunningIntent — iOS 27.0
- LongRunningIntent.performBackgroundTask(options:operation:) — iOS 27.0
- LongRunningIntent.performBackgroundTask(options:operation:onCancel:) — iOS 27.0
- LongRunningTaskOptions.requiresGPU — iOS 27.0
- ProgressReportingIntent.progress — iOS 17.0
- CancellableIntent — iOS 26.4
- IntentCancellationReason (.userCancelled, .timeout) — iOS 26.4
- UndoableIntent — iOS 26.0
- UndoableIntent.undoManager — iOS 26.0
- LiveActivityIntent — iOS 17.0
- AudioPlaybackIntent — iOS 17.0
- CameraCaptureIntent — iOS 18.0
- StartWorkoutIntent — iOS 16.0
- SetValueIntent — iOS 18.0
- ControlConfigurationIntent — iOS 18.0
- WidgetConfigurationIntent — iOS 17.0
- RunSystemShortcutIntent — iOS 27.0
- URLRepresentableIntent — iOS 18.0
- URLRepresentableEntity — iOS 18.0
- CustomIntentMigratedAppIntent — iOS 16.0
- DeprecatedAppIntent — iOS 17.0
- AppIntent(schema:), AppEntity(schema:), AppEnum(schema:) — iOS 18.0
- AppSchema.AudioIntent / CalendarIntent / ClockIntent / MapsIntent / MessagesIntent / NotesIntent / PhoneIntent / RemindersIntent — iOS 27.0
- IntentDonationManager.donate(intent:) — iOS 16.0
- RelevantEntities.updateEntities(_:for:) — iOS 27.0
- AppEntityContext — iOS 27.0
- RelevantIntentManager — iOS 17.0
- SemanticContentDescriptor.labels (Visual Intelligence) — iOS 26.0
- View.appEntityIdentifier(_:) (SwiftUI) — iOS 18.4
- View.onAppIntentExecution(_:perform:) (SwiftUI) — iOS 26.0
- NSUserActivity.appEntityIdentifier — iOS 18.2
- Button.init(intent:label:) (SwiftUI) — iOS 17.0
- Toggle.init(isOn:intent:label:) (SwiftUI) — iOS 17.0
- CSSearchableIndex.init(name:) — iOS 9.0
- CSSearchableIndex.indexAppEntities(_:priority:) — iOS 18.0
- CSSearchableIndex.deleteAppEntities(identifiedBy:ofType:) — iOS 18.0
- CSSearchableItemAttributeSet.associateAppEntity(_:priority:) — iOS 18.0
- CSSearchableIndexDescription — iOS 27.0
- SpotlightSearchTool — iOS 27.0
- AppIntentConfiguration — iOS 17.0
- AppIntentTimelineProvider — iOS 17.0
- ControlWidgetButton, ControlWidgetToggle — iOS 18.0
- AppIntentControlConfiguration, AppIntentControlValueProvider — iOS 18.0
- ControlWidgetConfiguration.promptsForUserConfiguration() (SwiftUI) — iOS 18.0
- IntentDefinitions (App Intents Testing) — iOS 27.0

</details>
