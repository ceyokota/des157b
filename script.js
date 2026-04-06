(function() {
    'use strict';

    //// click and swipe sounds setup here
    const clickSound = document.querySelector('#click-sound');
    const swipeSound = document.querySelector('#swipe-sound');

    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play();
    }

    function playSwipeSound() {
        swipeSound.currentTime = 0;
        swipeSound.play();
    }

    ///// dark and light mode stuff

    let isDarkMode = false;
    const rightButton = document.querySelector('#right-button');
    const allImages = document.querySelectorAll('#container img');

    function toggleDarkMode() {
        playClickSound(); 
        isDarkMode = !isDarkMode;

        for (let i = 0; i < allImages.length; i++) {
            if (isDarkMode) {
                allImages[i].src = allImages[i].src.replace('_light', '_dark');
                document.body.style.backgroundColor = "#383938";
            } else {
                allImages[i].src = allImages[i].src.replace('_dark', '_light');
                document.body.style.backgroundColor = "#E9E9E9";
            }
        }
    }

    rightButton.addEventListener('click', toggleDarkMode);

    ///// arrow nav

    const arrowLeft = document.querySelector('#arrow-left');
    const arrowRight = document.querySelector('#arrow-right');
    const mainSection = document.querySelector('main');

    arrowRight.addEventListener('click', function() {
        playSwipeSound();
        arrowRight.style.display = 'none';
        arrowLeft.style.display = 'block';
        mainSection.style.left = '-720px';
    });

    arrowLeft.addEventListener('click', function() {
        playSwipeSound();
        arrowLeft.style.display = 'none';
        arrowRight.style.display = 'block';
        mainSection.style.left = '0';
    });

    // click sound <a>
    const allLinks = document.querySelectorAll('#container a');
    for (let i = 0; i < allLinks.length; i++) {
        allLinks[i].addEventListener('click', function() {
            playClickSound();
        });
    }



    function scaleContainer() {
        const container = document.querySelector('#container');
    
        const baseWidth = 1200;
        const baseHeight = 750;
    
        const scaleX = window.innerWidth / baseWidth;
        const scaleY = window.innerHeight / baseHeight;
    
        const scale = Math.min(scaleX, scaleY);
    
        container.style.transform = `scale(${scale})`;
    }
    
    window.addEventListener('resize', scaleContainer);
    window.addEventListener('load', scaleContainer);

})();