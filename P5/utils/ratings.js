// Se ejecuta cuando la página está completamente cargada
document.addEventListener('DOMContentLoaded', () => {
    // Obtiene todos los elementos con la clase 'stars'
    const ele_stars = document.getElementsByClassName('stars');
  
    // Itera por cada elemento para hacer fetch con su ID
    for (const ele of ele_stars) {
        const id = ele.dataset._id; // _id está en los atributos del dataset
  
        // Realiza el fetch al API para obtener el rating
        fetch(`/api/ratings/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la respuesta del servidor: ${response.status}`);
                }
                return response.json();
            })
            .then(rating => {
                if (rating && rating.rate !== undefined && rating.count !== undefined) {
                    const starsHtml = generarEstrellas(rating.rate, rating.count, id);
                    ele.innerHTML = starsHtml;
                    ele.dataset.rate = rating.rate;
                    ele.dataset.count = rating.count;

                    if (window.location.pathname.includes('/producto/')){
                        agregarManejadorEstrellas(ele, id); 
                    }
                } else {
                    throw new Error('Datos del rating inválidos');
                }
            })
            .catch(error => {
                console.error('Error al cargar el rating:', error);
                ele.innerHTML = '<span style="color: red;">Error al cargar el rating</span>';
            });
    }
});

// Función para generar estrellas y mostrar el número de reseñas
function generarEstrellas(rate, count, productoId) {
    const estrellasTotales = 5;
    let html = '';

    for (let i = 0; i < Math.floor(rate); i++) {
        html += `<span class="star selected" data-star="${i + 1}" data-_id="${productoId}">★</span>`;
    }

    if (rate % 1 !== 0) {
        html += `<span class="star half" data-star="${Math.floor(rate) + 1}" data-_id="${productoId}">★</span>`;
    }

    for (let i = Math.floor(rate) + (rate % 1 === 0 ? 0 : 1); i < estrellasTotales; i++) {
        html += `<span class="star" data-star="${i + 1}" data-_id="${productoId}">★</span>`;
    }

    html += `<span class="vote-count">(${count} votos)</span>`;

    return html;
}

function agregarManejadorEstrellas(ele, id){
    // Iteramos sobre cada contenedor de estrellas
    for (const ele_hijo of ele.children) {
        if (ele_hijo.classList.contains('star')) {
            ele_hijo.addEventListener('click', Vota);
        }
    }
}

// Función para votar
function Vota(evt) {
    // Obtiene el ID del producto y la estrella seleccionada
    const productoId = evt.target.dataset._id;
    const estrellaNumero = parseInt(evt.target.dataset.star);

    // Encuentra el contenedor de estrellas
    const contenedorEstrellas = evt.target.closest('.stars');

    // Obtiene los valores actuales desde el dataset
    const rateActual = parseFloat(contenedorEstrellas.dataset.rate) || 0;
    const countActual = parseInt(contenedorEstrellas.dataset.count) || 0;

    // Calcula el nuevo promedio ponderado y el nuevo número de votos
    const nuevoCount = countActual + 1;
    const nuevoRate = ((rateActual * countActual) + estrellaNumero) / nuevoCount;

    // Actualización optimística en la interfaz de usuario
    actualizarEstrellasOptimisticamente(contenedorEstrellas, nuevoRate, nuevoCount);

    // Realiza el fetch para enviar la calificación al servidor
    fetch(`/api/ratings/${productoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            rate: nuevoRate,      // Nuevo promedio calculado
            count: nuevoCount      // Nuevo número de votos
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        return response.json();
    })
    .then(data => {
        // Actualiza la interfaz con la respuesta real del servidor
        if (data && data.rate !== undefined && data.count !== undefined) {
            actualizarEstrellasOptimisticamente(contenedorEstrellas, data.rate, data.count);
        } else {
            throw new Error('Respuesta inválida del servidor');
        }
    })
    .catch(error => {
        console.error("Error al enviar la calificación:", error);
        // Revertir la actualización optimística si algo falla
        revertirEstrellas(contenedorEstrellas, rateActual, countActual);
    });
}

function actualizarEstrellasOptimisticamente(contenedor, nuevoRate, nuevoCount) {
    const stars = contenedor.querySelectorAll('.star');
    const voteCount = contenedor.querySelector('.vote-count');

    // Itera a través de las estrellas
    stars.forEach((star, index) => {
        if (index < Math.floor(nuevoRate)) {
            // Marca como seleccionada las estrellas completas
            star.classList.add('selected');
            star.classList.remove('half');
        } else if (index === Math.floor(nuevoRate) && nuevoRate % 1 !== 0) {
            // Marca como media la estrella si es el punto decimal
            star.classList.add('half');
            star.classList.remove('selected');
        } else {
            // Elimina las clases de selección para las estrellas vacías
            star.classList.remove('selected', 'half');
        }
    });

    // Actualiza el número de votos
    voteCount.textContent = `(${nuevoCount} votos)`;

    // Sincroniza los atributos de datos del contenedor
    contenedor.dataset.rate = nuevoRate;
    contenedor.dataset.count = nuevoCount;
}

function revertirEstrellas(contenedor, rateAnterior, countAnterior) {
    const stars = contenedor.querySelectorAll('.star');
    const voteCount = contenedor.querySelector('.vote-count');

    // Itera a través de las estrellas
    stars.forEach((star, index) => {
        if (index < Math.floor(rateAnterior)) {
            // Marca como seleccionada las estrellas completas
            star.classList.add('selected');
            star.classList.remove('half');
        } else if (index === Math.floor(rateAnterior) && rateAnterior % 1 !== 0) {
            // Marca como media la estrella si es el punto decimal
            star.classList.add('half');
            star.classList.remove('selected');
        } else {
            // Elimina las clases de selección para las estrellas vacías
            star.classList.remove('selected', 'half');
        }
    });

    // Restaura el número de votos
    voteCount.textContent = `(${countAnterior} votos)`;

    // Restaura los atributos de datos
    contenedor.dataset.rate = rateAnterior;
    contenedor.dataset.count = countAnterior;
}