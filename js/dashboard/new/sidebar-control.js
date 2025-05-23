export function adjustSidebar(sidebar, triggerBtn) {
    if (!sidebar.classList.contains("show")) return;
    sidebar.style.left = document.querySelector(".sidebar").classList.contains("open") ? "255px" : "83px";
    const top = triggerBtn.getBoundingClientRect().top + window.scrollY;
    sidebar.style.top = `${top}px`;
    sidebar.style.height = `${window.innerHeight - top - 10}px`;
}