document.addEventListener("DOMContentLoaded", function () {
    // Obtener el contenedor de los álbumes
    const container = document.getElementById("albums-container");
    let albums = Array.from(container.children);
  
    // Función para extraer el año del texto del álbum
    function getYear(album) {
      const text = album.querySelector(".card-text").innerText;
      const match = text.match(/\((\d{4})\)/); // Busca el año entre paréntesis
      return match ? parseInt(match[1]) : 0;
    }
  
    // Ordenar los álbumes por año de lanzamiento al cargar la página
    albums.sort((a, b) => getYear(a) - getYear(b));
  
    // Reinsertar los álbumes en orden por año
    container.innerHTML = ""; // Vacía el contenedor
    albums.forEach(album => container.appendChild(album)); // Añade los álbumes ordenados
  
});
