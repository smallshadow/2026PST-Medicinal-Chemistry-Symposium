document.addEventListener('DOMContentLoaded', () => {
    // === 1. 選單與分頁邏輯 ===
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');

    // 漢堡選單開關
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止點擊事件冒泡
        navMenu.classList.toggle('active');
    });

    // 點擊頁面其他地方自動縮回選單
    document.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });

    // 分頁切換
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

            // 手機版點擊後縮回
            navMenu.classList.remove('active');
        });
    });

    // === 2. 分子背景動畫 (畫布邏輯) ===
    const canvas = document.getElementById('moleculeCanvas');
    if (!canvas) return; // 確保畫布存在
    const ctx = canvas.getContext('2d');
    let structures = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // ... (此處保留您原有的 MoleculeStructure 類別定義與動畫邏輯) ...
    // 請確保您的 MoleculeStructure 定義放在這個區塊內
    
    // 初始化動畫
    resizeCanvas();
    // init(); // 呼叫您的初始化函數
    // animate(); // 開始循環
});
