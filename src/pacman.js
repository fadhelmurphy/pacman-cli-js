const prompt = require('prompt-sync')();
const chalk = require('chalk');

class PacmanGame {
  constructor(rows, cols, lives, numGhosts) {
    this.rows = rows;
    this.cols = cols;
    this.pacman = { x: 0, y: 0, powerTime: 0 };
    this.ghosts = this.generateGhosts(numGhosts);
    this.walls = this.generateWalls();
    this.dots = this.generateDots();
    this.fruits = [];
    this.score = 0;
    this.lives = lives;
  }

  generateWalls() {
    const walls = [];
    for (let i = 0; i < Math.floor(this.rows * this.cols * 0.1); i++) {
      walls.push({ x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows) });
    }
    return walls;
  }

  generateDots() {
    const dots = [];
    for (let i = 0; i < Math.floor(this.rows * this.cols * 0.2); i++) {
      let dot;
      do {
        dot = { x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows) };
      } while (this.isWall(dot.x, dot.y) || this.isDot(dot.x, dot.y) || (dot.x === 0 && dot.y === 0));
      dots.push(dot);
    }
    return dots;
  }

  generateGhosts(numGhosts) {
    const ghosts = [];
    const ghostColors = ['red', 'green', 'blue', 'magenta'];
    
    for (let i = 0; i < numGhosts; i++) {
      ghosts.push({ x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows), color: ghostColors[i] });
    }
    return ghosts;
  }

  generateFruits() {
    const fruit = { x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows) };
    this.fruits.push(fruit);
  }

  isWall(x, y) {
    return this.walls.some(wall => wall.x === x && wall.y === y);
  }

  isDot(x, y) {
    return this.dots && this.dots.some(dot => dot.x === x && dot.y === y);
  }

  isGhost(x, y) {
    return this.ghosts.some(ghost => ghost.x === x && ghost.y === y);
  }

  isFruit(x, y) {
    return this.fruits.some(fruit => fruit.x === x && fruit.y === y);
  }

  printBoard() {
    for (let i = 0; i < this.rows; i++) {
      let row = '';
      for (let j = 0; j < this.cols; j++) {
        if (this.pacman.x === j && this.pacman.y === i) {
          row += chalk.yellow('C '); // Pacman
        } else if (this.isGhost(j, i)) {
        const ghost = this.ghosts.find(ghost => ghost.x === j && ghost.y === i);
        row += chalk[ghost.color]('G '); // Ghost with specified color
        } else if (this.isWall(j, i)) {
          row += chalk.gray('X '); // Wall
        } else if (this.isDot(j, i)) {
          row += chalk.cyanBright('. '); // Dot
        } else if (this.isFruit(j, i)) {
          row += chalk.rgb(255, 165, 0)('F '); // Fruit
        } else {
          row += chalk.hidden('. ');
        }
      }
      console.log(row);
    }
    console.log(chalk.blue(`Score: ${this.score} Lives: ${this.lives} Power Time: ${this.pacman.powerTime}`));
  }

  movePacman() {
    if (this.pacman.powerTime > 0) {
      this.pacman.powerTime--;
    }

    const direction = prompt('Tekan tombol (W/A/S/D) untuk bergerak dan Q untuk keluar : ');
    switch (direction.toLowerCase()) {
      case 'w':
        if (!this.isWall(this.pacman.x, this.pacman.y - 1)) {
          this.pacman.y = Math.max(0, this.pacman.y - 1);
        }
        break;
      case 'a':
        if (!this.isWall(this.pacman.x - 1, this.pacman.y)) {
          this.pacman.x = Math.max(0, this.pacman.x - 1);
        }
        break;
      case 's':
        if (!this.isWall(this.pacman.x, this.pacman.y + 1)) {
          this.pacman.y = Math.min(this.rows - 1, this.pacman.y + 1);
        }
        break;
      case 'd':
        if (!this.isWall(this.pacman.x + 1, this.pacman.y)) {
          this.pacman.x = Math.min(this.cols - 1, this.pacman.x + 1);
        }
        break;
      case 'q':
        console.log('Game Over! Exiting...');
        process.exit();
      default:
        console.log('Invalid move!');
    }

    // Check for eating dots
    const eatenDotIndex = this.dots.findIndex(dot => dot.x === this.pacman.x && dot.y === this.pacman.y);
    if (eatenDotIndex !== -1) {
      this.dots.splice(eatenDotIndex, 1);
      this.score++;
    }

    // Check for eating fruits
    const eatenFruitIndex = this.fruits.findIndex(fruit => fruit.x === this.pacman.x && fruit.y === this.pacman.y);
    if (eatenFruitIndex !== -1) {
      this.fruits.splice(eatenFruitIndex, 1);
      this.score += 5; // Increase score for eating fruit
      this.pacman.powerTime = 10; // Set power time to 10 steps
    }
  }

  moveGhosts() {
    this.ghosts.forEach((ghost) => {
      const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

      if (direction === 'horizontal') {
        ghost.x += Math.random() < 0.5 ? -1 : 1;
        ghost.x = Math.max(0, Math.min(this.cols - 1, ghost.x));
      } else {
        ghost.y += Math.random() < 0.5 ? -1 : 1;
        ghost.y = Math.max(0, Math.min(this.rows - 1, ghost.y));
      }
    });
  }

  checkCollision() {
    return (
      this.ghosts.some(ghost => this.pacman.x === ghost.x && this.pacman.y === ghost.y) ||
      (this.pacman.powerTime === 0 && this.ghosts.some(ghost => this.pacman.x === ghost.x && this.pacman.y === ghost.y))
    );
  }
  

  updateScore() {
    if (this.checkCollision()) {
      this.lives--;
      if (this.lives <= 0) {
        console.log(chalk.red('Game Over! No lives left.'));
        process.exit();
      }
    }
  }

  play() {
    while (true) {
        process.stdout.write('\x1bc');
      this.printBoard();
      this.movePacman();
      this.moveGhosts();
      this.updateScore();

      if (this.dots.length === 0) {
        console.log(chalk.green('Congratulations! You ate all the dots. Game Over!'));
        process.exit();
      }

      // Generate fruits randomly
      if (Math.random() < 0.1) {
        this.generateFruits();
      }
    }
  }
}

// Inisialisasi game dengan ukuran 20x20, 3 nyawa, dan 3 hantu
const game = new PacmanGame(20, 20, 3, 3);

// Mulai permainan
game.play();

