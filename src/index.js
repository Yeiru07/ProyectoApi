import {
    getShowData,
    getEpisodeList,
    searchShowByName
} from "./modules/tvmaze.js";

const $header = document.querySelector(".content > header");
const $episodes = document.querySelector(".episodes");
const $searchResults = document.querySelector(".search-results");

const taskInput = document.querySelector(".taskInput");
const buttonTaskInput = document.querySelector(".taskButton");
const searchType = document.querySelector("#searchType");

// Crear la información de la serie
const createShowHTML = (show) => {
    const poster = document.createElement("img");
    poster.classList.add("poster");
    poster.src = show.image;
    poster.alt = `Póster de ${show.name}`;

    const showInfo = document.createElement("div");
    showInfo.classList.add("show-info");

    const title = document.createElement("h1");
    title.textContent = show.name;

    const rating = document.createElement("p");
    rating.textContent =
        `Valoración: ${show.rating?.average ?? "Sin valoración"}`;

    showInfo.append(title, rating);
    $header.replaceChildren(poster, showInfo);
};

// Crear un episodio con su color de valoración
const createEpisodeHTML = (episode) => {
    const episodeElement = document.createElement("div");

    const rating = episode.rating;

    const ratingClass = rating == null
        ? 0
        : Math.max(0, Math.min(10, Math.round(rating)));

    episodeElement.classList.add(
        "episode",
        `episode-${episode.number ?? 0}`,
        `rating-${ratingClass}`
    );

    episodeElement.textContent =
        String(episode.number ?? "-").padStart(2, "0");

    episodeElement.title =
        `Episodio ${episode.number ?? "-"} - Valoración: ${rating ?? "Sin valoración"
        }`;

    return episodeElement;
};

// Crear una temporada
const createSeasonHTML = (episodes, number) => {
    const season = document.createElement("article");
    season.classList.add("season");

    const seasonHeader = document.createElement("header");
    seasonHeader.classList.add("season-header");
    seasonHeader.textContent =
        `T${String(number).padStart(2, "0")}`;

    const seasonEpisodes = document.createElement("div");
    seasonEpisodes.classList.add("season-episodes");

    episodes.forEach(episode => {
        seasonEpisodes.append(createEpisodeHTML(episode));
    });

    season.append(seasonHeader, seasonEpisodes);

    return season;
};

// Crear una tarjeta seleccionable para una serie
const createShowCard = (show) => {
    const card = document.createElement("button");
    card.type = "button";
    card.classList.add("show-card");

    const poster = document.createElement("img");
    poster.src = show.image;
    poster.alt = `Póster de ${show.name}`;
    poster.loading = "lazy";

    const title = document.createElement("h3");
    title.textContent = show.name;

    const rating = document.createElement("p");
    rating.textContent =
        `Valoración: ${show.rating?.average ?? "Sin valoración"}`;

    card.append(poster, title, rating);

    // Cargar la serie al seleccionar su tarjeta
    card.addEventListener("click", () => {
        cargarSerie(show.id);
    });

    return card;
};

// Mostrar los resultados en una cuadrícula
const mostrarResultados = (results) => {
    $searchResults.replaceChildren();

    const title = document.createElement("h2");
    title.textContent = "Selecciona una serie";

    const resultsGrid = document.createElement("div");
    resultsGrid.classList.add("results-grid");

    results.forEach(show => {
        resultsGrid.append(createShowCard(show));
    });

    $searchResults.append(title, resultsGrid);
};

// Cargar una serie por ID
const cargarSerie = async (id) => {
    buttonTaskInput.disabled = true;

    try {
        $searchResults.replaceChildren();
        $header.replaceChildren();
        $episodes.replaceChildren();

        const show = await getShowData(id);
        const seasons = await getEpisodeList(id);

        createShowHTML(show);

        Object.entries(seasons)
            .sort(([a], [b]) => Number(a) - Number(b))
            .forEach(([number, episodes]) => {
                $episodes.append(
                    createSeasonHTML(episodes, Number(number))
                );
            });

        limpiarCampos();

    } catch (error) {
        $header.replaceChildren();
        $episodes.replaceChildren();

        alert(error.message || "Error al consultar la serie.");
        console.error("Error al cargar la serie:", error);

    } finally {
        buttonTaskInput.disabled = false;
    }
};

// Buscar una serie por ID o por nombre
const buscarSerie = async () => {
    const value = taskInput.value.trim();

    if (value === "") {
        alert("Escribe un ID o el nombre de una serie.");
        return;
    }

    if (searchType.value === "id") {
        const id = Number(value);

        if (!Number.isInteger(id) || id <= 0) {
            alert("Escribe un ID válido.");
            return;
        }

        await cargarSerie(id);
        return;
    }

    try {
        buttonTaskInput.disabled = true;

        $searchResults.replaceChildren();
        $header.replaceChildren();
        $episodes.replaceChildren();

        console.log("Buscando serie:", value);

        const results = await searchShowByName(value);

        console.log("Resultados recibidos:", results);

        if (results.length === 0) {
            const message = document.createElement("p");
            message.textContent = "No se encontraron series.";
            $searchResults.append(message);
            return;
        }

        mostrarResultados(results);

    } catch (error) {
        console.error("Error al buscar:", error);
        alert("No se pudo realizar la búsqueda. Revisa la consola con F12.");

    } finally {
        buttonTaskInput.disabled = false;
    }
};

// Agregar eventos al botón y a la tecla Enter
function agregarListeners() {
    buttonTaskInput.addEventListener("click", buscarSerie);

    taskInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            buscarSerie();
        }
    });
}

// Limpiar el campo de búsqueda
function limpiarCampos() {
    taskInput.value = "";
}

agregarListeners();