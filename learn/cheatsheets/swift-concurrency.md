[← Learning hub](../README.md) · [Day 1 chapter](../day1-swift-and-concurrency.md)

# Swift concurrency cheat sheet

Swift 6.4 · Xcode 27 · iOS 27. Lowercase function names such as `refresh()` or `loadProfile()` stand for your own code.

## Settings that change the rules

| Xcode setting | Build setting | SwiftPM | Effect |
|---|---|---|---|
| Swift Language Version = 6 | `SWIFT_VERSION` | `swiftLanguageModes: [.v6]` | Complete data-race checking. Violations are errors. |
| Default Actor Isolation = MainActor | `SWIFT_DEFAULT_ACTOR_ISOLATION` | `.defaultIsolation(MainActor.self)` | Unannotated code in the module is `@MainActor`. Use it for app targets. |
| Approachable Concurrency = Yes | `SWIFT_APPROACHABLE_CONCURRENCY` | `.enableUpcomingFeature("NonisolatedNonsendingByDefault")` and friends | A nonisolated `async` function runs on the caller's actor unless marked `@concurrent`. Also infers isolated conformances. |
| Strict Concurrency Checking | `SWIFT_STRICT_CONCURRENCY` | — | Only matters in Swift 5 mode (Minimal → Complete, as warnings). Always complete in Swift 6. |

## Where does this code run?

| You write | Isolation | Runs |
|---|---|---|
| `@MainActor func f()` | Main actor | On the main thread |
| A method of `actor A` | That actor instance | One call at a time on the actor. Outsiders must `await`. |
| `nonisolated func f()` (sync) | None | On the caller's thread |
| `nonisolated func f() async` with approachable concurrency, or `nonisolated(nonsending)` | Caller's | On the caller's actor |
| `@concurrent func f() async` | None | On the global concurrent pool |
| `Task { }` | Inherits the enclosing actor | Same actor. Inherits priority and task-locals. |
| `Task.detached { }` | None | Global pool. No actor, no task-locals, not cancelled with its creator. |
| `async let`, `group.addTask { }` | Child task | Concurrently. Cancelled with the parent. |

## Syntax

```swift
// Fixed parallelism: leaving the scope early cancels any un-awaited `async let`.
async let profile = loadProfile()
async let errands = loadErrands()
let (p, e) = try await (profile, errands)

// Dynamic parallelism with results.
let total = try await withThrowingTaskGroup(of: Int.self) { group in
    for url in urls { group.addTask { try await size(of: url) } }
    return try await group.reduce(0, +)          // a child's error surfaces here
}

// Side effects only: nothing accumulates, and the first error cancels the rest.
try await withThrowingDiscardingTaskGroup { group in
    for errand in errands { group.addTask { try await sync(errand) } }
}
```

```swift
// Unstructured task: you own its lifetime and its errors.
let task = Task(name: "Refresh") { try await refresh() }
task.cancel()                                    // sets a flag; code must check it
_ = try await task.value                         // errors surface only here

// Cooperative cancellation.
try Task.checkCancellation()                     // throws CancellationError
if Task.isCancelled { return }                   // or stop quietly
try await Task.sleep(for: .milliseconds(300))    // throws when cancelled

await withTaskCancellationHandler {
    await longPoll()
} onCancel: {
    stopPolling()                                // runs at once, possibly concurrently
}

// Swift 6.4 (iOS 27): cleanup that runs even after cancellation.
defer {
    await withTaskCancellationShield { await flushLogs() }
}
```

