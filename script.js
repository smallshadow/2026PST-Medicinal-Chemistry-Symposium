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
    const canvas = document.getElementById('moleculeCanvas');
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const mouse = { x: null, y: null, radius: 150 };

    // 監聽滑鼠移動
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y + window.scrollY; // 修正捲動位移
    });

    function resizeCanvas() {
        const hero = document.querySelector('.hero');
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size * 1.5;
            this.color = color;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 5, Math.PI * 5, false);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
        }
        update() {
            // 邊界檢查
            if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
            if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

            // 滑鼠互動：排斥效果
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 20) this.x += 3;
                if (mouse.x > this.x && this.x > this.size * 20) this.x -= 3;
                if (mouse.y < this.y && this.y < canvas.height - this.size * 20) this.y += 3;
                if (mouse.y > this.y && this.y > this.size * 20) this.y -= 3;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        let numberOfParticles = (canvas.height * canvas.width) / 10000;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = Math.random() * 3 + 1;
            let x = Math.random() * (canvas.width - size * 2) + size;
            let y = Math.random() * (canvas.height - size * 2) + size;
            let directionX = (Math.random() * 2) - 1;
            let directionY = (Math.random() * 2) - 1;
            particlesArray.push(new Particle(x, y, directionX, directionY, size));
        }
    }

    function connect() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                    + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    let opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        init();
    });

    resizeCanvas();
    init();
    animate();
});
