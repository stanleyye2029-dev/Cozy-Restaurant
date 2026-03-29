function clearTransition() {
    const transitionScreen = document.getElementById('transition-screen');
    transitionScreen.classList.add('clear');
    setTimeout(() => {
        transitionScreen.style.display = 'none';
    }, 5000); // Match the CSS transition duration
}