```swift
actor Inventory {                                // one caller at a time inside
    private var stock: [String: Int] = [:]
    func add(_ item: String) { stock[item, default: 0] += 1 }
}
await inventory.add("pen")                       // from outside: always await

@globalActor
actor StorageActor { static let shared = StorageActor() }

@StorageActor final class DiskIndex { var entries = 0 }   // isolated to StorageActor

@MainActor final class ScreenModel {
    var title = ""
    nonisolated func format(_ n: Int) -> String { "\(n) left" }  // callable anywhere
    isolated deinit { title = "" }               // Swift 6.2+: deinit on the main actor
}

// With approachable concurrency on:
nonisolated func decode(_ data: Data) async throws -> [Errand] {     // caller's actor
    try JSONDecoder().decode([Errand].self, from: data)
}
@concurrent func decodeHuge(_ data: Data) async throws -> [Errand] { // always off the caller
    try JSONDecoder().decode([Errand].self, from: data)
}
```

```swift
// Sendable: safe to cross isolation boundaries.
struct Point: Sendable { var x, y: Double }      // non-public structs infer it anyway
final class Config: Sendable {                   // final + immutable Sendable lets
    let apiURL: URL
    init(apiURL: URL) { self.apiURL = apiURL }
}
final class LegacyBridge: @unchecked Sendable {} // your promise; audit and comment it
nonisolated(unsafe) var legacyFlag = false       // last resort for a global you guard yourself
public class Base: ~Sendable {}                  // Swift 6.4: explicitly not Sendable

// Small synchronous shared state: Mutex (iOS 18). Never await inside withLock.
import Synchronization
final class HitCounter: Sendable {
    private let hits = Mutex<[String: Int]>([:])
    private let total = Atomic<Int>(0)
    func record(_ host: String) {
        hits.withLock { $0[host, default: 0] += 1 }
        total.add(1, ordering: .relaxed)
    }
    var count: Int { total.load(ordering: .relaxed) }
}
```

```swift
// Callbacks → AsyncSequence.
func ticks(every interval: Duration) -> AsyncStream<Date> {
    let (stream, continuation) = AsyncStream.makeStream(of: Date.self)
    let producer = Task {
        while !Task.isCancelled {
            continuation.yield(Date())
            try? await Task.sleep(for: interval)
        }
        continuation.finish()
    }
    continuation.onTermination = { _ in producer.cancel() }  // consumer left → stop
    return stream
}
for await date in ticks(every: .seconds(1)) { print(date) }

// @Observable changes → AsyncSequence (iOS 26). Emits the current value first.
for await count in Observations({ model.errands.count }) { print(count) }

// A one-shot callback → async. Resume exactly once on every path.
func load() async throws -> Data {
    try await withCheckedThrowingContinuation { continuation in
        legacyLoad { result in continuation.resume(with: result) }
    }
}

// Time and task-local values.
let elapsed = try await ContinuousClock().measure { try await refresh() }
enum Trace { @TaskLocal static var id: String? }
try await Trace.$id.withValue("req-42") { try await refresh() }  // children see it too
```

## Rules of thumb

1. Give every piece of mutable state one home: the main actor (UI), an `actor` (shared, async), a `Mutex` (tiny, sync), or a value you copy.
2. App targets: MainActor default isolation plus approachable concurrency. Mark CPU-heavy `async` functions `@concurrent`.
3. Prefer `async let` and task groups. Every `Task { }` needs an owner who cancels it.
4. Every `await` is a point where the world can change. Re-check actor state after it.
5. Never block inside async code: no semaphores, no `DispatchQueue.sync`, no waiting on locks for async work.
6. Pass `Sendable` structs across boundaries, not objects.
7. `@unchecked Sendable` and `nonisolated(unsafe)` need a comment naming what makes them safe.
8. Let `CancellationError` propagate. Only shield cleanup.
9. `Task { }` in a finished-once job doesn't need `[weak self]`. A looping one does.

## Compiler messages: meaning → usual fix

