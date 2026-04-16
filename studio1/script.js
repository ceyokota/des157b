(function(){
    "use strict";
    console.log("reading js");

    const fs = document.querySelector('.fa-expand');
    const myVideo = document.querySelector('#myVideo');

    const stanzas = document.querySelectorAll('.stanza');

    const poem = {
        start: [1, 6, 11, 16, 21],
        stop: [5, 10, 15, 20, 25],
        line: [stanza1, stanza2, stanza3, stanza4, stanza5]
    }

    const intervalID = setInterval(checkTime, 100);


    //fullscreen button
    fs.addEventListener('click', function(){
        if (!document.fullscreenElement){
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    })

    //displays the different chunks of poem
    function checkTime(){
        for (let i=0; i < poem.start.length; i++) {
            if (poem.start[i] < myVideo.currentTime && myVideo.currentTime < poem.stop[i]) {
                poem.line[i].className = "showing";
            } else {
                poem.line[i].className = "hidden";
            }
        }
    }


    //when mouse moves up/down, saturation changes
    const video = document.querySelector("#myVideo");

    document.addEventListener("mousemove", function (e) {
        const y = e.clientY;
        const height = window.innerHeight;
      
        const t = y / height;
      
        const saturation = 2 - t * 2;
      
        video.style.filter = "saturate(" + saturation + ")";
      });
})();