function insertarImagenEnContenedor() {
    const imagen = document.createElement("img");
    imagen.src = "Vaca.webp";
    imagen.style.maxWidth = "30%";
    imagen.style.maxHeight = "30%";
    document.getElementById("contenedor").appendChild(imagen);
}