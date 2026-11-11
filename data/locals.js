// Data passed to every template, by the dev server (app.js) and the static build (build-static.js).
module.exports = {
    site: require('./site.json'),
    partners: require('./partners.json'),
    speakers: require('./speakers.json'),
    gallery: require('./gallery.json'),
    year: new Date().getFullYear(), // footer copyright, fixed at build time
};
