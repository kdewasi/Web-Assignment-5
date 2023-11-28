/********************************************************************************
* WEB322 – Assignment 05
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Kishan Dewasi  Student ID: 117925222 Date: 11/27/2023

Published URL: https://upset-duck-frock.cyclic.app/

********************************************************************************/

const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const legoData = require("./modules/legoSets");

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

legoData.initialize();

app.use((req, res, next) => {
    app.locals.currentRoute = req.path;
    next();
});



app.get('/', (req, res) => {
    res.render("home");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/lego/sets', async (req, res) => {
    try {
        const theme = req.query.theme;

        if (theme) {
            const setsByTheme = await legoData.getSetsByTheme(theme);
            res.render("sets", { sets: setsByTheme });
        } else {
            const allSets = await legoData.getAllSets();
            res.render("sets", { sets: allSets });
        }
    } catch (error) {
        console.error('Error in /lego/sets:', error);
        res.status(404).render("404", { message: "No Sets found for a matching theme." });
    }
});

app.get('/lego/sets/:setNum', async (req, res) => {
    const setNumParam = req.params.setNum;

    try {
        const legoSet = await legoData.getSetByNum(setNumParam);

        if (legoSet) {
            res.render("set", { set: legoSet });
        } else {
            res.status(404).render('404', { message: "Lego set not found." });
        }
    } catch (error) {
        console.log('Error in getSetByNum():', error);
        res.status(404).render("404", { message: "No Sets found for a specific set num." });
    }
});

app.get("/lego/addSet", async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        res.render("addSet", { themes });
    } catch (err) {
        res.render("500", { message: `Error: ${err.message}` });
    }
});

app.post('/lego/addSet', async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        await legoData.addSet(req.body);
        res.redirect('/lego/sets');
    } catch (err) {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
});

app.get("/lego/editSet/:set_num", async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.set_num);
        const themes = await legoData.getAllThemes();

        res.render("editSet", { themes, set });
    } catch (err) {
        res.status(404).render("404", { message: err.message });
    }
});

app.post('/lego/editSet', async (req, res) => {
    try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect('/lego/sets');
    } catch (err) {
        res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err.errors[0].message || err}` });
    }
});

app.get("/lego/deleteSet/:set_num", async (req, res) => {
    try {
        await legoData.deleteSet(req.params.set_num);
        res.redirect('/lego/sets');
    } catch (err) {
        res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err.errors[0].message || err}` });
    }
});


app.use((req, res, next) => {
    res.status(404).render("404", { message: "No view matched for a specific route" });
});

app.listen(port, () => console.log(`Server listening on port: ${port}`));
