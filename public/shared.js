// Check for saved theme preference
const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
if (isDarkTheme) {
    document.documentElement.classList.add('dark-theme');
    document.body.classList.add('dark');
}

document.getElementById("Lamp").onclick = () => {
    document.documentElement.classList.toggle('dark-theme');
    const isDark = document.documentElement.classList.contains('dark-theme');
    localStorage.setItem('darkTheme', isDark);
}


//Check for smaller screen
const smallQuery = window.matchMedia("only screen and (max-width: 1024px)");

smallQuery.onchange = (e) => {
    const navTitle = document.getElementById("navTitle");

    if (e.matches) {
        navTitle.onclick = () => {
            document.documentElement.classList.toggle('dark-theme');
            const isDark = document.documentElement.classList.contains('dark-theme');
            localStorage.setItem('darkTheme', isDark);
        };
    } else {
        navTitle.onclick = null;
    }
}

// Check for menu click
const hamMenu = document.getElementById("hamMenu");
const offMenu = document.getElementById("offMenu");

hamMenu.onclick = () => {
    hamMenu.classList.toggle('active');
    offMenu.classList.toggle('active');
};