import axios from 'axios';
import { prettyNum } from 'pretty-num';
import { translate } from '@vitalets/google-translate-api';
import google from '@victorsouzaleal/googlethis';
import { OrganicResult, search } from 'google-sr';
import Genius from 'genius-lyrics';
import qs from 'querystring';
import { showConsoleLibraryError, timestampToDate } from './general.util.js';
import { obterDadosBrasileiraoA, obterDadosBrasileiraoB } from '@victorsouzaleal/brasileirao';
import { JSDOM } from 'jsdom';
import UserAgent from 'user-agents';
import moment from 'moment-timezone';
import Fuse from 'fuse.js';
import botTexts from '../helpers/bot.texts.helper.js';
export async function animeReleases() {
    try {
        const URL_BASE = 'https://animedays.org/';
        const { data: animesResponse } = await axios.get(URL_BASE, { headers: { "User-Agent": new UserAgent().toString() } });
        const { window: { document } } = new JSDOM(animesResponse);
        let $animes = document.querySelectorAll('div.postbody > div:nth-child(2) > div.listupd.normal > div.excstf > article > div');
        let animes = [];
        for (let $anime of $animes) {
            let name = $anime.querySelector('a > div.tt > h2')?.innerHTML;
            let episode = $anime.querySelector('a > div.limit > div.bt > span.epx')?.innerHTML;
            let url = $anime.querySelector('a')?.href;
            if (!name || !episode || !url) {
                continue;
            }
            name = name.split("Episódio")[0];
            animes.push({
                name,
                episode,
                url
            });
        }
        return animes;
    }
    catch (err) {
        showConsoleLibraryError(err, 'animeReleases');
        throw new Error(botTexts.library_error);
    }
}
export async function mangaReleases() {
    try {
        const URL_BASE = 'https://mangabr.net/';
        const { data: mangasResponse } = await axios.get(URL_BASE, { headers: { "User-Agent": new UserAgent().toString() } });
        const { window: { document } } = new JSDOM(mangasResponse);
        let $mangas = document.querySelectorAll('div.col-6.col-sm-3.col-md-3.col-lg-2.p-1');
        let mangas = [];
        for (let $manga of $mangas) {
            let name = $manga.querySelector('h3.chapter-title > span.series-name')?.innerHTML.trim();
            let chapter = $manga.querySelector('h3.chapter-title > span.chapter-name')?.innerHTML.trim();
            let url = `https://mangabr.net${$manga.querySelector('a.link-chapter')?.getAttribute('href')}`;
            if (!name || !chapter) {
                continue;
            }
            mangas.push({
                name,
                chapter,
                url
            });
        }
        return mangas;
    }
    catch (err) {
        showConsoleLibraryError(err, 'mangaReleases');
        throw new Error(botTexts.library_error);
    }
}
export async function brasileiraoTable(serie) {
    try {
        let table;
        if (serie == "A") {
            table = await obterDadosBrasileiraoA();
        }
        else if (serie == "B") {
            table = await obterDadosBrasileiraoB();
        }
        else {
            throw new Error("Unsupported league");
        }
        return table;
    }
    catch (err) {
        showConsoleLibraryError(err, 'brasileiraoTable');
        throw new Error(botTexts.library_error);
    }
}
export async function moviedbTrendings(type = "movie") {
    try {
        let num = 0;
        const BASE_URL = `https://api.themoviedb.org/3/trending/${type}/day?api_key=6618ac868ff51ffa77d586ee89223f49&language=pt-BR`;
        const { data: movieDbResponse } = await axios.get(BASE_URL);
        const trendings = movieDbResponse.results.map((item) => {
            num++;
            return `${num}°: *${item.title || item.name}.*\n\`Sinopse:\` ${item.overview} \n`;
        }).join('\n');
        return trendings;
    }
    catch (err) {
        showConsoleLibraryError(err, 'moviedbTrendings');
        throw new Error(botTexts.library_error);
    }
}
export async function calcExpression(expr) {
    try {
        const URL_BASE = 'https://api.mathjs.org/v4/';
        expr = expr.replace(/[Xx\xD7]/g, "*");
        expr = expr.replace(/\xF7/g, "/");
        expr = expr.replace(/,/g, ".");
        expr = expr.replace("em", "in");
        const { data: calcResponse } = await axios.post(URL_BASE, { expr });
        let calcResult = calcResponse.result;
        if (calcResult == "NaN" || calcResult == "Infinity") {
            return null;
        }
        calcResult = calcResult.split(" ");
        calcResult[0] = (calcResult[0].includes("e")) ? prettyNum(calcResult[0]) : calcResult[0];
        calcResult = calcResult.join(" ");
        return calcResult;
    }
    catch (err) {
        showConsoleLibraryError(err, 'calcExpression');
        throw new Error(botTexts.library_error);
    }
}
export async function newsGoogle(lang = 'pt') {
    try {
        const newsList = await google.getTopNews(lang);
        let newsResponse = newsList.headline_stories.map(news => {
            return {
                title: news.title,
                published: news.published,
                author: news.by,
                url: news.url
            };
        });
        return newsResponse;
    }
    catch (err) {
        showConsoleLibraryError(err, 'newsGoogle');
        throw new Error(botTexts.library_error);
    }
}
export async function translationGoogle(text, lang) {
    try {
        const translationResponse = await translate(text, { to: lang });
        return translationResponse.text;
    }
    catch (err) {
        showConsoleLibraryError(err, 'translationGoogle');
        throw new Error(botTexts.library_error);
    }
}
export async function shortenUrl(url) {
    try {
        const URL_BASE = 'https://shorter.me/page/shorten';
        const { data: shortenResponse } = await axios.post(URL_BASE, qs.stringify({ url, alias: '', password: '' }));
        if (!shortenResponse.data) {
            return null;
        }
        return shortenResponse.data;
    }
    catch (err) {
        showConsoleLibraryError(err, 'shortenUrl');
        throw new Error(botTexts.library_error);
    }
}
export async function webSearchGoogle(texto) {
    try {
        const searchResults = await search({ query: texto, resultTypes: [OrganicResult] });
        let searchResponse = searchResults.map(search => {
            return {
                title: search.title,
                url: search.link,
                description: search.description
            };
        });
        return searchResponse;
    }
    catch (err) {
        showConsoleLibraryError(err, 'webSearchGoogle');
        throw new Error(botTexts.library_error);
    }
}
export async function wheatherInfo(location) {
    try {
        const WEATHER_API_URL = `http://api.weatherapi.com/v1/forecast.json?key=516f58a20b6c4ad3986123104242805&q=${encodeURIComponent(location)}&days=3&aqi=no&alerts=no`;
        const { data: wheatherResult } = await axios.get(WEATHER_API_URL);
        const { data: wheatherConditions } = await axios.get("https://www.weatherapi.com/docs/conditions.json", { responseType: 'json' });
        const currentCondition = wheatherConditions.find((condition) => condition.code === wheatherResult.current.condition.code).languages.find((language) => language.lang_iso == 'pt');
        let weatherResponse = {
            location: {
                name: wheatherResult.location.name,
                region: wheatherResult.location.region,
                country: wheatherResult.location.country,
                current_time: timestampToDate(wheatherResult.location.localtime_epoch * 1000)
            },
            current: {
                last_updated: timestampToDate(wheatherResult.current.last_updated_epoch * 1000),
                temp: `${wheatherResult.current.temp_c} C°`,
                feelslike: `${wheatherResult.current.feelslike_c} C°`,
                condition: wheatherResult.current.is_day ? currentCondition.day_text : currentCondition.night_text,
                wind: `${wheatherResult.current.wind_kph} Km/h`,
                humidity: `${wheatherResult.current.humidity} %`,
                cloud: `${wheatherResult.current.cloud} %`
            },
            forecast: []
        };
        wheatherResult.forecast.forecastday.forEach((forecast) => {
            const conditionDay = wheatherConditions.find((condition) => condition.code == forecast.day.condition.code).languages.find((lang) => lang.lang_iso == 'pt');
            const [year, month, day] = forecast.date.split("-");
            const forecastDay = {
                day: `${day}/${month}/${year}`,
                max: `${forecast.day.maxtemp_c} C°`,
                min: `${forecast.day.mintemp_c} C°`,
                avg: `${forecast.day.avgtemp_c} C°`,
                condition: `${conditionDay.day_text}`,
                max_wind: `${forecast.day.maxwind_kph} Km/h`,
                rain: `${forecast.day.daily_will_it_rain ? "Sim" : "Não"}`,
                chance_rain: `${forecast.day.daily_chance_of_rain} %`,
                snow: `${forecast.day.daily_will_it_snow ? "Sim" : "Não"}`,
                chance_snow: `${forecast.day.daily_chance_of_snow} %`,
                uv: forecast.day.uv
            };
            weatherResponse.forecast.push(forecastDay);
        });
        return weatherResponse;
    }
    catch (err) {
        showConsoleLibraryError(err, 'wheatherInfo');
        throw new Error(botTexts.library_error);
    }
}
export async function musicLyrics(text) {
    try {
        const geniusClient = new Genius.Client();
        const musicSearch = await geniusClient.songs.search(text).catch((err) => {
            if (err.message == "No result was found") {
                return null;
            }
            else {
                throw err;
            }
        });
        if (!musicSearch || !musicSearch.length) {
            return null;
        }
        const musicResult = {
            title: musicSearch[0].title,
            artist: musicSearch[0].artist.name,
            image: musicSearch[0].artist.image,
            lyrics: await musicSearch[0].lyrics()
        };
        return musicResult;
    }
    catch (err) {
        showConsoleLibraryError(err, 'musicLyrics');
        throw new Error(botTexts.library_error);
    }
}
export async function convertCurrency(currency, value) {
    try {
        const URL_BASE = 'https://economia.awesomeapi.com.br/json/last/';
        value = parseInt(value.toString().replace(",", "."));
        let params;
        switch (currency) {
            case 'dolar':
                params = "USD-BRL,USD-EUR,USD-JPY";
                break;
            case 'euro':
                params = "EUR-BRL,EUR-USD,EUR-JPY";
                break;
            case 'iene':
                params = "JPY-BRL,JPY-USD,JPY-EUR";
                break;
            case 'real':
                params = "BRL-USD,BRL-EUR,BRL-JPY";
                break;
        }
        const { data: convertResponse } = await axios.get(URL_BASE + params);
        let convertResult = {
            value: value,
            currency: currency,
            convertion: []
        };
        for (let convertion in convertResponse) {
            let currencyType = '';
            let currencySymbol = '';
            switch (convertResponse[convertion].codein) {
                case "BRL":
                    currencyType = "Real";
                    currencySymbol = "R$";
                    break;
                case "EUR":
                    currencyType = "Euro";
                    currencySymbol = "Є";
                    break;
                case "USD":
                    currencyType = "Dólar";
                    currencySymbol = "$";
                    break;
                case "JPY":
                    currencyType = "Iene";
                    currencySymbol = "¥";
                    break;
            }
            let arrayDateUpdated = convertResponse[convertion].create_date.split(" ")[0].split("-");
            let hourUpdated = convertResponse[convertion].create_date.split(" ")[1];
            convertResult.convertion.push({
                currency: currencyType,
                convertion_name: convertResponse[convertion].name,
                value_converted: (convertResponse[convertion].bid * value).toFixed(2),
                value_converted_formatted: `${currencySymbol} ${(convertResponse[convertion].bid * value).toFixed(2)}`,
                updated: `${arrayDateUpdated[2]}/${arrayDateUpdated[1]}/${arrayDateUpdated[0]} às ${hourUpdated}`
            });
        }
        return convertResult;
    }
    catch (err) {
        showConsoleLibraryError(err, 'convertCurrency');
        throw new Error(botTexts.library_error);
    }
}
export async function infoDDD(ddd) {
    try {
        const URL_BASE = 'https://gist.githubusercontent.com/victorsouzaleal/ea89a42a9f912c988bbc12c1f3c2d110/raw/af37319b023503be780bb1b6a02c92bcba9e50cc/ddd.json';
        const { data: dddResponse } = await axios.get(URL_BASE);
        const states = dddResponse.estados;
        const indexDDD = states.findIndex((state) => state.ddd.includes(ddd));
        if (indexDDD === -1) {
            return null;
        }
        const response = {
            state: states[indexDDD].nome,
            region: states[indexDDD].regiao
        };
        return response;
    }
    catch (err) {
        showConsoleLibraryError(err, 'infoDDD');
        throw new Error(botTexts.library_error);
    }
}
export async function symbolsASCI() {
    try {
        const URL_BASE = 'https://gist.githubusercontent.com/victorsouzaleal/9a58a572233167587e11683aa3544c8a/raw/aea5d03d251359b61771ec87cb513360d9721b8b/tabela.txt';
        const { data: symbolsResponse } = await axios.get(URL_BASE);
        return symbolsResponse;
    }
    catch (err) {
        showConsoleLibraryError(err, 'symbolsASCI');
        throw new Error(botTexts.library_error);
    }
}
export async function searchGame(gameTitle) {
    try {
        const LIBRARIES = [
            'https://hydralinks.cloud/sources/fitgirl.json',
            'https://hydralinks.cloud/sources/dodi.json',
            'https://hydralinks.cloud/sources/kaoskrew.json',
            'https://hydralinks.cloud/sources/onlinefix.json',
            'https://hydralinks.cloud/sources/steamrip.json',
            'https://hydralinks.cloud/sources/atop-games.json'
        ];
        let gamesList = [];
        for await (let library of LIBRARIES) {
            const libraryResponse = await axios.get(library, { responseType: 'json' });
            libraryResponse.data.downloads.forEach((game) => {
                gamesList.push({
                    uploader: libraryResponse.data.name,
                    ...game
                });
            });
        }
        const fuse = new Fuse(gamesList, { ignoreLocation: true, keys: ["title"], threshold: 0.1 });
        const resultList = fuse.search(gameTitle).map(result => result.item);
        resultList.forEach(result => {
            result.uploadDate = moment(result.uploadDate).format('DD/MM/YYYY');
        });
        return resultList;
    }
    catch (err) {
        showConsoleLibraryError(err, 'searchGame');
        throw new Error(botTexts.library_error);
    }
}
export async function simSimi(text) {
    try {
        const URL_BASE = 'https://api.simsimi.vn/v2/simtalk';
        const config = {
            url: URL_BASE,
            method: "post",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: qs.stringify({ text, lc: 'pt' })
        };
        const { data: simiResponse } = await axios(config).catch((err) => {
            if (err.response?.data?.message) {
                return err.response;
            }
            else {
                throw err;
            }
        });
        return simiResponse.message;
    }
    catch (err) {
        showConsoleLibraryError(err, 'simSimi');
        throw new Error(botTexts.library_error);
    }
}
export async function funnyRandomPhrases() {
    try {
        const URL_BASE = 'https://gist.githubusercontent.com/victorsouzaleal/bfbafb665a35436acc2310d51d754abb/raw/2be5f3b5333b2a9c97492888ed8e63b7c7675ae6/frases.json';
        let { data } = await axios.get(URL_BASE);
        let responsePhrase = data.frases[Math.floor(Math.random() * data.frases.length)];
        let cont_params = 1;
        if (responsePhrase.indexOf("{p3}") != -1) {
            cont_params = 3;
        }
        else if (responsePhrase.indexOf("{p2}") != -1) {
            cont_params = 2;
        }
        for (let i = 1; i <= cont_params; i++) {
            let complementChosen = data.complementos[Math.floor(Math.random() * data.complementos.length)];
            responsePhrase = responsePhrase.replace(`{p${i}}`, `*${complementChosen}*`);
            data.complementos.splice(data.complementos.indexOf(complementChosen, 1));
        }
        return responsePhrase;
    }
    catch (err) {
        showConsoleLibraryError(err, 'funnyRandomPhrases');
        throw new Error(botTexts.library_error);
    }
}
