const d3TimeFormat = require('d3-time-format').timeFormat;
const cheerio = require('cheerio'); // import cheerio for making use of css selector to get info

const request = require('./lib/request'); // importing request for making get request

const {ifError} = require('./lib/error'); // error file
const {getWinner} = require('./lib/awards'); // awards are provided
const {getCast, getPoster} = require('./lib/photo'); // poster and cast info is given by this function
const {getEpisodes} = require('./lib/episode');
const {
  getRating,
  getGenre,
  getPro,
  getStory,
  getTitle,
  getRuntime,
  getYear,
  getEpisodeCount,
  getStars,
  getSimilarMoviesById
} = require('./lib/data');
const {getTrending, getTrendingGenre} = require('./lib/trending') // provide trending functions
const {search, searchActor, simpleSearch} = require('./lib/search') // provide search functions

const getMonthDay = d3TimeFormat('%m-%d');
const BASE_URL = "https://www.imdb.com";

function scrapper(id) {
  return request(`${BASE_URL}/title/${id}/?ref_=nv_sr_1`).then((data) => {
    const $ = cheerio.load(data)


    return {...getTitle($), ...getRuntime($), ...getYear($), ...getStory($),
      ...getPro($), ...getGenre($), ...getRating($), ...getPoster($),
      ...getPoster($), ...getEpisodeCount($), ...getSimilarMoviesById($)}
  }).catch(ifError)
} // combining all the low level api in the single one

function awardsPage(id) {
  return request(`${BASE_URL}/title/${id}/awards?ref_=tt_awd`).then((data) => {
    const $ = cheerio.load(data)
    return { ...getWinner(4, $), ...getWinner(7, $), ...getWinner(10, $) }
  }).catch(ifError)
}

function episodesPage(id, season = 1) {
  return request(`https://www.imdb.com/title/${id}/episodes?season=${season}`)
  .then((data) => {
    const $ = cheerio.load(data)
    return { ...getEpisodes($) }
  }).catch(ifError)
}
//episodesPage('tt1520211').then(data=>console.log(data))
function getStarsByBornDay(date){
  const monthday = getMonthDay(date);
  return request(`${BASE_URL}/search/name?birth_monthday=${monthday}&refine=birth_monthday&ref_=nv_cel_brn`)
  .then(data => {
    const $ = cheerio.load(data);
    return getStars($);
  })
  .catch(ifError)
}

function getStarsBornToday(){
  return getStarsByBornDay(Date.now())
}

function getFull(id) {
  return Promise.all([scrapper(id), awardsPage(id), getCast(id)]).then((data) => {
    return { ...data[0], ...data[1], ...data[2]}
  }).catch(ifError)
}

function getActor(id){
  return request(`https://www.imdb.com/name/${id}/?ref_=tt_cl_t1`).then((data) => {
    const $ = cheerio.load(data);
    let result = [];
    let info = $('div.inline').text().split('\n').join(' ').split('...');
    let birthDate = $('div#name-born-info a:nth-child(1)').text();
    let birthYear = $('div#name-born-info a:nth-child(2)').text();
    let bornInfo = $('div#name-born-info a:nth-child(3)').text();
    let name = $('h1.header span.itemprop').text();
    let image = $('a img#name-poster').attr('src');
    result.push({
      actorName: name,
      actorImage: image,
      actorInfo: info[0].trim(),
      actorBirth: birthDate + ", " + birthYear,
      actorBorn: bornInfo
    });
    return result;
  }).catch(ifError)
}

module.exports = {scrapper, getTrendingGenre, getTrending, search, getFull,
  getStarsByBornDay, getStarsBornToday, awardsPage, episodesPage, getCast,getActor,searchActor, simpleSearch, ifError, request}
