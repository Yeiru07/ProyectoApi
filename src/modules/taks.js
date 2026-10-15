import data from "../data.json";


const ID = "2993";
const PLACEHOLDER_IMAGE = "https://placehold.co/210x295";
const getEpisodeList = async (id) => {


    const getShowData = async (id) => {
        const URL = `https://api.tvmaze.com/shows/${id}`;
        const data = await fetch(URL).then(res => res.json());

        return {
            name: data.name,
            rating: data.rating,
            image: data.image?.medium ?? PLACEHOLDER_IMAGE
        }
    }

    const URL = `https://api.tvmaze.com/shows/${id}/episodes`;
    const episodes = await fetch(URL).then(res => res.json());

    const episodeList = episodes.map(episode => ({
        number: episode.number,
        season: episode.season,
        rating: episode.rating.average
    }));

    const episodesBySeason = Object.groupBy(episodeList, (episode) => episode.season);
    return episodesBySeason;
}