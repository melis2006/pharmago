# AI usage

## Tools
- **Lovable**: generated the first prototype of the site from my Figma design and page descriptions.
- **Claude Code**: step by step (one commit per step).

## What I did myself
- Designed the mobile screens in Figma.
- Wrote the product description, scope, requirements and acceptance criteria.
- Wrote the instructions for each AI step and chose what to build.
- Reviewed every commit, ran the tests, and tested by hand on a phone and a laptop.

## What the AI did
Wrote the code for: project setup, demo data from my design,tests and GitHub Actions, privacy features, layout and code clean-up.

## How I verified it
- Ran `npm test`. Test names match the acceptance criteria (see `docs/testing.md`).
- Broke the code on purpose (reversed the Cheapest sort, removed the consent rule); the tests failed, then passed after restoring it.
- GitHub Actions runs tests and build on every push.
- Compared the pages with my Figma design and tested the full flow by hand.
- Checked the Network tab (no requests to other servers) and `npm audit`.
