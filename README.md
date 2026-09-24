<p align="center"><img src="assets/art/hero.svg" alt="Agentic iOS: an idea atlas. An iPhone Live Activity shows an agent that rebooked a cancelled flight and is waiting for the user's OK." width="100%"></p>

# Agentic iOS: an idea atlas

An atlas of iPhone apps that **plan and act for you**, not just chat. It has three parts:

- **B · Being built now**: what companies and indie developers are shipping in 2025–2026, and how it's going.
- **W · Whitespace**: apps that today's iPhone could run, but almost nobody is building.
- **M · Moonshots**: apps worth wanting that are still genuinely hard, and the specific wall each one hits.

Every idea gets a card with the moment it helps, how the agent works (with a diagram), which iOS frameworks it would use, what makes it hard, how it could go wrong, the **unsaid assumptions** it depends on, and the **unknown unknowns** nobody has answered yet.

Snapshot date: **September 2026** (iOS 27, a week after Siri AI's beta launch).

<!-- BEGIN GENERATED:stats -->
<!-- END GENERATED:stats -->

<p align="center"><img src="assets/charts/difficulty-novelty.svg" alt="Unit chart: every idea placed by difficulty (1 to 5) and novelty (1 to 5), colored by tier" width="100%"></p>

## Flagship ideas

Eight ideas that best show what each tier looks like. Each has a deep dive and a mockup.

<!-- BEGIN GENERATED:flagships -->
<!-- END GENERATED:flagships -->

<!-- FIGMA_GALLERY -->

## What counts as "agentic"

An app is agentic when it takes several steps toward a goal on your behalf: it reads, decides, acts, checks, and remembers. A chatbot that answers questions isn't. An app that watches your flight, finds a new one when it's cancelled, holds a seat, and asks you to approve the fare difference is.

How much it does before asking you is the most important design choice. Every card names its rung on this ladder:

<p align="center"><img src="assets/art/autonomy-ladder.svg" alt="The autonomy ladder: L1 suggests, L2 drafts for your approval, L3 acts inside your limits and reports, L4 runs long goals on its own" width="100%"></p>

## The walls

iOS is the hardest platform to build an agent on. A third-party app can't read or tap other apps, can't read your texts or the Mail app, can't hear phone calls, and can't run forever in the background. So most serious agents run their loop in the cloud and use the iPhone to brief, show and ask.

<p align="center"><img src="assets/art/the-walls.svg" alt="The doors Apple provides into an app's sandbox, what's behind the wall, and the cloud detour most agents take" width="100%"></p>

Full list with workarounds and sources: **[docs/the-walls.md](docs/the-walls.md)**.

## All ideas

<!-- BEGIN GENERATED:all-ideas -->
<!-- END GENERATED:all-ideas -->

<p align="center"><img src="assets/charts/category-tiers.svg" alt="Stacked bars: number of ideas per category, split by tier" width="820"></p>

The full sortable index with scores is in **[ideas/README.md](ideas/README.md)**.

## Read more

| Doc | What's in it |
|---|---|
| [The landscape, September 2026](docs/landscape-2026.md) | Who is shipping what, a timeline, what's working and what isn't |
| [The walls](docs/the-walls.md) | Every technical, policy, money and security wall, with workarounds |
| [Reference architecture](docs/reference-architecture.md) | How to build an agentic iPhone app inside the walls, with diagrams |
| [Unsaid and wrong assumptions](docs/assumptions.md) | The beliefs that sink agent products, and the open questions |
| [Agent UI patterns](docs/ui-patterns.md) | Mockups of approval, status, receipt and guardrail screens |
| [How this atlas was made](docs/method.md) | Sources, scoring, and the limits of this snapshot |

## Contributing

Found something wrong, or an idea that belongs here? See [CONTRIBUTING.md](CONTRIBUTING.md). Everything under `ideas/` is generated from [`data/ideas.json`](data/ideas.json) by `scripts/build.py`.

## License

Text, data and images: [CC BY 4.0](LICENSE). Scripts: [MIT](LICENSE-CODE).

Apple, iPhone, Siri, and other product names are trademarks of their owners. This project isn't affiliated with or endorsed by Apple or any company named here.