| Message (Swift 6 mode) | What it means | Usual fix |
|---|---|---|
| `sending 'x' risks causing data races` | A non-`Sendable` value goes to another domain while your side can still reach it | Make it a `Sendable` value, create it on the far side, or stop using it after the hand-off |
| `main actor-isolated property 'p' can not be referenced from a nonisolated context` | Sync nonisolated code touched main-actor state | Make the caller `@MainActor`, or make it `async` and `await` |
| `call to main actor-isolated instance method 'f()' in a synchronous nonisolated context` | Same, for a call | Same, or `MainActor.assumeIsolated { }` in a callback you *know* runs on main |
| `actor-isolated property 'p' can not be mutated from the main actor` | Writing actor state from outside | Add an actor method that does the change |
| `expression is 'async' but is not marked with 'await'` | A call crosses an isolation boundary | Add `await` (the caller becomes `async`) |
| `capture of 'x' with non-Sendable type 'T' in a '@Sendable' closure` | The closure may run concurrently with you | Capture a `Sendable` copy, make `T` `Sendable`, or keep the work on one actor |
| `mutation of captured var 'x' in concurrently-executing code` | Children mutate a shared local | Return values from children and combine them in the parent |
| `var 'x' is not concurrency-safe because it is nonisolated global shared mutable state` | A global or static `var` | Make it `let`, isolate it (`@MainActor`), or wrap it in a `Mutex` |
| `static property 'shared' is not concurrency-safe because non-'Sendable' type 'T' may have shared mutable state` | A singleton of a non-`Sendable` type | Make `T` an actor, `@MainActor`, or `Sendable` with a `Mutex` inside |
| `stored property 'p' of 'Sendable'-conforming class 'C' is mutable` | A `var` in a `Sendable` class | Use `let`, a `Mutex`, or turn `C` into an actor |
| `type 'T' does not conform to the 'Sendable' protocol` | A `Sendable` value is required here | Conform `T` (value type), or restructure so it doesn't cross |
| `main actor-isolated conformance of 'T' to 'P' cannot be used in nonisolated context` | Default isolation made `T` and its conformance `@MainActor` | Mark `T` `nonisolated` |
| `conformance of 'T' to protocol 'P' crosses into main actor-isolated code and can cause data races` | Main-actor members satisfy a nonisolated protocol | Write an isolated conformance (`T: @MainActor P`) or make the members `nonisolated` |
| `explicit use of 'self' is required when 'self' is optional, to make control flow explicit` | You captured `[weak self]` | `guard let self else { return }` |
| `Unstructured throwing task created by 'init(priority:operation:)' is unused` (warning, 6.4) | The task's error would be dropped | Store the task and await `.value`, or catch inside |

Many diagnostics end with a group name in brackets, such as `[#NoUseUnstructuredThrowingTask]`. Pass that name to `@diagnose(Group, as: …)` (Swift 6.4) or SwiftPM's `.treatWarning(_:as:)` to change its severity.

## Swift Testing in one block

```swift
import Foundation
import Testing
@testable import Errand

struct StatusTests {
    @Test func `pending can start`() { #expect(Status.pending.canMove(to: .running)) }

    @Test(arguments: Status.allCases)
    func `nothing leaves done`(next: Status) { #expect(!Status.done.canMove(to: next)) }

    @Test func `unknown errand throws`() async {
        let id = UUID()
        await #expect(throws: StoreError.errandNotFound(id)) {
            try await ErrandStore().errand(withID: id)
        }
    }
}
```

`#require(x)` unwraps an optional or stops the test. `confirmation { confirm in … }` checks that an event fires. Tests run in parallel by default; `.serialized` opts out.

## Debugging concurrency

- Name tasks: `Task(name: "Sync \(id)") { … }` and `group.addTask(name:) { … }`.
- LLDB (Xcode 27): `language swift task tree` prints every task the debugger knows about.
- Instruments: the Swift Concurrency template shows tasks and actors. Xcode 27 adds a Swift Executors instrument (main actor, cooperative pool, custom executors) and groups tasks into Task Collections.

<details><summary>Verified APIs</summary>

