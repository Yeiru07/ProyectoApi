const PLACEHOLDER_IMAGE = "https://placehold.co/210x295";

// Obtener la información de una serie por ID
export const getShowData = async (id) => {
    const URL = `https://api.tvmaze.com/shows/${id}`;
    const response = await fetch(URL);

    if (!response.ok) {
        throw new Error("No se encontró la serie.");
    }

    const data = await response.json();

    return {
        id: data.id,
        name: data.name,
        rating: data.rating,
        image: data.image?.medium ?? PLACEHOLDER_IMAGE
    };
};

// Obtener episodios y organizarlos por temporada
export const getEpisodeList = async (id) => {
    const URL = `https://api.tvmaze.com/shows/${id}/episodes`;
    const response = await fetch(URL);

    if (!response.ok) {
        throw new Error("No se pudieron obtener los episodios.");
    }

    const episodes = await response.json();

    const episodeList = episodes
        .filter(episode => episode.season != null)
        .map(episode => ({
            number: episode.number,
            season: episode.season,
            rating: episode.rating?.average ?? null
        }));

    // Agrupar episodios sin depender de Object.groupBy
    return episodeList.reduce((seasons, episode) => {
        const seasonNumber = episode.season;

        if (!seasons[seasonNumber]) {
            seasons[seasonNumber] = [];
        }

        seasons[seasonNumber].push(episode);

        return seasons;
    }, {});
};

// Buscar series por nombre
export const searchShowByName = async (name) => {
    const URL =
        `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(name)}`;

    const response = await fetch(URL);

    if (!response.ok) {
        throw new Error("No se pudo buscar la serie.");
    }

    const data = await response.json();

    return data.map(item => ({
        id: item.show.id,
        name: item.show.name,
        rating: item.show.rating,
        image: item.show.image?.medium ?? PLACEHOLDER_IMAGE
    }));
};