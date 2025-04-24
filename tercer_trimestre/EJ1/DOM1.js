document.addEventListener("DOMContentLoaded", function() {
    const paragraphs = document.querySelectorAll("p");
    const displayDiv = document.getElementById("mostrar");

    if (displayDiv) {
        let content = "";
        paragraphs.forEach(paragraph => {
            content += paragraph.innerHTML + "<br><br>";
        });
        displayDiv.innerHTML = content;
    }
});