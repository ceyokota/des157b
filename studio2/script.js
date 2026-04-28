(function() {
    "use strict";
    console.log("reading js");

    const textbox = document.querySelector('#textbox');
    const barGroups = document.querySelectorAll('.bar-group');

    async function getData() {
        const myData = await fetch('data/data.json');
        const dataFromJSON = await myData.json(); 
        setupEventListeners(dataFromJSON); 
    }

    function setupEventListeners(data) {
        for (let i = 0; i < barGroups.length; i++) {
            const group = barGroups[i];
    
            group.addEventListener('mouseenter', function() {
                const monthKey = this.getAttribute('data-month');
                
                const appCount = data[monthKey];
                const totalHours = (appCount * 20) / 60;
                const dailyMinutes = (appCount * 20) / 30; 

                textbox.innerHTML = 
                `<p>I applied to <strong>${appCount}</strong> applications during <strong>${monthKey}</strong>!<br>
                That's about <strong>${totalHours.toFixed(1)}</strong> hours total or 
                <strong>${dailyMinutes.toFixed(2)}</strong> minutes per day!</p>`;
                
                textbox.className = "show";
                document.querySelector('h2').style.opacity = "0";
            });
    
            group.addEventListener('mouseleave', function() {
                textbox.className = "hide";
                document.querySelector('h2').style.opacity = "1";
            });
        }
    }

    getData();
})();