document.addEventListener('DOMContentLoaded', () => {
    // === 1. 共用變數宣告 (確保只宣告一次) ===
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');
    const canvas = document.getElementById('moleculeCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    // === 2. 手機版選單與分頁切換邏輯 ===
    if (menuToggle && navMenu) {
        // 點擊漢堡選單
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止冒泡
            navMenu.classList.toggle('active');
        });

        // 點擊頁面其他地方關閉選單
        document.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    }

    // 分頁切換
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');

            // 1. 切換導航標籤狀態
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // 2. 切換頁面內容顯示
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetId) {
                    page.classList.add('active');
                }
            });

            // 3. 如果是手機版，切換分頁後自動縮回選單
            if (window.innerWidth <= 800) {
                navMenu.classList.remove('active');
            }
            
            // 4. 切換分頁後自動捲回頂部
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
                this.radius = 45; 
                this.angle = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.003;
                this.isConnectedType = Math.random() < 0.3;

                this.branches = [];
                const branchCount = Math.floor(Math.random() * 3) + 2;
                const availableIndices = [0, 1, 2, 3, 4, 5];
                for(let i=0; i<branchCount; i++) {
                    const randomIndex = Math.floor(Math.random() * availableIndices.length);
                    const vertexIndex = availableIndices.splice(randomIndex, 1)[0];
                    this.branches.push({
                        index: vertexIndex,
                        length: 25 + Math.random() * 35,
                        angleOffset: (Math.random() - 0.5) * 1.2,
                        hasAtom: Math.random() > 0.4
                    });
                }
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
                
                ctx.lineWidth = 4.0; // 修正線條寬度，5.0 在手機上會太粗
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';

                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const next = (i + 1) % 6;
                    ctx.moveTo(points[i].x, points[i].y);
                    ctx.lineTo(points[next].x, points[next].y);
                }
                ctx.stroke();

                this.branches.forEach(branch => {
                    const startPoint = points[branch.index];
                    const branchAngle = startPoint.angle + branch.angleOffset;
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
