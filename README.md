# Gunner Up

Advanced vertical shooter with dynamic soldier formation physics.

## Features

### Core Gameplay
- **MainSoldier System**: Golden commander soldier as formation anchor
- **Dynamic Formation**: Up to 1000+ soldiers with rubberbanding physics
- **Individual Hitboxes**: Each soldier has independent collision detection
- **Mutual Damage**: Soldiers damage enemies on contact (25 damage)
- **Upgrade Barriers**: Choose between additive (+1,+2,+3) or multiplicative (×2,×3) upgrades

### Advanced Physics
- **Rubberbanding**: Elastic formation around MainSoldier with spring forces
- **Collision Avoidance**: Soldiers avoid overlapping (25px radius)
- **Swarm Cohesion**: Natural clustering behavior (60px radius)
- **Movement Alignment**: Synchronized movement like bird flocks
- **Density Behavior**: Vertical movement based on soldier density
  - High density: Soldiers move backward (defensive)
  - Low density: Soldiers move forward (aggressive)

### Technical Features
- **Spatial Partitioning**: Optimized collision detection for 1000+ objects
- **Batch Rendering**: Performance-optimized rendering system
- **Configurable Physics**: Toggle any physics system via settings UI
- **Enemy Types**: Color-coded enemies (green/blue/red) with varying difficulty
- **Score Multiplier**: Timed score bonuses with visual countdown

## Controls
- **A/D or Arrow Keys**: Move MainSoldier horizontally
- **Mouse Click**: Collect powerups / interact with UI
- **Settings Menu**: Configure physics before game start

## Installation
1. Clone repository
2. Open `index.html` in web browser
3. Configure physics settings
4. Click "Start Game"

## Development
- **Main Branch**: Stable release version
- **feature/dynamic-rubberbanding**: Advanced physics development

Built with HTML5 Canvas, JavaScript ES6+ classes, and advanced physics simulation.