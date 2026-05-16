// 拖拽功能
setTimeout(() => {
    const waifu = document.getElementById("waifu");
    if (!waifu) return;
    
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    waifu.addEventListener("mousedown", function(e) {
        if (e.target.closest("#waifu-tool")) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = waifu.offsetLeft;
        initialTop = waifu.offsetTop;
        waifu.style.cursor = "grabbing";
    });
    
    document.addEventListener("mousemove", function(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;
        
        // 边界限制
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - waifu.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - waifu.offsetHeight));
        
        waifu.style.position = "fixed";
        waifu.style.left = newLeft + "px";
        waifu.style.top = newTop + "px";
        waifu.style.right = "auto";
        waifu.style.bottom = "auto";
    });
    
    document.addEventListener("mouseup", function() {
        if (isDragging) {
            isDragging = false;
            waifu.style.cursor = "grab";
        }
    });
}, 500);
