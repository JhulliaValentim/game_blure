  const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        const levelText = document.getElementById("levelText");

        // Configurações do Jogo
        const gravity = 0.6;
        const friction = 0.8;
        let currentLevel = 1;

        // O Jogador (Blure)
        const player = {
            x: 50, y: 300, width: 24, height: 32,
            dx: 0, dy: 0, speed: 5, jumpPower: -12,
            color: "#e74c3c", grounded: false
        };

        const levels = [
            // Fase 1: pulo no buraco
            [
                { x: 0, y: 350, w: 300, h: 50, type: 1 },
                { x: 400, y: 350, w: 400, h: 50, type: 1 },
                { x: 700, y: 300, w: 40, h: 40, type: 3 } 
            ],
            // Fase 2: Escadinha
            [
                { x: 0, y: 350, w: 150, h: 50, type: 1 },
                { x: 200, y: 300, w: 100, h: 20, type: 1 },
                { x: 350, y: 220, w: 100, h: 20, type: 1 },
                { x: 500, y: 150, w: 200, h: 20, type: 1 },
                { x: 600, y: 100, w: 40, h: 40, type: 3 }
            ],
            // Fase 3: Chão de Lava
            [
                { x: 0, y: 350, w: 100, h: 50, type: 1 },
                { x: 100, y: 380, w: 700, h: 20, type: 2 }, 
                { x: 200, y: 280, w: 50, h: 20, type: 1 },
                { x: 350, y: 200, w: 50, h: 20, type: 1 },
                { x: 500, y: 120, w: 50, h: 20, type: 1 },
                { x: 650, y: 350, w: 150, h: 50, type: 1 },
                { x: 720, y: 300, w: 40, h: 40, type: 3 }
            ],
            // Fase 4: O Muro Alto
            [
                { x: 0, y: 350, w: 400, h: 50, type: 1 },
                { x: 400, y: 100, w: 50, h: 300, type: 1 },
                { x: 150, y: 250, w: 50, h: 20, type: 1 },
                { x: 50, y: 150, w: 50, h: 20, type: 1 },
                { x: 200, y: 100, w: 50, h: 20, type: 1 },
                { x: 450, y: 350, w: 350, h: 50, type: 1 },
                { x: 500, y: 380, w: 200, h: 20, type: 2 }, 
                { x: 720, y: 300, w: 40, h: 40, type: 3 }
            ],
            // Fase 5: Pulos de precisão extremos
            [
                { x: 0, y: 350, w: 50, h: 50, type: 1 },
                { x: 50, y: 380, w: 750, h: 20, type: 2 }, 
                { x: 130, y: 300, w: 30, h: 20, type: 1 },
                { x: 230, y: 220, w: 30, h: 20, type: 1 },
                { x: 350, y: 150, w: 30, h: 20, type: 1 },
                { x: 500, y: 150, w: 30, h: 20, type: 1 },
                { x: 650, y: 250, w: 30, h: 20, type: 1 },
                { x: 720, y: 200, w: 40, h: 40, type: 3 }
            ]
        ];

        let platforms = levels[currentLevel - 1];
        let keys = {};

        // Controles de teclado pulinhos
        window.addEventListener("keydown", (e) => keys[e.code] = true);
        window.addEventListener("keyup", (e) => keys[e.code] = false);

        function resetPlayer() {
            player.x = 20;
            player.y = 200;
            player.dx = 0;
            player.dy = 0;
        }

        function nextLevel() {
            currentLevel++;
            if (currentLevel > levels.length) {
                alert("Parabéns! Você completou todas as 5 fases!");
                currentLevel = 1;
            }
            platforms = levels[currentLevel - 1];
            levelText.innerText = "Fase " + currentLevel;
            resetPlayer();
        }

        function checkCollision(r1, r2) {
            return (r1.x < r2.x + r2.w &&
                r1.x + r1.width > r2.x &&
                r1.y < r2.y + r2.h &&
                r1.y + r1.height > r2.y);
        }

        function update() {
            // Movimento Horizontal
            if (keys["ArrowRight"] || keys["KeyD"]) player.dx += 1;
            if (keys["ArrowLeft"] || keys["KeyA"]) player.dx -= 1;

            player.dx *= friction; // Deslize suave
            player.x += player.dx;

            // Limites da tela (Esquerda/Direita)
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

            // Colisão Horizontal com Blocos
            for (let p of platforms) {
                if (checkCollision(player, p)) {
                    if (p.type === 2) return resetPlayer(); 
                    if (p.type === 3) return nextLevel();   

                    if (player.dx > 0) player.x = p.x - player.width; 
                    else if (player.dx < 0) player.x = p.x + p.w;    
                    player.dx = 0;
                }
            }

            // Movimento Vertical (Gravidade e Pulo)
            player.dy += gravity;
            player.y += player.dy;
            player.grounded = false;

            // Limite inferior (Caiu no buraco)
            if (player.y > canvas.height) {
                resetPlayer();
            }

            // Colisão Vertical com Blocos
            for (let p of platforms) {
                if (checkCollision(player, p)) {
                    if (p.type === 2) return resetPlayer(); // Morreu na lava
                    if (p.type === 3) return nextLevel();   // Passou de fase

                    if (player.dy > 0) { // Caindo em cima da plataforma
                        player.y = p.y - player.height;
                        player.dy = 0;
                        player.grounded = true;
                    } else if (player.dy < 0) { // Bateu a cabeça embaixo
                        player.y = p.y + p.h;
                        player.dy = 0;
                    }
                }
            }

            // Pulo (Só pula se estiver no chão)
            if ((keys["ArrowUp"] || keys["KeyW"] || keys["Space"]) && player.grounded) {
                player.dy = player.jumpPower;
                player.grounded = false;
            }
        }

        function drawRect(x, y, w, h, color, borderColor) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
            if (borderColor) {
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, w, h);
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let p of platforms) {
                if (p.type === 1) {
                    // Plataforma: Grama em cima, terra embaixo
                    drawRect(p.x, p.y, p.w, p.h, "#8B4513", "#5c2e0b"); 
                    drawRect(p.x, p.y, p.w, 10, "#2ecc33", "#27ae60");  
                }
                else if (p.type === 2) {
                    // Lava
                    drawRect(p.x, p.y, p.w, p.h, "#e67e22", "#d35400");
                    drawRect(p.x, p.y, p.w, 5, "#f1c40f"); 
                }
                else if (p.type === 3) {
                    drawRect(p.x, p.y, p.w, p.h, "#363636", "#8a8a8a");
                    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.fillRect(p.x + 5, p.y + 5, 10, 10);
                }
            }

            drawRect(player.x, player.y, player.width, player.height, player.color, "#bd1e73");
            drawRect(player.x, player.y + 16, player.width, 16, "#702dbc");
        }

        function loop() {
            update();
            draw();
            requestAnimationFrame(loop);
        }

        // Inicia o jogo
        resetPlayer();
        loop();

        