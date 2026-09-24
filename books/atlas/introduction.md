# Agentic iOS: an idea atlas

This book collects 85 ideas for iPhone apps that **plan and act for you**. It's a snapshot of September 2026, the week after iOS 27 shipped with Siri AI as an opt-in beta.

<p align="center"><img src="../../assets/art/hero.svg" alt="An iPhone Live Activity shows an agent that rebooked a cancelled flight and is waiting for the user's OK" width="100%"></p>

## What's in it

The ideas come in three tiers.

| Tier | Ideas | What it means |
|---|---|---|
| **B · Being built now** | 26 | Categories of agentic iPhone apps that companies are shipping in 2025–2026, with named examples and an honest account of how each is going. |
| **W · Whitespace** | 33 | Apps that today's iPhone could run, with today's APIs and models, that almost nobody is building. |
| **M · Moonshots** | 26 | Apps worth wanting that are still genuinely hard. Each names the specific wall in the way and what would have to change. |

Before the ideas, five chapters describe the terrain: who is building what, the walls iOS puts in the way, a reference architecture for building inside them, the assumptions that sink agent products, and a small set of UI patterns for agents.

## How to read a card

Every card has the same anatomy, so you can skim across them:

1. **Scores.** Difficulty, novelty, how buildable it is on iOS today, and impact, each from 1 to 5. Plus a time horizon and the rung on the autonomy ladder.
2. **The moment.** A concrete scene where the agent earns its keep.
3. **The problem.** The job to be done, and why today's apps fail at it.
4. **How the agent works.** A diagram of the loop: what triggers it, what it reads, what it decides, where it checks with you, what it does, and what it remembers.
5. **iOS building blocks.** The real frameworks it would use, checked against Apple's documentation.
6. **What makes it hard,** and **risks and failure modes.**
7. **Unsaid assumptions.** What the idea quietly depends on being true.
8. **Unknown unknowns.** Questions nobody has good answers to yet.
9. **Prior art.** What exists, with links, and why it falls short.
10. **Smallest useful first version.**
11. **Research notes.** What could and couldn't be verified.

The eight flagship cards also have a deep dive with a sequence diagram, notes on the first 90 days, the hardest engineering problem, and a business model.

## The autonomy ladder

How much an agent does before asking you is the most important design choice in every card.

<p align="center"><img src="../../assets/art/autonomy-ladder.svg" alt="The autonomy ladder: L1 suggests, L2 drafts for your approval, L3 acts inside your limits and reports, L4 runs long goals on its own" width="100%"></p>

## Where the ideas sit

<p align="center"><img src="../../assets/charts/difficulty-novelty.svg" alt="Every idea placed by difficulty and novelty" width="100%"></p>

<p align="center"><img src="../../assets/charts/category-tiers.svg" alt="Ideas per category, split by tier" width="90%"></p>

## The eight flagships

<p align="center"><img src="../../assets/mockups/gallery.png" alt="Eight iPhone mockups, one per flagship idea" width="100%"></p>

## Reading paths

- **If you're building a company,** start with the Whitespace tier, then read "The walls" before you fall in love with anything.
- **If you're a designer,** read the UI patterns chapter and the eight flagship cards.
- **If you're an iOS engineer,** read the reference architecture, then any card's "iOS building blocks" and "What makes it hard".
- **If you invest or do research,** read the landscape chapter and the Moonshots. Each moonshot says what would have to change for it to become buildable.

A companion book, **iOS 27 in 7 Days**, teaches the platform these ideas are built on. A third book, **The Agentic Phone**, imagines the operating system that would make most of these ideas unnecessary to build one by one.

Nothing in this book is legal, medical or financial advice. Cards in those areas name their safety lines.
