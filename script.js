document.addEventListener('DOMContentLoaded', () => {
    // === 1. 共用變數宣告 ===
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');
    const canvas = document.getElementById('moleculeCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    // === 2. 手機版選單與分頁切換邏輯 ===
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });
        document.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetId) {
                    page.classList.add('active');
                }
            });
            if (window.innerWidth <= 800) {
                navMenu.classList.remove('active');
            }
            window.scrollTo(0, 0);
        });
    });

    // === 3. 分子背景動畫 (Hero Molecule Animation) ===
    if (ctx) {
        let structures = [];
        const mouse = { x: null, y: null, radius: 200 };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y + window.scrollY;
        });

        function resizeCanvas() {
            const hero = document.querySelector('.hero');
            if (hero) {
                canvas.width = hero.offsetWidth;
                canvas.height = hero.offsetHeight;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        }

        class MoleculeStructure {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 1.7; 
                this.vy = (Math.random() - 0.5) * 1.7;
                this.radius = 45; // 六邊形邊長
                this.angle = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.003;
                this.isConnectedType = Math.random() < 0.3;

                this.branches = [];
                // 決定樣式：A (三根間隔) 或 B (四根連續)
                const styleType = Math.random() < 0.5 ? 'A' : 'B';
                
                let indices = [];
                if (styleType === 'A') {
                    // 樣式 A: 三根觸手，每隔一個頂點長一根 (1, 3, 5 位置)
                    // 隨機起點 0 或 1
                    const start = Math.floor(Math.random() * 2);
                    indices = [start, (start + 2) % 6, (start + 4) % 6];
                } else {
                    // 樣式 B: 四根觸手，必須連續出現
                    // 隨機選一個頂點作為起始，往後取連續四個
                    const start = Math.floor(Math.random() * 6);
                    indices = [
                        start, 
                        (start + 1) % 6, 
                        (start + 2) % 6, 
                        (start + 3) % 6
                    ];
                }

                indices.forEach(idx => {
                    this.branches.push({
                        index: idx,
                        length: this.radius, // 觸手與邊長等長
                        hasAtom: Math.random() > 0.4
                    });
                });
            }

            resolveCollision(other) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = 120; 

                if (distance < minDistance && distance > 0) {
                    let overlap = minDistance - distance;
                    let nx = dx / distance;
                    let ny = dy / distance;

                    this.x -= nx * (overlap / 2);
                    this.y -= ny * (overlap / 2);
                    other.x += nx * (overlap / 2);
                    other.y += ny * (overlap / 2);

                    this.vx *= -0.8;
                    this.vy *= -0.8;
                    other.vx *= -0.8;
                    other.vy *= -0.8;
                }
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.angle += this.rotationSpeed;

                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= dx * force * 0.02;
                    this.y -= dy * force * 0.02;
                }

                if (this.x < -150 || this.x > canvas.width + 150 || this.y < -150 || this.y > canvas.height + 150) {
                    this.reset();
                }
            }

            draw() {
                const points = [];
                for (let i = 0; i < 6; i++) {
                    const pAngle = this.angle + (i * Math.PI * 2) / 6;
                    points.push({
                        x: this.x + Math.cos(pAngle) * this.radius,
                        y: this.y + Math.sin(pAngle) * this.radius,
                        angle: pAngle
                    });
                }
                
                ctx.lineWidth = 4.0;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';

                // 繪製六邊形本體
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const next = (i + 1) % 6;
                    ctx.moveTo(points[i].x, points[i].y);
                    ctx.lineTo(points[next].x, points[next].y);
                }
                ctx.stroke();

                // 繪製延伸直線 (分支)
                this.branches.forEach(branch => {
                    const startPoint = points[branch.index];
                    const branchAngle = startPoint.angle; 
                    
                    const endX = startPoint.x + Math.cos(branchAngle) * branch.length;
                    const endY = startPoint.y + Math.sin(branchAngle) * branch.length;
                    
                    ctx.beginPath();
                    ctx.moveTo(startPoint.x, startPoint.y);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();

                    if (branch.hasAtom) {
                        ctx.beginPath();
                        ctx.arc(endX, endY, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });

                // 繪製裝飾節點 (維持原本的間隔節點樣式)
                points.forEach((p, idx) => {
                    if (idx % 2 === 0) {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }
        }

        function handleCollisions() {
            for (let i = 0; i < structures.length; i++) {
                for (let j = i + 1; j < structures.length; j++) {
                    structures[i].resolveCollision(structures[j]);
                }
            }
        }

        function connectStructures() {
            for (let i = 0; i < structures.length; i++) {
                if (!structures[i].isConnectedType) continue;
                for (let j = i + 1; j < structures.length; j++) {
                    if (!structures[j].isConnectedType) continue;
                    let dx = structures[i].x - structures[j].x;
                    let dy = structures[i].y - structures[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 250) {
                        let opacity = (1 - distance / 250) * 0.3;
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                        ctx.lineWidth = 1.0; 
                        ctx.beginPath();
                        ctx.moveTo(structures[i].x, structures[i].y);
                        ctx.lineTo(structures[j].x, structures[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function init() {
            structures = [];
            const count = Math.floor((canvas.width * canvas.height) / 45000);
            for (let i = 0; i < count; i++) {
                structures.push(new MoleculeStructure());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            handleCollisions();
            connectStructures();
            structures.forEach(s => {
                s.update();
                s.draw();
            });
            requestAnimationFrame(animate);
        }

        resizeCanvas();
        init();
        animate();

        window.addEventListener('resize', () => {
            resizeCanvas();
            init();
        });
    }
});
