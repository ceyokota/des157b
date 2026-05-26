(function () {
    console.log("reading js");

    var button = document.querySelector("button");
    var overlay = document.querySelector("#starting-overlay");
    var question = document.querySelector(".question");

    button.addEventListener("click", function () {
        overlay.style.display = "none";
        question.style.display="grid";
        document.querySelector('#progress-container').style.display="flex";
    });

})();