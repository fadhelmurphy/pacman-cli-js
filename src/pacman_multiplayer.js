const prompt = require('prompt-sync')();
const chalk = require('chalk');

  // Add this at the beginning of your script
  const pacmanColors = ['yellow'];

class PacmanGame {
    constructor(rows, cols, lives, numGhosts, numPacmans) {
        this.rows = rows;
        this.cols = cols;
        this.lives = lives;
        this.pacmans = this.generatePacmans(numPacmans);
        this.ghosts = this.generateGhosts(numGhosts);
        this.walls = this.generateWalls();
        this.dots = this.generateDots();
        this.fruits = [];
        this.score = 0;
        this.lastMove = ''; // Variable untuk menyimpan input terakhir
        this.ghostHome = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) }; // Markas utama ghost
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
    const totalDots = Math.floor(this.rows * this.cols * 0.9); // Ambil hampir 90% dari total sel pada board
    
    for (let i = 0; i < totalDots; i++) {
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

  generateBotPacmans(numBotPacmans) {
    const botPacmans = [];
    const botColors = ['green', 'blue', 'yellow'];

    for (let i = 0; i < numBotPacmans; i++) {
      botPacmans.push({ x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows), color: botColors[i], score: 0, lives: 3, powerTime: 0, isBot: true });
    }

    return botPacmans;
  }

  isWall(x, y) {
    return this.walls.some(wall => wall.x === x && wall.y === y);
  }

  isDot(x, y) {
    return this.dots && this.dots.some(dot => dot.x === x && dot.y === y);
  }

  isFruit(x, y) {
    return this.fruits.some(fruit => fruit.x === x && fruit.y === y);
  }

  generatePacmans(numPacmans) {
    const pacmans = [];
  
    // Generate human-controlled Pacman
    pacmans.push({
      x: 0,
      y: 0,
      isBot: false,
      score: 0,
      lives: this.lives, // Ensure this property is correct
      powerTime: 0,
      color: 'yellow', // Assign color for the human-controlled Pacman
    });
  
    // Generate bot-controlled Pacmans
    for (let i = 0; i < numPacmans - 1; i++) {
      pacmans.push({
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows),
        isBot: true,
        score: 0,
        lives: this.lives, // Ensure this property is correct
        powerTime: 0,
        botIndex: i, // Assign botIndex property for bot-controlled Pacmans
        color: pacmanColors[i % pacmanColors.length], // Assign color for bot-controlled Pacman
      });
    }
  
    return pacmans;
  }

    // Fungsi untuk mengecek apakah suatu posisi adalah markas utama ghost
    isGhostHome(x, y) {
      return this.ghostHome.x === x && this.ghostHome.y === y;
    }

  printBoard() {
    for (let i = 0; i < this.rows; i++) {
      let row = '';
      for (let j = 0; j < this.cols; j++) {
        const pacman = this.pacmans.find(pacman => pacman.x === j && pacman.y === i);
        if (pacman) {
          const color = pacman.isBot ? this.getBotColor(pacman.botIndex) : 'yellow';
          row += this.getColorText(color, `${pacman.isBot ? 'B ' : 'C '}`);
        } else if (this.isGhostHome(j, i)) {
          row += chalk.bgMagenta('GH '); // Ghost Home
        } else if (this.ghosts.some(ghost => ghost.x === j && ghost.y === i)) {
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
    console.log(chalk.italic.cyan(`GH: Ghost Home, F: Fruits/Power, X: Wall, G: Ghost, C: Pacman`));
console.log(chalk.blue(`Score: ${this.pacmans[0].score} Lives: ${this.pacmans[0].lives} Power Time: ${this.pacmans[0].powerTime}`));

// Print information for bot pacmans
this.pacmans.slice(1).forEach((botPacman, index) => {
  const color = this.getBotColor(index);
  console.log(this.getColorText(color, `${botPacman.isBot ? 'Bot Pacman ' : 'Pacman '} ${index + 1} - Score: ${botPacman.score} Lives: ${botPacman.lives} Power Time: ${botPacman.powerTime}`));
});
  }
  
  getColorText(color, text) {
    switch (color) {
      case 'yellow':
        return chalk.yellow(text);
      case 'green':
        return chalk.green(text);
      case 'blue':
        return chalk.blue(text);
      case 'magenta':
        return chalk.magenta(text);
      case 'cyan':
        return chalk.cyan(text);
      default:
        return text;
    }
  }
  
  getBotColor(index) {
    return pacmanColors[index % pacmanColors.length];
  }

  movePacmans() {
    this.pacmans.forEach((pacman, index) => {
      if (pacman.powerTime > 0) {
        pacman.powerTime--;
      }

      let direction;
      if (pacman.isBot) {
        direction = this.getBotDirection(pacman);
      } else {
        direction = prompt('Tekan tombol (W/A/S/D) untuk bergerak dan Q untuk keluar: ');
      }

      // Jika Enter ditekan, gunakan input terakhir
      if (direction === '') {
        direction = pacman.lastMove;
      } else {
        pacman.lastMove = direction; // Perbarui input terakhir jika bukan Enter
      }

      switch (direction.toLowerCase()) {
        case 'w':
          if (!this.isWall(pacman.x, pacman.y - 1)) {
            pacman.y = Math.max(0, pacman.y - 1);
          }
          break;
        case 'a':
          if (!this.isWall(pacman.x - 1, pacman.y)) {
            pacman.x = Math.max(0, pacman.x - 1);
          }
          break;
        case 's':
          if (!this.isWall(pacman.x, pacman.y + 1)) {
            pacman.y = Math.min(this.rows - 1, pacman.y + 1);
          }
          break;
        case 'd':
          if (!this.isWall(pacman.x + 1, pacman.y)) {
            pacman.x = Math.min(this.cols - 1, pacman.x + 1);
          }
          break;
        case 'q':
          console.log('Game Over! Exiting...');
          process.exit();
        default:
          console.log('Invalid move!');
      }

      // Check for eating dots
      const eatenDotIndex = this.dots.findIndex(dot => dot.x === pacman.x && dot.y === pacman.y);
      if (eatenDotIndex !== -1) {
        this.dots.splice(eatenDotIndex, 1);
        pacman.score++;
      }

      // Check for eating fruits
      const eatenFruitIndex = this.fruits.findIndex(fruit => fruit.x === pacman.x && fruit.y === pacman.y);
      if (eatenFruitIndex !== -1) {
        this.fruits.splice(eatenFruitIndex, 1);
        pacman.score += 5; // Increase score for eating fruit
        pacman.powerTime = 10; // Set power time to 10 steps
      }

      // Check for collision with ghosts
      if (this.checkGhostCollision(pacman)) {
        if (pacman.powerTime > 0) {
          // Jika power time pacman lebih dari 0, maka ghost kembali ke markas
          this.ghosts.forEach((ghost) => {
            ghost.x = this.ghostHome.x;
            ghost.y = this.ghostHome.y;
          });
        } else {
          this.updateScore(pacman, index);
        }
      }
    });
  }


  getBotDirection(botPacman) {
    // Implement your bot logic here
    // For simplicity, the bot moves randomly in this example
    const directions = ['w', 'a', 's', 'd'];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  moveGhosts() {
    this.ghosts.forEach((ghost) => {
      const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

      let newGhostX = ghost.x;
      let newGhostY = ghost.y;

      if (direction === 'horizontal') {
        newGhostX += Math.random() < 0.5 ? -1 : 1;
        newGhostX = Math.max(0, Math.min(this.cols - 1, newGhostX));

        // Check if the next position is a wall, if true, don't update the position
        if (!this.isWall(newGhostX, ghost.y)) {
          ghost.x = newGhostX;
        }
      } else {
        newGhostY += Math.random() < 0.5 ? -1 : 1;
        newGhostY = Math.max(0, Math.min(this.rows - 1, newGhostY));

        // Check if the next position is a wall, if true, don't update the position
        if (!this.isWall(ghost.x, newGhostY)) {
          ghost.y = newGhostY;
        }
      }
    });
  }

  returnGhostToHome(ghost) {
    ghost.x = this.ghostHome.x;
    ghost.y = this.ghostHome.y;
  }

  checkGhostCollision(pacman) {
    return this.ghosts.some(ghost => pacman.x === ghost.x && pacman.y === ghost.y);
  }

  updateScore(pacman, index) {
    if (pacman.lives > 0) {
      pacman.lives--;
    }
    if (pacman.isBot && pacman.lives === 0) {
      // Hapus bot pacmans jika nyawanya hanya 0
      this.pacmans.splice(index, 1);
    }
    if (!pacman.isBot && pacman.lives == 0) {
      console.log(chalk.red('Game Over! No lives left.'));
      process.exit();
    }
  }



  play() {
    while (true) {
      process.stdout.write('\x1bc');
      this.printBoard();
      this.movePacmans();
      this.moveGhosts();

      if (this.dots.length === 0) {
        console.log(chalk.green('Congratulations! You ate all the dots. Game Over!'));
        process.exit();
      }

      // Generate fruits randomly
      if (Math.random() < 0.1) {
        const fruit = { x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows) };
        this.fruits.push(fruit);
      }
    }
  }
}

// Initialize the game with a 15x15 grid, 3 lives, 3 ghosts, and 3 bot pacmans
const game = new PacmanGame(15, 15, 3, 3, 3);

// Start the game
game.play();

