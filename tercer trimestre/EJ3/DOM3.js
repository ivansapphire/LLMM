function eliminarLista() {
    const lista = document.getElementById("objetosPokemonReales");

    while (lista.hasChildNodes()) {
        lista.removeChild(lista.firstChild);
    }
}