- `Task.init(name:priority:operation:)` — iOS 13.0
- `Task.detached(name:priority:operation:)` — iOS 13.0
- `Task.value` — iOS 13.0
- `Task.cancel()` — iOS 13.0
- `Task.isCancelled` — iOS 13.0
- `Task.checkCancellation()` — iOS 13.0
- `Task.sleep(for:tolerance:clock:)` — iOS 16.0
- `CancellationError` — iOS 13.0
- `withTaskCancellationHandler(operation:onCancel:isolation:)` — iOS 13.0
- `withTaskCancellationShield(operation:)` — iOS 27.0
- `withThrowingTaskGroup(of:returning:isolation:body:)` — iOS 13.0
- `ThrowingTaskGroup.reduce(_:_:)` — iOS 13.0
- `TaskGroup.addTask(name:priority:operation:)` — iOS 13.0
- `withThrowingDiscardingTaskGroup(returning:isolation:body:)` — iOS 17.0
- `Actor` — iOS 13.0
- `MainActor` — iOS 13.0
- `MainActor.assumeIsolated(_:file:line:)` — iOS 13.0
- `GlobalActor` — iOS 13.0
- `Sendable` — iOS 8.0
- `Mutex` — iOS 18.0
- `Mutex.withLock(_:)` — iOS 18.0
- `Atomic` — iOS 18.0
- `Atomic.add(_:ordering:)` — iOS 18.0
- `Atomic.load(ordering:)` — iOS 18.0
- `AtomicUpdateOrdering.relaxed` — iOS 18.0
- `AtomicLoadOrdering.relaxed` — iOS 18.0
- `AsyncStream` — iOS 13.0
- `AsyncStream.makeStream(of:bufferingPolicy:)` — iOS 13.0
- `AsyncStream.Continuation.yield(_:)` — iOS 13.0
- `AsyncStream.Continuation.finish()` — iOS 13.0
- `AsyncStream.Continuation.onTermination` — iOS 13.0
- `Observations` — iOS 26.0
- `withCheckedThrowingContinuation(function:_:)` — iOS 13.0
- `CheckedContinuation.resume(with:)` — iOS 13.0
- `ContinuousClock` — iOS 16.0
- `ContinuousClock.init()` — iOS 16.0
- `Clock.measure(_:)` — iOS 16.0
- `Duration` — iOS 16.0
- `TaskLocal` — iOS 13.0
- `TaskLocal.withValue(_:operation:file:line:)` — iOS 13.0
- `JSONDecoder.decode(_:from:)` — iOS 8.0
- `Test(_:_:)`, `Test(_:_:arguments:)` — Swift 6.0, Xcode 16.0
- `expect(_:_:sourceLocation:)`, `expect(throws:_:sourceLocation:performing:)` — Swift 6.0, Xcode 16.0
- `require(_:_:sourceLocation:)` — Swift 6.0, Xcode 16.0
- `confirmation(_:expectedCount:isolation:sourceLocation:_:)` — Swift 6.0, Xcode 16.0
- `Trait.serialized` — Swift 6.0, Xcode 16.0
- `SwiftSetting.defaultIsolation(_:_:)` — SwiftPM 6.2
- `SwiftSetting.enableUpcomingFeature(_:_:)` — SwiftPM 5.8
- `SwiftSetting.treatWarning(_:as:_:)` — SwiftPM 6.2

Build settings (`SWIFT_VERSION`, `SWIFT_DEFAULT_ACTOR_ISOLATION`, `SWIFT_APPROACHABLE_CONCURRENCY`, `SWIFT_STRICT_CONCURRENCY`) come from Xcode's build settings reference. Diagnostic wording comes from the Swift compiler's diagnostic definitions and the Swift changelog. `@concurrent`, `nonisolated(nonsending)`, `isolated deinit`, async `defer`, `~Sendable` and `@diagnose` come from the Swift changelog and Swift Evolution (SE-0461, SE-0371, SE-0493, SE-0518, SE-0522).

</details>
