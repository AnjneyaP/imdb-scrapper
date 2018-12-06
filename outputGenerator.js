const {
  scrapper,
  getTrendingGenre,
  getTrending,
  search,
  getFull,
  getStarsByBornDay,
  getStarsBornToday,
  awardsPage,
  episodesPage,
  getCast,
  getActor,
  searchActor,
  simpleSearch,
  getUpcoming,
  changeQuality
} = require("./index");

const {
  template,
  imageTemplate,
  imageTemplateGroup
} = require("./generateReadMe");

const fs = require("fs");

if (!fs.existsSync(__dirname + "/output")) {
  fs.mkdirSync(__dirname + "/output");
} else {
  console.log("Please remove output folder");
  process.exit(1);
}

const arr = [];
/**
 * generateFile - generate output file for function
 *
 * @param {String} name  the name of output file
 * @param {Object | Array} value the returned value of the function output is generated
 *
 * @returns {Undifined}
 */

function generateFile(name, value) {
  fs.writeFileSync(
    __dirname + "/output/" + name + ".json",
    JSON.stringify(value, null, 4)
  );
  const arg = name.split("-");
  arr.push(
    template(
      `${arg[0]}(${arg.slice(1).join(",")})`,
      JSON.stringify(value, null, 2)
    )
  );
}

function generateImageTemplate(name, value) {
  const values = [...Array(6).keys()];
  const url =
    "https://m.media-amazon.com/images/M/MV5BMjMzMzQ0NzI5Nl5BMl5BanBnXkFtZTgwNjc2NTY0NjM@._V1_UX182_CR0,0,182,268_AL__QL50.jpg";
  const parsedUrl = values.map(val => {
    return imageTemplate(changeQuality(url, val), val);
  });
  arr.push(imageTemplateGroup(parsedUrl));
}

const jobs = [
  getFull("tt2395427").then(movieDetails => {
    generateFile("getFull-tt2395427", movieDetails);
  }),

  simpleSearch("flash").then(data => {
    generateFile("simpleSearch-flash", data);
  }),

  getTrending(7).then(data => {
    generateFile("getTrending-7", data);
  }),

  getTrendingGenre("comedy", 7).then(data => {
    generateFile("getTrending-comedy-7", data);
  }),

  awardsPage("tt2395427").then(movieDetails => {
    generateFile("awardsPage-tt5580390", movieDetails);
  }),

  scrapper("tt1825683").then(movieDetails => {
    generateFile("scrapper-tt1825683", movieDetails);
  }),

  search("new").then(result => {
    generateFile("search-'new world'", result);
  }),

  getStarsByBornDay(new Date()).then(stars => {
    generateFile("getStarsByBornDay-" + new Date(), stars);
  }),

  episodesPage("tt3107288", 2).then(episodes => {
    generateFile("episodesPage-tt3107288-2", episodes);
  }),
  getCast("tt1825683").then(movieDetails => {
    generateFile("getCast-tt1825683", movieDetails);
  }),

  getActor("nm2652716").then(actorDetails => {
    generateFile("getActor-nm2652716", actorDetails);
  }),

  searchActor("govinda").then(val => {
    generateFile("searchActor-govinda", val);
  }),

  getUpcoming(20).then(val => {
    generateFile("getUpcoming-20", val);
  }),
  generateImageTemplate()
];
Promise.all(jobs).then(v => {
  fs.writeFileSync(__dirname + "/EXAMPLE.md", arr.join("\n"));
});
