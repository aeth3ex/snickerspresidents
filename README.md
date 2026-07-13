# Snickers Presidents

A turn-based strategy game for two players (Red vs Yellow) with tactical elements and randomness.

## Game Description

Snickers Presidents is a strategic board game where two players control their units on a grid. The goal is to eliminate the opponent's King or capture all territories.

## Features

- **Two game modes**: Placement mode and battle mode
- **Unit system**: 7 different unit types with unique abilities
- **Economy**: Manage money to purchase units
- **Multi-language**: Russian and English support
- **Export/Import**: Save and load game state
- **Action log**: Complete history of all moves
- **Supabase integration**: Data synchronization and news

## Units

- **B - Fighter** (4 HP, 3 Snickers): Attacks and captures cells. Moves 1 cell.
- **K - King** (5 HP, Free): Moves 1 cell, captures cells. If killed — team loses.
- **M - Medic** (3 HP, 3 Snickers): Heals adjacent unit (+1 HP), not self. 2-turn cooldown.
- **W - Remote Medic** (2 HP, 7 Snickers): Heals any unit on the map (+1 HP). Shared 5-turn cooldown for all W units.
- **D - Banker** (2 HP, 2 Snickers): Generates +0.5 Snickers each turn.
- **E - Defender** (4 HP, 3 Snickers): Blocks all attacks on its cell. Prevents enemy entry.
- **R - Scout** (1 HP, 6 Snickers): Moves 2 cells (1 diagonal allowed). Captures cells, cannot attack. Bypasses Defender.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Supabase

## Live Site

https://aeth3ex.github.io/snickers-presidents/

## License

MIT
