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
    this.lastMove = ''; // Variable untuk menyimpan input terakhir
    this.ghostHome = [
      { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
      { x: Math.floor(cols / 2) + 1, y: Math.floor(rows / 2) }
  ]; // Markas utama ghost
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
    const totalDots = Math.floor(this.rows * this.cols * 0.9);

    for (let i = 0; i < totalDots; i++) {
        let dot;
        do {
            dot = { x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows), eaten: false };
        } while (this.isWall(dot.x, dot.y) || this.isDot(dot.x, dot.y) || (dot.x === 0 && dot.y === 0) || this.isDuplicateDot(dot, dots));
        dots.push(dot);
    }
    return dots;
}

isDuplicateDot(dot, dots) {
    return dots.some(existingDot => existingDot.x === dot.x && existingDot.y === dot.y);
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

  // Fungsi untuk mengecek apakah suatu posisi adalah markas utama ghost
  isGhostHome(x, y) {
    return this.ghostHome.x === x && this.ghostHome.y === y;
  }

  printBoard() {
    for (let i = 0; i < this.rows; i++) {
      let row = '';
      for (let j = 0; j < this.cols; j++) {
        const isGhostHomeG = this.ghostHome[0].x === j && this.ghostHome[0].y === i;
        const isGhostHomeH = this.ghostHome[1].x === j && this.ghostHome[1].y === i;
        if (this.pacman.x === j && this.pacman.y === i) {
          row += chalk.yellow('C '); // Pacman
        } else if (isGhostHomeG) {
          row += chalk.bgMagenta('G '); // Ghost Home
        } else if (isGhostHomeH) {
          row += chalk.bgMagenta('H '); // Ghost Home
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
    console.log(chalk.italic.cyan(`GH: Ghost Home, F: Fruits/Power, X: Wall, G: Ghost, C: Pacman`))
    console.log(chalk.blue(`Score: ${this.score} Lives: ${this.lives} Power Time: ${this.pacman.powerTime}`));
  }
  
  movePacman() {
    if (this.pacman.powerTime > 0) {
      this.pacman.powerTime--;
    }

    let direction = prompt('Tekan tombol (W/A/S/D) untuk bergerak dan Q untuk keluar : ');
    // Jika Enter ditekan, gunakan input terakhir
    if (direction === '') {
      direction = this.lastMove;
    } else {
      this.lastMove = direction; // Perbarui input terakhir jika bukan Enter
    }
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

    
      // Check for collision with ghosts
      const collidedGhost = this.checkGhostCollision(this.pacman);
      if (collidedGhost) {
        if (this.pacman.powerTime > 0) {
          // Jika power time pacman lebih dari 0, maka ghost kembali ke markas
          this.returnGhostToHome(collidedGhost);
        } else {
          this.updateScore();
        }
      }
  }


  checkGhostEaten(ghost) {
    return this.pacman.powerTime > 0 && this.checkCollision(this.pacman, ghost);
  }


  moveGhosts() {
    this.ghosts.forEach((ghost) => {
      // Jika ghost termakan oleh Pacman dan power time di atas 0, kembalikan ghost ke markas
      if (this.checkGhostEaten(ghost)) {
        this.returnGhostToHome(ghost);
      } else {
        // Jika tidak, lanjutkan pergerakan biasa
        this.moveGhost(ghost);
      }
    });
  }

  returnGhostToHome(ghost) {
    ghost.x = this.ghostHome[0].x;
    ghost.y = this.ghostHome[0].y;
  }

  moveGhost(ghost) {
    const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

    if (direction === 'horizontal') {
      this.moveHorizontal(ghost);
    } else {
      this.moveVertical(ghost);
    }
  }

  moveHorizontal(ghost) {
    const newGhostX = ghost.x + (Math.random() < 0.5 ? -1 : 1);
    if (!this.isWall(newGhostX, ghost.y)) {
      ghost.x = Math.max(0, Math.min(this.cols - 1, newGhostX));
    }
  }

  moveVertical(ghost) {
    const newGhostY = ghost.y + (Math.random() < 0.5 ? -1 : 1);
    if (!this.isWall(ghost.x, newGhostY)) {
      ghost.y = Math.max(0, Math.min(this.rows - 1, newGhostY));
    }
  }

  checkGhostCollision(pacman) {
    const collidedGhost = this.ghosts.find(ghost => pacman.x === ghost.x && pacman.y === ghost.y);
    return collidedGhost;
  }

  checkCollision(pacman, ghost) {
    return pacman.x === ghost.x && pacman.y === ghost.y;
  }

  updateScore() {
    if (this.lives > 0) {
      this.lives--;
    }
    if (this.lives == 0) {
      console.log(chalk.red('Game Over! No lives left.'));
      process.exit();
    }
  }

  play() {
    while (true) {
        process.stdout.write('\x1bc');
      this.printBoard();
      this.movePacman();
      this.moveGhosts();

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
const game = new PacmanGame(15, 15, 3, 3);

// Mulai permainan
game.play();

