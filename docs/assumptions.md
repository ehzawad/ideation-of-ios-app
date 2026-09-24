[← Back to the atlas](../README.md)

# Unsaid and wrong assumptions

Ideas for agentic apps tend to share a handful of assumptions nobody says out loud. Some are fine. Some are wrong, and they sink products. Every idea card in this atlas has its own "Unsaid assumptions" and "Unknown unknowns" sections. This page collects the ones that show up everywhere.

## Assumptions that are usually wrong

| The assumption | Why it breaks | What the evidence says |
|---|---|---|
| **"Users want the agent to do everything."** | People want to hand off chores, not control. Most want to approve before money moves. | Consumers "trust AI to advise but don't consent to it purchasing for them" ([CX Dive](https://www.customerexperiencedive.com/news/consumers-trust-ai-advise-do-not-consent-purchasing-them/830941/)). Only 20% of AI users have given an agent a financial account ([Menlo](https://menlovc.com/perspective/2026-the-state-of-consumer-ai/)). |
| **"95% accurate is good enough."** | In chores that repeat, small errors compound. Checking the agent's work can cost more than doing the task. | Milo, a funded family-logistics assistant, shut down in January 2026 because small extraction errors created more work for families. |
| **"The agent can just use my apps."** | On iOS it can't. No third-party app can see or tap another app's screen. | See [the walls](the-walls.md). Even in a simulator, the best agent on CMU's iOSWorld benchmark managed 37% of multi-app tasks ([paper](https://huggingface.co/papers/2606.09764)). |
| **"Siri will call my App Intents, so I get distribution."** | Siri AI is a gated beta: waitlist, English only, iPhone 15 Pro and later, not on iPhone in the EU or China. Apple's model is the planner; you're a tool it may or may not pick. | Reviewers report patchy third-party coverage at launch. |
| **"On-device means private, cloud means not."** | On-device models can still leak through what the agent *does* (sending a message to the wrong person). Apple's Private Cloud Compute is designed for privacy while running in the cloud. | Frontier agents leak personal context, including to the wrong recipient, in most test scenarios ([Agent CI Bench](https://huggingface.co/papers/2606.23189)). |
| **"The model is the moat."** | Everyone has access to the same frontier models, and Apple now gives small developers a server model for free. | The durable advantages are trust, integrations, the action log, and being right about the user's context. |
| **"Checkout inside the agent is the endgame."** | It converted worse than a click-through to the store. | OpenAI dropped ChatGPT Instant Checkout in March 2026 after Walmart measured about 3× worse conversion ([MacRumors](https://www.macrumors.com/2026/03/25/chatgpt-revamps-shopping-features/)). |
| **"If it's technically possible, App Review will allow it."** | Guidelines 2.5.2 (no downloaded code), 4.7 (plug-in stores), 5.1.2(i) (AI consent) and 5.2.2 (third-party terms) shape what can ship. | Apple blocked updates to vibe-coding apps in March 2026. |
| **"Agents save time."** | Only if checking the result is cheaper than doing the task. For many chores it isn't, yet. | Design for quick verification: receipts, sources, diffs, undo. |
| **"Everyone's phone can run it."** | Apple Intelligence needs an iPhone 15 Pro or later. The people most exposed to scams, older adults, often have older phones. | Plan the fallback before you plan the demo. |

## Assumptions that are usually right, but unstated

- **The other side is automating too.** Insurers use AI to deny claims. Retailers use retention bots. Scammers use voice clones. A consumer agent is often facing another agent, not a person.
- **The agent will be attacked through its inputs.** Any email, web page or calendar invite it reads can carry instructions. Design as if they will.
- **Someone has to be liable.** When an agent books the wrong flight, the question "who pays?" has no settled answer yet. Products that answer it clearly will earn trust.
- **Regions differ.** The EU, Japan and Brazil have opened doors the US hasn't. Siri AI isn't on iPhone in the EU. The best market for an idea may not be the default one.

## Unknown unknowns

Questions nobody has good answers to yet. They affect almost every idea in the atlas.

1. **Will Apple open App Intents to third-party agents?** Code hints at MCP support, but iOS 27 didn't ship it. If Apple opens it, half the Moonshots move tiers overnight.
2. **What happens when agents negotiate with agents?** Your bill-negotiation agent calls a retention bot. Nobody knows what fair looks like, or who audits it.
3. **How will memory age?** An agent that remembers you for years will remember things you've changed your mind about. Forgetting is a feature nobody has designed well.
4. **What does consent mean for a family?** A caregiver's agent acting for a parent with dementia. A co-parent's agent reading school email. Consent models are built for one person.
5. **How much can a phone-sized model (about 3B parameters in Apple's 2025 version) really plan?** The on-device model is good at extraction and short tool calls. Long-horizon planning on-device is an open research question.
6. **What will App Review do with agents?** Trade reports say Apple is drafting agent-specific policy. Nothing is in the guidelines yet.
7. **Who is the customer?** Only about 3% of AI users paid for AI in 2025 ([Menlo](https://menlovc.com/perspective/2025-the-state-of-consumer-ai/)). Outcome-based pricing (pay when the agent saves you money) is mostly untested on iOS.
