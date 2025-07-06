class Game {
    constructor() {
        console.log('Game constructor called!');
        this.canvas = document.getElementById('gameCanvas');
        console.log('Canvas element:', this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameState = 'playing';
        this.score = 0;
        this.health = 100;
        this.soundEnabled = true;
        this.multiplier = 1;
        this.multiplierTimer = 0;
        this.multiplierDuration = 10000;
        
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.deadSoldiers = [];
        this.upgradeBarriers = [];
        this.barrierSpawnTimer = 0;
        this.barrierSpawnInterval = 12000;
        this.nextBarrierId = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 2000;
        
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        
        this.spatialGrid = new SpatialGrid(this.width, this.height, 50);
        
        this.physicsSettings = {
            collisionAvoidance: true,
            swarmCohesion: true,
            alignment: true,
            densityBehavior: true
        };
        
        this.lastTime = 0;
        
        this.init();
    }
    
    init() {
        console.log('init() called');
        this.setupInitialEventListeners();
        this.showSettings();
    }
    
    setupInitialEventListeners() {
        const startGameBtn = document.getElementById('startGame');
        console.log('Start button element:', startGameBtn);
        
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => {
                console.log('Start button clicked!');
                this.startGame();
            });
            console.log('Event listener added to start button');
        } else {
            console.error('Start button not found!');
        }
    }
    
    showSettings() {
        console.log('showSettings() called');
        const overlay = document.getElementById('settingsOverlay');
        const gameContainer = document.getElementById('gameContainer');
        console.log('Settings overlay:', overlay);
        console.log('Game container:', gameContainer);
        
        if (overlay) {
            overlay.style.display = 'flex';
            console.log('Settings overlay shown');
        } else {
            console.error('Settings overlay not found!');
        }
        
        if (gameContainer) {
            gameContainer.style.display = 'none';
        } else {
            console.error('Game container not found!');
        }
    }
    
    startGame() {
        console.log('startGame() called!');
        
        this.physicsSettings.collisionAvoidance = document.getElementById('collisionAvoidance').checked;
        this.physicsSettings.swarmCohesion = document.getElementById('swarmCohesion').checked;
        this.physicsSettings.alignment = document.getElementById('alignment').checked;
        this.physicsSettings.densityBehavior = document.getElementById('densityBehavior').checked;
        
        console.log('Physics settings:', this.physicsSettings);
        
        const overlay = document.getElementById('settingsOverlay');
        const gameContainer = document.getElementById('gameContainer');
        
        console.log('Overlay element:', overlay);
        console.log('Game container element:', gameContainer);
        
        if (overlay) overlay.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'block';
        
        this.setupEventListeners();
        this.createPlayers();
        this.createEnemies();
        this.gameLoop();
        
        console.log('Game started successfully!');
    }
    
    setupEventListeners() {
        const playBtn = document.getElementById('playBtn');
        const soundBtn = document.getElementById('soundBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        
        playBtn.addEventListener('click', () => this.togglePause());
        soundBtn.addEventListener('click', () => this.toggleSound());
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        settingsBtn.addEventListener('click', () => this.showSettings());
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }
    
    createPlayers() {
        this.player = new Player(this.width / 2, this.height - 60, this);
    }
    
    createEnemies() {
        this.enemies = [];
    }
    
    spawnEnemy() {
        const x = Math.random() * (this.width - 60);
        const rand = Math.random();
        let health, type, color;
        
        if (rand < 0.5) {
            health = Math.floor(Math.random() * 30) + 10;
            type = 'small';
            color = 'green';
        } else if (rand < 0.8) {
            health = Math.floor(Math.random() * 200) + 50;
            type = 'medium';
            color = 'blue';
        } else {
            health = Math.floor(Math.random() * 800) + 200;
            type = 'large';
            color = 'red';
        }
        
        this.enemies.push(new Enemy(x, -50, health, type, color));
    }
    
    handleClick(e) {
        if (this.gameState !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
    }
    
    spawnUpgradeBarrier() {
        const leftUpgrade = this.generateRandomUpgrade();
        const rightUpgrade = this.generateRandomUpgrade();
        const pairId = this.nextBarrierId++;
        
        this.upgradeBarriers.push(new UpgradeBarrier(0, -100, this.width / 2, 80, leftUpgrade, 'left', pairId));
        this.upgradeBarriers.push(new UpgradeBarrier(this.width / 2, -100, this.width / 2, 80, rightUpgrade, 'right', pairId));
    }
    
    generateRandomUpgrade() {
        const upgrades = [
            { type: 'add', value: 1 },
            { type: 'add', value: 2 },
            { type: 'add', value: 3 },
            { type: 'multiply', value: 2 },
            { type: 'multiply', value: 3 }
        ];
        return upgrades[Math.floor(Math.random() * upgrades.length)];
    }
    
    applyUpgrade(upgrade) {
        if (this.player && upgrade) {
            if (upgrade.type === 'add') {
                for (let i = 0; i < upgrade.value; i++) {
                    this.player.addSoldier();
                }
            } else if (upgrade.type === 'multiply') {
                const currentSoldiers = this.player.soldiers.length;
                const newSoldiers = currentSoldiers * (upgrade.value - 1);
                for (let i = 0; i < newSoldiers; i++) {
                    this.player.addSoldier();
                }
            }
            this.createParticles(this.player.x, this.player.y, 'upgrade');
        }
    }
    
    checkSoldierEnemyCollisions() {
        if (!this.player) return;
        
        this.spatialGrid.clear();
        this.enemies.forEach(enemy => this.spatialGrid.addEnemy(enemy));
        this.player.soldiers.forEach(soldier => {
            if (!soldier.isDead) {
                this.spatialGrid.addSoldier(soldier);
            }
        });
        
        const collisions = this.spatialGrid.getCollisions();
        
        collisions.forEach(({soldier, enemy}) => {
            if (!soldier.isDead && this.collision(soldier, enemy)) {
                enemy.takeDamage(25);
                soldier.die();
                this.deadSoldiers.push(soldier);
                
                const soldierIndex = this.player.soldiers.indexOf(soldier);
                if (soldierIndex > -1) {
                    this.player.soldiers.splice(soldierIndex, 1);
                }
                
                this.createParticles(soldier.x, soldier.y, 'explosion');
                
                if (enemy.health <= 0) {
                    this.score += enemy.maxHealth * this.multiplier;
                    this.createParticles(enemy.x, enemy.y, 'explosion');
                    
                    const enemyIndex = this.enemies.indexOf(enemy);
                    if (enemyIndex > -1) {
                        this.enemies.splice(enemyIndex, 1);
                    }
                }
            }
        });
        
        this.upgradeBarriers.forEach((barrier, index) => {
            if (this.player.mainSoldier && this.collision(this.player.mainSoldier, barrier)) {
                this.applyUpgrade(barrier.upgrade);
                this.upgradeBarriers = this.upgradeBarriers.filter(b => b.pairId !== barrier.pairId);
            }
        });
        
        if (this.player.soldiers.length === 0) {
            this.gameState = 'gameOver';
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }
    
    togglePause() {
        this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = this.gameState === 'playing' ? '⏸' : '▶';
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundBtn');
        soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            document.body.classList.add('fullscreen');
        } else {
            document.exitFullscreen();
            document.body.classList.remove('fullscreen');
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        if (this.player) this.player.update(deltaTime, this.keys);
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        this.bullets.forEach(bullet => bullet.update(deltaTime));
        this.particles.forEach(particle => particle.update(deltaTime));
        this.upgradeBarriers.forEach(barrier => barrier.update(deltaTime));
        this.deadSoldiers.forEach(soldier => soldier.update(deltaTime));
        
        this.barrierSpawnTimer += deltaTime;
        if (this.barrierSpawnTimer >= this.barrierSpawnInterval) {
            this.spawnUpgradeBarrier();
            this.barrierSpawnTimer = 0;
        }
        
        if (this.multiplierTimer > 0) {
            this.multiplierTimer -= deltaTime;
            if (this.multiplierTimer <= 0) {
                this.multiplier = 1;
            }
        }
        
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        this.checkCollisions();
        this.checkSoldierEnemyCollisions();
        this.cleanupObjects();
        this.updateUI();
    }
    
    checkCollisions() {
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (bullet.owner === 'player' && this.collision(bullet, enemy)) {
                    const damage = bullet.damage;
                    enemy.takeDamage(damage);
                    
                    this.createDamageText(enemy.x, enemy.y, damage);
                    this.createParticles(bullet.x, bullet.y, 'hit');
                    
                    this.bullets.splice(bulletIndex, 1);
                    
                    if (enemy.health <= 0) {
                        this.score += enemy.maxHealth * this.multiplier;
                        this.createParticles(enemy.x, enemy.y, 'explosion');
                        
                        
                        this.enemies.splice(enemyIndex, 1);
                    }
                }
            });
        });
    }
    
    collision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createDamageText(x, y, damage) {
        this.particles.push(new DamageText(x, y, damage));
    }
    
    createParticles(x, y, type) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, type));
        }
    }
    
    cleanupObjects() {
        this.bullets = this.bullets.filter(bullet => bullet.alive);
        this.particles = this.particles.filter(particle => particle.alive);
        this.enemies = this.enemies.filter(enemy => enemy.alive && enemy.y < this.height + 100);
        this.upgradeBarriers = this.upgradeBarriers.filter(barrier => barrier.alive);
        this.deadSoldiers = this.deadSoldiers.filter(soldier => soldier.alive);
    }
    
    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('health').textContent = `Health: ${this.health}`;
        
        if (this.multiplier > 1) {
            const timeLeft = Math.ceil(this.multiplierTimer / 1000);
            document.getElementById('multiplier').textContent = `×${this.multiplier} (${timeLeft}s)`;
            document.getElementById('multiplier').style.display = 'block';
        } else {
            document.getElementById('multiplier').style.display = 'none';
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawBackground();
        
        this.upgradeBarriers.forEach(barrier => barrier.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        if (this.player) this.player.render(this.ctx);
        
        if (this.deadSoldiers.length > 0) {
            this.ctx.fillStyle = '#8B4513';
            this.deadSoldiers.forEach(soldier => {
                const size = soldier.width * 0.7;
                this.ctx.fillRect(soldier.x - size/2, soldier.y - size/2, size, size);
            });
        }
        
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.particles.forEach(particle => particle.render(this.ctx));
        
        if (this.gameState === 'paused') {
            this.drawPauseScreen();
        }
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#98FB98');
        gradient.addColorStop(1, '#8B4513');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

class Player {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.alive = true;
        this.shootCooldown = 0;
        this.maxCooldown = 200;
        this.speed = 200;
        this.soldiers = [];
        this.game = game;
        
        this.mainSoldier = new MainSoldier(x, y, this);
        this.addSoldier();
    }
    
    update(deltaTime, keys) {
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
        
        if (this.mainSoldier) {
            this.mainSoldier.update(deltaTime, keys);
        }
        
        this.soldiers.forEach(soldier => soldier.update(deltaTime));
        
        this.autoShoot();
    }
    
    autoShoot() {
        if (this.shootCooldown <= 0) {
            if (this.mainSoldier) {
                this.mainSoldier.shoot();
            }
            
            this.soldiers.forEach(soldier => {
                soldier.shoot();
            });
            this.shootCooldown = this.maxCooldown;
        }
    }
    
    addSoldier() {
        if (this.soldiers.length < 1000) {
            const soldier = new Soldier(this.x, this.y, this);
            this.soldiers.push(soldier);
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        if (this.mainSoldier) {
            this.mainSoldier.render(ctx);
        }
        
        const livingPositions = [];
        const deadPositions = [];
        
        this.soldiers.forEach(soldier => {
            if (soldier.isDead) {
                deadPositions.push({ x: soldier.x, y: soldier.y, size: soldier.width * 0.7 });
            } else {
                livingPositions.push({ x: soldier.x, y: soldier.y, size: soldier.width });
            }
        });
        
        if (deadPositions.length > 0) {
            ctx.fillStyle = '#8B4513';
            deadPositions.forEach(pos => {
                ctx.fillRect(pos.x - pos.size/2, pos.y - pos.size/2, pos.size, pos.size);
            });
        }
        
        if (livingPositions.length > 0) {
            ctx.fillStyle = '#4CAF50';
            livingPositions.forEach(pos => {
                ctx.fillRect(pos.x - pos.size/2, pos.y - pos.size/2, pos.size, pos.size);
            });
            
            ctx.strokeStyle = '#2E7D32';
            ctx.lineWidth = 1;
            livingPositions.forEach(pos => {
                ctx.strokeRect(pos.x - pos.size/2, pos.y - pos.size/2, pos.size, pos.size);
            });
        }
    }
}

class Enemy {
    constructor(x, y, health, type, color) {
        this.x = x;
        this.y = y;
        this.health = health;
        this.maxHealth = health;
        this.type = type;
        this.color = color;
        this.alive = true;
        
        if (type === 'small') {
            this.width = 40;
            this.height = 30;
            this.speed = 80;
        } else if (type === 'medium') {
            this.width = 60;
            this.height = 40;
            this.speed = 50;
        } else {
            this.width = 80;
            this.height = 50;
            this.speed = 30;
        }
    }
    
    update(deltaTime) {
        this.y += this.speed * deltaTime / 1000;
        
        if (this.y > 900) {
            this.alive = false;
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.alive = false;
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        const healthPercent = this.health / this.maxHealth;
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        if (this.color === 'red') {
            ctx.fillStyle = healthPercent > 0.5 ? '#FF6B6B' : '#FF3333';
        } else if (this.color === 'blue') {
            ctx.fillStyle = healthPercent > 0.5 ? '#4ECDC4' : '#45B7AA';
        } else {
            ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : '#388E3C';
        }
        
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        ctx.fillStyle = 'white';
        ctx.font = `bold ${this.type === 'small' ? '12px' : this.type === 'medium' ? '16px' : '20px'} Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.health, this.x, this.y + 5);
    }
}

class Bullet {
    constructor(x, y, angle, owner) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 8;
        this.angle = angle;
        this.speed = 300;
        this.owner = owner;
        this.damage = 10;
        this.alive = true;
    }
    
    update(deltaTime) {
        this.x += Math.cos(this.angle) * this.speed * deltaTime / 1000;
        this.y += Math.sin(this.angle) * this.speed * deltaTime / 1000;
        
        if (this.x < 0 || this.x > 500 || this.y < 0 || this.y > 800) {
            this.alive = false;
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        ctx.fillStyle = this.owner === 'player' ? '#00FF00' : '#FF0000';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        ctx.shadowColor = this.owner === 'player' ? '#00FF00' : '#FF0000';
        ctx.shadowBlur = 5;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 200;
        this.vy = (Math.random() - 0.5) * 200;
        this.life = 1000;
        this.maxLife = 1000;
        this.type = type;
        this.alive = true;
        this.size = Math.random() * 4 + 2;
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime / 1000;
        this.y += this.vy * deltaTime / 1000;
        this.life -= deltaTime;
        
        if (this.life <= 0) {
            this.alive = false;
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        const alpha = this.life / this.maxLife;
        
        if (this.type === 'hit') {
            ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        } else if (this.type === 'explosion') {
            ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
        } else if (this.type === 'powerup') {
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        } else if (this.type === 'multiplier') {
            ctx.fillStyle = `rgba(0, 191, 255, ${alpha})`;
        } else if (this.type === 'upgrade') {
            ctx.fillStyle = `rgba(0, 255, 127, ${alpha})`;
        }
        
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
}

class DamageText {
    constructor(x, y, damage) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.life = 1500;
        this.maxLife = 1500;
        this.alive = true;
        this.vy = -50;
    }
    
    update(deltaTime) {
        this.y += this.vy * deltaTime / 1000;
        this.life -= deltaTime;
        
        if (this.life <= 0) {
            this.alive = false;
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        const alpha = this.life / this.maxLife;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.damage, this.x, this.y);
        
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.strokeText(this.damage, this.x, this.y);
    }
}

class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.alive = true;
        this.speed = 100;
        this.pulseTime = 0;
        
        if (type === 'multiplier') {
            this.width = 60;
            this.height = 40;
        } else {
            this.width = 30;
            this.height = 30;
        }
    }
    
    update(deltaTime) {
        this.y += this.speed * deltaTime / 1000;
        this.pulseTime += deltaTime;
        
        if (this.y > 850) {
            this.alive = false;
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        const pulse = Math.sin(this.pulseTime / 200) * 0.3 + 0.7;
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        if (this.type === 'soldier') {
            ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
        } else if (this.type === 'soldier2') {
            ctx.fillStyle = `rgba(255, 165, 0, ${pulse})`;
        } else if (this.type === 'multiplier') {
            ctx.fillStyle = `rgba(0, 191, 255, ${pulse})`;
        }
        
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        if (this.type === 'multiplier') {
            ctx.strokeStyle = '#0080FF';
        } else {
            ctx.strokeStyle = '#FFD700';
        }
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        ctx.fillStyle = 'white';
        ctx.font = `bold ${this.type === 'multiplier' ? '24px' : '16px'} Arial`;
        ctx.textAlign = 'center';
        
        if (this.type === 'soldier') {
            ctx.fillText('+1', this.x, this.y + 5);
        } else if (this.type === 'soldier2') {
            ctx.fillText('+2', this.x, this.y + 5);
        } else if (this.type === 'multiplier') {
            ctx.fillText('×2', this.x, this.y + 8);
        }
    }
}

class UpgradeBarrier {
    constructor(x, y, width, height, upgrade, side, pairId) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.upgrade = upgrade;
        this.side = side;
        this.pairId = pairId;
        this.alive = true;
        this.speed = 50;
    }
    
    update(deltaTime) {
        this.y += this.speed * deltaTime / 1000;
        
        if (this.y > 900) {
            this.alive = false;
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        if (this.upgrade.type === 'add') {
            ctx.fillStyle = this.side === 'left' ? '#FFD700' : '#FFA500';
        } else {
            ctx.fillStyle = this.side === 'left' ? '#00BFFF' : '#0080FF';
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2 + 10;
        
        if (this.upgrade.type === 'add') {
            ctx.fillText(`+${this.upgrade.value}`, centerX, centerY);
        } else {
            ctx.fillText(`×${this.upgrade.value}`, centerX, centerY);
        }
    }
}

class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = [];
    }
    
    clear() {
        this.grid = [];
        for (let i = 0; i < this.cols * this.rows; i++) {
            this.grid[i] = { soldiers: [], enemies: [] };
        }
    }
    
    getCell(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            return this.grid[row * this.cols + col];
        }
        return null;
    }
    
    addSoldier(soldier) {
        const cell = this.getCell(soldier.x, soldier.y);
        if (cell) cell.soldiers.push(soldier);
    }
    
    getNeighbors(soldier) {
        const neighbors = [];
        const col = Math.floor(soldier.x / this.cellSize);
        const row = Math.floor(soldier.y / this.cellSize);
        
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newCol = col + i;
                const newRow = row + j;
                if (newCol >= 0 && newCol < this.cols && newRow >= 0 && newRow < this.rows) {
                    const cell = this.grid[newRow * this.cols + newCol];
                    if (cell) {
                        neighbors.push(...cell.soldiers);
                    }
                }
            }
        }
        
        return neighbors.filter(s => s !== soldier);
    }
    
    addEnemy(enemy) {
        const cell = this.getCell(enemy.x, enemy.y);
        if (cell) cell.enemies.push(enemy);
    }
    
    getCollisions() {
        const collisions = [];
        for (let i = 0; i < this.grid.length; i++) {
            const cell = this.grid[i];
            if (cell.soldiers.length > 0 && cell.enemies.length > 0) {
                cell.soldiers.forEach(soldier => {
                    cell.enemies.forEach(enemy => {
                        collisions.push({ soldier, enemy });
                    });
                });
            }
        }
        return collisions;
    }
}

class MainSoldier {
    constructor(x, y, player) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.alive = true;
        this.player = player;
    }
    
    update(deltaTime, keys) {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            this.x -= this.player.speed * deltaTime / 1000;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            this.x += this.player.speed * deltaTime / 1000;
        }
        
        this.x = Math.max(15, Math.min(this.player.game.width - 15, this.x));
        
        this.player.x = this.x;
        this.player.y = this.y;
    }
    
    shoot() {
        this.player.game.bullets.push(new Bullet(this.x, this.y, -Math.PI / 2, 'player'));
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('★', this.x, this.y + 4);
    }
}

class Soldier {
    constructor(x, y, player) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 12;
        this.alive = true;
        this.isDead = false;
        this.player = player;
        
        this.idealDistance = 30 + Math.random() * 50;
        this.idealAngle = Math.random() * Math.PI * 2;
        this.velocityX = 0;
        this.velocityY = 0;
        this.springConstant = 0.02;
        this.damping = 0.85;
        
        this.brownianX = 0;
        this.brownianY = 0;
        this.brownianTime = Math.random() * 1000;
        this.updateCounter = Math.floor(Math.random() * 5);
    }
    
    update(deltaTime) {
        if (this.isDead) {
            this.y += 50 * deltaTime / 1000;
            if (this.y > 850) {
                this.alive = false;
            }
            return;
        }
        
        const mainSoldier = this.player.mainSoldier;
        if (!mainSoldier) return;
        
        const idealX = mainSoldier.x + Math.cos(this.idealAngle) * this.idealDistance;
        const idealY = mainSoldier.y + Math.sin(this.idealAngle) * this.idealDistance;
        
        const forceX = (idealX - this.x) * this.springConstant;
        const forceY = (idealY - this.y) * this.springConstant;
        
        this.velocityX += forceX;
        this.velocityY += forceY;
        
        if (this.player.game.physicsSettings.collisionAvoidance ||
            this.player.game.physicsSettings.swarmCohesion ||
            this.player.game.physicsSettings.alignment ||
            this.player.game.physicsSettings.densityBehavior) {
            
            const neighbors = this.player.game.spatialGrid.getNeighbors(this);
            
            if (this.player.game.physicsSettings.collisionAvoidance) {
                const avoidanceForce = this.calculateAvoidance(neighbors);
                this.velocityX += avoidanceForce.x;
                this.velocityY += avoidanceForce.y;
            }
            
            if (this.player.game.physicsSettings.swarmCohesion) {
                const cohesionForce = this.calculateCohesion(neighbors);
                this.velocityX += cohesionForce.x;
                this.velocityY += cohesionForce.y;
            }
            
            if (this.player.game.physicsSettings.alignment) {
                const alignmentForce = this.calculateAlignment(neighbors);
                this.velocityX += alignmentForce.x;
                this.velocityY += alignmentForce.y;
            }
            
            if (this.player.game.physicsSettings.densityBehavior) {
                const densityResult = this.calculateDensityBehavior(neighbors);
                this.velocityX *= densityResult.speedFactor;
                this.velocityY *= densityResult.speedFactor;
                this.velocityX += densityResult.verticalForce.x;
                this.velocityY += densityResult.verticalForce.y;
            }
        }
        
        this.velocityX *= this.damping;
        this.velocityY *= this.damping;
        
        this.x += this.velocityX * deltaTime / 16.67;
        this.y += this.velocityY * deltaTime / 16.67;
        
        this.updateCounter++;
        if (this.updateCounter % 3 === 0) {
            this.brownianTime += deltaTime;
            this.brownianX = Math.sin(this.brownianTime / 300) * 2;
            this.brownianY = Math.cos(this.brownianTime / 400) * 1.5;
        }
        
        this.x += this.brownianX * deltaTime / 1000;
        this.y += this.brownianY * deltaTime / 1000;
    }
    
    die() {
        if (!this.isDead) {
            this.isDead = true;
        }
    }
    
    shoot() {
        if (!this.isDead) {
            this.player.game.bullets.push(new Bullet(this.x, this.y, -Math.PI / 2, 'player'));
        }
    }
    
    calculateAvoidance(neighbors) {
        let avoidX = 0;
        let avoidY = 0;
        const avoidRadius = 25;
        const avoidStrength = 0.05;
        
        neighbors.forEach(neighbor => {
            if (!neighbor.isDead) {
                const dx = this.x - neighbor.x;
                const dy = this.y - neighbor.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < avoidRadius && distance > 0) {
                    const force = avoidStrength / distance;
                    avoidX += (dx / distance) * force;
                    avoidY += (dy / distance) * force;
                }
            }
        });
        
        return { x: avoidX, y: avoidY };
    }
    
    calculateCohesion(neighbors) {
        if (neighbors.length === 0) return { x: 0, y: 0 };
        
        let centerX = 0;
        let centerY = 0;
        let count = 0;
        const cohesionRadius = 60;
        const cohesionStrength = 0.001;
        
        neighbors.forEach(neighbor => {
            if (!neighbor.isDead) {
                const dx = neighbor.x - this.x;
                const dy = neighbor.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < cohesionRadius) {
                    centerX += neighbor.x;
                    centerY += neighbor.y;
                    count++;
                }
            }
        });
        
        if (count === 0) return { x: 0, y: 0 };
        
        centerX /= count;
        centerY /= count;
        
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        
        return { x: dx * cohesionStrength, y: dy * cohesionStrength };
    }
    
    calculateAlignment(neighbors) {
        if (neighbors.length === 0) return { x: 0, y: 0 };
        
        let avgVelX = 0;
        let avgVelY = 0;
        let count = 0;
        const alignRadius = 50;
        const alignStrength = 0.02;
        
        neighbors.forEach(neighbor => {
            if (!neighbor.isDead) {
                const dx = neighbor.x - this.x;
                const dy = neighbor.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < alignRadius) {
                    avgVelX += neighbor.velocityX;
                    avgVelY += neighbor.velocityY;
                    count++;
                }
            }
        });
        
        if (count === 0) return { x: 0, y: 0 };
        
        avgVelX /= count;
        avgVelY /= count;
        
        const dx = avgVelX - this.velocityX;
        const dy = avgVelY - this.velocityY;
        
        return { x: dx * alignStrength, y: dy * alignStrength };
    }
    
    calculateDensityBehavior(neighbors) {
        const densityRadius = 40;
        let nearbyCount = 0;
        let avgX = 0;
        let avgY = 0;
        let validNeighbors = 0;
        
        neighbors.forEach(neighbor => {
            if (!neighbor.isDead) {
                const dx = neighbor.x - this.x;
                const dy = neighbor.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < densityRadius) {
                    nearbyCount++;
                    avgX += neighbor.x;
                    avgY += neighbor.y;
                    validNeighbors++;
                }
            }
        });
        
        const maxDensity = 8;
        const densityRatio = Math.min(nearbyCount / maxDensity, 1);
        const speedFactor = 1 - (densityRatio * 0.5);
        
        let verticalForceX = 0;
        let verticalForceY = 0;
        
        if (validNeighbors > 0) {
            avgX /= validNeighbors;
            avgY /= validNeighbors;
            
            const crowdCenterX = avgX - this.x;
            const crowdCenterY = avgY - this.y;
            
            if (nearbyCount > 4) {
                const avoidStrength = 0.02;
                verticalForceX = -crowdCenterX * avoidStrength;
                verticalForceY = -crowdCenterY * avoidStrength;
                
                const mainSoldier = this.player.mainSoldier;
                if (mainSoldier) {
                    const backwardForce = 0.01 * densityRatio;
                    verticalForceY += backwardForce * 20;
                }
            } else if (nearbyCount < 2) {
                const mainSoldier = this.player.mainSoldier;
                if (mainSoldier) {
                    const forwardForce = 0.005;
                    verticalForceY -= forwardForce * 15;
                }
            }
        }
        
        return {
            speedFactor: speedFactor,
            verticalForce: { x: verticalForceX, y: verticalForceY }
        };
    }
    
    render(ctx) {
        
    }
}

console.log('JavaScript file loaded!');

let game;
window.addEventListener('load', () => {
    console.log('Window loaded, creating game...');
    try {
        game = new Game();
        console.log('Game created successfully:', game);
    } catch (error) {
        console.error('Error creating game:', error);
    }
});