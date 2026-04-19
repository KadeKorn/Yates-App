# HIT Log

A mobile-first, local-first workout logging app for HIT / Dorian Yates style training.

## Current MVP

The current MVP is focused on one clear use case:

- seeded Day 1 / Day 2 / Day 5 workout templates
- next-workout recommendation logic
- latest logs by active template
- fast workout logging
- exercise history
- editable workout templates
- SQLite local persistence
- offline-first behavior

This is **not** the full future-state fitness platform yet.

The current MVP does **not** include:
- cloud sync
- authentication
- analytics
- AI coaching
- calendar scheduling engine
- wearable integrations
- custom multi-program builder
- search/filter UI

## Current progress

### Completed
- [x] Expo SDK 54 app setup
- [x] GitHub repo setup
- [x] Product spec
- [x] Architecture doc
- [x] Scope and coding standards docs
- [x] SQLite foundation
- [x] Schema + migration bootstrap
- [x] Plan C seed templates and exercises
- [x] Repository read queries
- [x] Queue recommendation logic
- [x] DB-backed Home screen

### In progress
- [ ] Workout logger flow
- [ ] Save completed workout atomically
- [ ] Exercise history screen
- [ ] Template editor

### Future state
- [ ] Multiple training systems/templates
- [ ] Custom template builder
- [ ] Home workout mode
- [ ] Calisthenics mode
- [ ] CrossFit-style templates
- [ ] Search / filter UI
- [ ] Cloud sync
- [ ] Broader progression tooling

## What this repo is

HIT Log is a local-first workout logger built for fast gym use.

The current product direction is:
- open the app
- see what workout is next
- review latest logs
- log a workout quickly
- save it locally
- come back next time and compare against prior performance

## Tech stack

- Expo
- React Native
- TypeScript
- Expo Router
- expo-sqlite

## Repository docs

Read these before making meaningful changes:

- `PRODUCT_SPEC.md`
- `ARCHITECTURE.md`
- `TASKLIST.md`
- `UI_RULES.md`
- `CODING_STANDARDS.md`
- `CONTRIBUTING.md`

## Bootstrap

```bash
npx create-expo-app@latest --template default hit-log
cd hit-log
npx expo install expo-router expo-sqlite react-native-safe-area-context react-native-screens expo-status-bar