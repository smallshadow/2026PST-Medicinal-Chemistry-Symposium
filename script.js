document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');

    // 1. 手機版漢堡選單開關
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // 2. 分頁切換邏輯
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // 取得目標分頁 ID
            const targetId = link.getAttribute('data-target');

            // 移除所有連結的 active 狀態
            navLinks.forEach(l => l.classList.remove('active'));
            // 加入當前連結的 active 狀態
            link.classList.add('active');

            // 隱藏所有頁面，顯示目標頁面
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetId) {
                    page.classList.add('active');
                }
            });

            // 如果是手機版，點擊後自動縮回選單
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // === 1. 分子背景動畫 (Hero Molecule Animation) ===
    const canvas = document.getElementById('moleculeCanvas');
    const ctx = canvas.getContext('2d');
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
        }
    }

    class MoleculeStructure {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // --- 3. 速度 (Velocity) ---
        // 數值越大漂浮越快。0.3 代表每幀移動 0.3 像素。
            this.vx = (Math.random() - 0.5) * 0.5; 
            this.vy = (Math.random() - 0.5) * 0.5;
            // --- 1. 六角形大小 (Size) ---
        // 這是六角形中心到頂點的距離。35 像素大約等於直徑 70 像素。
            this.radius = 45; 
            this.angle = Math.random() * Math.PI * 2;
            // --- 3. 旋轉速度 (Rotation) ---
        // 數值越大旋轉越明顯。
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

        // 碰撞檢測邏輯：防止分子穿透疊在一起
        resolveCollision(other) {
            let dx = other.x - this.x;
            let dy = other.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = 120; // 防止重疊的安全距離

            if (distance < minDistance && distance > 0) {
                let overlap = minDistance - distance;
                let nx = dx / distance;
                let ny = dy / distance;

                // 彈開位移
                this.x -= nx * (overlap / 2);
                this.y -= ny * (overlap / 2);
                other.x += nx * (overlap / 2);
                other.y += ny * (overlap / 2);

                // 速度微反轉，增加彈性動態
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
            // --- 2. 主體線條粗細 (Main Stroke Width) ---
    // 控制六角形主體與支鏈的粗細。
    // 建議範圍：1.0 ~ 3.0
            ctx.lineWidth = 5.0;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';// 線條顏色
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';// 原子圓點顏色

            // 繪製六角形
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const next = (i + 1) % 6;
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[next].x, points[next].y);
            }
            ctx.stroke();

            // 繪製支鏈
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

            // 繪製頂點原子
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
                    // --- 2. 互連線粗細 (Connection Stroke Width) ---
    // 這是分子與分子之間淡淡連線的粗細。
    // 通常設定比主體細一點 (例如 1.0)，視覺層次會更好。
                    ctx.lineWidth = 5.0;
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
        // --- 1. 數量 (Quantity) ---
    // 這裡的 35000 是密度係數。
    // 數字越小 (例如 20000)，產生的分子數量就越多、越密。
    // 數字越大 (例如 50000)，產生的分子數量就越少、越疏。
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

    // === 2. 原有的 UI 切換邏輯 (手機選單與分頁) ===
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetId) page.classList.add('active');
            });
            if (window.innerWidth <= 768) navMenu.classList.remove('active');
        });
    });
});
