(function() {
    "use strict";
    console.log("reading js");

    window.onload = function() {
        gsap.registerPlugin(Draggable);

        // left circle gradient
        new Granim({
            element: '#granim-left',
            direction: 'left-right',
            states: { "default-state": { gradients: [['#ff9966', '#ff5e62'], ['#00F260', '#0575E6'], ['#e1eec3', '#f05053']] } }
        });

        // right circle gradient
        new Granim({
            element: '#granim-right',
            direction: 'left-right',
            states: { "default-state": { gradients: [['#ff9966', '#ff5e62'], ['#00F260', '#0575E6'], ['#e1eec3', '#f05053']] } }
        });


        //modal stuff
        const modal = document.querySelector('#success-modal');
        const resetBtn = document.querySelector('#reset-btn');

        function checkWinCondition() {
            if (document.querySelectorAll('.ingredient').length === 0) {
                modal.style.display = 'flex';
            }
        }


        // dragging things
        Draggable.create(".ingredient", {
            type: "x,y",
            onDragEnd: function() {
                const target = this.target;
                target.className += ' falling';
                
                target.addEventListener('animationend', function() {
                    target.remove();
                    checkWinCondition();
                });
            }
        });

        resetBtn.addEventListener('click', function() {
            location.reload();
        });
    };
})();