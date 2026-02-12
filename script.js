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