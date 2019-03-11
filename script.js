window.onload = function () {
    //Déclaration des variables globals

    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var ctx;
    var delay = 100;
    var snaker;
    var applee;
    //création de variable pour stocker la largeur et hauteur du canvas en nombre de blocks plutôt qu'en pixels
    var widthInBlocks = canvasWidth / blockSize;
    var heightInBlocks = canvasHeight / blockSize;
    var score;
    var timeout;
    //execution de la fonction init
    init();

    function init() {
        // On crée une variable qui va contenir  un élément, ici canvas
        var canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "10px solid red";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        //appendChild permet d accrocher un tag au body: ici canvas
        document.body.appendChild(canvas);
        // on utilise le context pour pouvoir dessiner dans le canvas
        ctx = canvas.getContext('2d');
        // On instancie l'objet snaker avec les arguments de position en commençant par la tête [6,4]
        snaker = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        refreshCanvas();
    }
    //fonction de rafraichissement

    function refreshCanvas() {
        // on appelle la fonction advance
        snaker.advance();
        // si la tête du serpent entre en collision
        if (snaker.checkCollision()) {
            gameOver();
        }
        else {
            //si le serpent mange la pomme on place la pomme à un nouvelle endroit
            if (snaker.isEatingApple(applee)) {
                // on incrémente le score avec le nombre de pomme mangées
                score++;
                // Le serpent mange une pomme
                snaker.ateApple = true;
                //on donne une nouvelle position à la pomme tant que la nouvelle pomme se trouve sur le serpent
                do {
                    applee.setNewPosition();
                }
                while (applee.isOnSnake(snaker))

            }
            // on refraichi la position du rectangle
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            /* On appelle la fonction draw.score avant snakee.draw et applee.draw
             * pour que l'affichage du score soit en arrière plan
             */
            drawScore();
            snaker.draw();
            applee.draw();

            /* On stocke dans la variable timeout, la fonction setTimeout qui permet
                 * de rappeler la fonction refreshCanvas après le delay de 100ms */
            timeout = setTimeout(refreshCanvas, delay);
        }
    }
    function gameOver() {
        ctx.save();
        ctx.font = "bold 50px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseLine = "middle";
        // on utilise strokeStyle pour créer un contour blanc au texte
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.strokeText("Game Over", centreX, centreY - 180);
        ctx.fillText("Game Over", centreX, centreY - 180);
        ctx.font = "bold 30px sans-serif";
        // On rempli le texte avec la fonction strokeText , centré horizontalement et verticalement avec un retrait de 120px
        ctx.strokeText("Appuyer sur la touche espace pour rejouer", centreX, centreY - 120);
        ctx.fillText("Appuyer sur la touche espace pour rejouer", centreX, centreY - 120);
        ctx.restore();
    }
    function restart() {
        snaker = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        //la fonction clearTimeout a laquelle on donne la variable timeout qui permet de tuer setTimeout si 
        // l on relance le jeu sans avoir causer de game over ce qui évite l accélération du serpent.
        clearTimeout(timeout);
        refreshCanvas();
    }
    function drawScore() {
        ctx.save();
        ctx.font = "bold 50px sans-serif";
        ctx.fillStyle = "black";

        ctx.fillText(score.toString(), 5, canvasHeight - 5);
        ctx.restore();
    }
    function drawBlock(ctx, position) {
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }
    //on créer une fonction construct snake
    function Snake(body, direction) {
        //utilisation de this pour créer une instance de snake (paramètre)
        this.body = body;
        this.direction = direction;
        this.ateApple = false;// false pour éviter que le serpent grandisse tout de suite (true par défaut)
        // On crée la méthode draw pour dessiner le serpent
        this.draw = function () {
            // On sauvegarde le context avant de dessiner
            ctx.save();
            ctx.fillStyle = "#ff0000";
            /* On crée une boucle for pour dessiner le serpent.
             Tant que i < au nombre de blocks caractérisant le corps du serpent, on ajoute un block
             */
            for (var i = 0; i < this.body.length; i++) {
                drawBlock(ctx, this.body[i]);
            }
            ctx.restore();
        };
        this.advance = function () {
            //slice() extrait une section d'une chaine de caractères et la 
            //retourne comme une nouvelle chaine de caractères.La chaîne de caractères courante n'est pas modifiée.
            var nextPosition = this.body[0].slice();
            switch (this.direction) {
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw ("Invalid direction");
                //throw est une fonction qui permet de mettre un message d'érreur
            }

            this.body.unshift(nextPosition);
            if (!this.ateApple) {
                this.body.pop();
            } else {
                this.ateApple = false;
            }
        };
        this.setDirection = function (newDirection) {
            //on déclare une variable direction permise
            var allowedDirections;
            switch (this.direction) {
                case "left":
                case "right":
                    allowedDirections = ["up", "down"];
                    break;
                case "down":
                case "up":
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw ('Invalid direction');
            }
            // Si l'index de la nouvelle direction dans la variable allowedDirection est > -1, alors elle est permise
            if (allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };
        this.checkCollision = function () {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;
            // n'est pas entre les murs horisontaux et verticaux
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
                // il y a une collision
                wallCollision = true;
            }
            // On vérifie que le serpent ne s'est pas passé sur le reste du corps 
            for (var i = 0; i < rest.length; i++) {
                if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
                    snakeCollision = true;
                }
            }
            return wallCollision || snakeCollision;
        };
        // On crée une methode  le serpent mange t-il une pomme?
        this.isEatingApple = function (appleToEat) {
            var head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]) {
                return true;
            }
            else {
                return false;
            }
        };
    }
    // on crée une fonction construct apple
    function Apple(position) {
        this.position = position;
        //création de la méthode pour dessiner une pomme
        this.draw = function () {
            //on enregistre les anciens paramètre du canvas
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            var radius = blockSize / 2;
            var x = this.position[0] * blockSize + radius;
            var y = this.position[1] * blockSize + radius;
            // On dessine le rond avec la fonction arc, 
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            // On restore les anciens apramètres de canvas
            ctx.fill();
            ctx.restore();
        };
        // on crée une méthode pour donner une nouvelle position à la pomme, de façon aléatoire et avec un nombre entier
        this.setNewPosition = function () {
            var newX = Math.round(Math.random() * (widthInBlocks - 1));
            var newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        };
        // on crée une méthode pour voir si la nouvelle position de la pomme est sur le serpent
        this.isOnSnake = function (snakeToCheck) {
            // On initialise la variable isOnSnake à false (pas sur le serpent)
            var isOnSnake = false;
            for (var i = 0; i < snakeToCheck.body.lenght; i++) {
                if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
                }
            }
            return isOnSnake;

        };
    }
    // On crée l'évènement onkeydown. La fonction handleKeyDown sera éxécutée quand la touche sera appuyée
    document.onkeydown = function handleKeyDown(e) { // e est un évènement
        var key = e.keyCode;
        var newDirection;
        switch (key) {
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        }
        snaker.setDirection(newDirection);


    };
};
