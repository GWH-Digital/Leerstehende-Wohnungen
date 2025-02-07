require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pgClient = require('./dbconnection');
const queries = require('./queries');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(express.static(path.join(__dirname, "public")));

// POST: Neue Wohnung hinzufügen
app.post("/api/wohnung", async (req, res) => {
    try {
        const {
            objektid,
            verfuegbar_ab,
            baujahr,
            kontaktperson,
            flachen,
            ausstattung,
            preise,
            freitexte,
            geo,
        } = req.body;

        // Prüfen, ob die ObjektID bereits existiert
        if (await queries.checkObjektIDExists(objektid)) {
            return res.status(400).json({ error: "ObjektID existiert bereits." });
        }

        // Neue Wohnung einfügen
        await queries.insertWohnung(objektid, verfuegbar_ab, baujahr);
        await queries.insertKontaktperson(objektid, kontaktperson.name, kontaktperson.email, kontaktperson.telephone);
        await queries.insertFlachen(objektid, flachen.anzahlzimmer, flachen.wohnflaeche, flachen.balkon);
        await queries.insertAusstattung(objektid, ausstattung.aufzug, ausstattung.balkon);
        await queries.insertPreise(
            objektid,
            preise.heizkosten,
            preise.nebenkosten,
            preise.kaltmiete,
            preise.nettokaltmiete,
            preise.freitext_preis
        );
        await queries.insertFreitexte(objektid, freitexte.objekttitel, freitexte.lage, freitexte.ausstattungsbeschreibung);
        await queries.insertGeo(objektid, geo.strasse, geo.hausnummer, geo.plz, geo.ort, geo.etage);

        res.status(201).json({ message: "Wohnung erfolgreich hinzugefügt!", objektid });
    } catch (error) {
        console.error("Fehler beim Speichern der Wohnung:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});

// GET: Alle Wohnungen abrufen
app.get("/api/wohnungen", async (req, res) => {
    try {
        const wohnungen = await queries.getAllWohnungen();
        res.json(wohnungen);
    } catch (error) {
        console.error("Fehler beim Abrufen der Wohnungen:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});

// GET: Einzelne Wohnung abrufen
app.get("/api/wohnung/:id", async (req, res) => {
    try {
        const wohnung = await queries.getWohnungById(req.params.id);
        if (!wohnung) {
            return res.status(404).json({ error: "Wohnung nicht gefunden!" });
        }
        res.json(wohnung);
    } catch (error) {
        console.error("Fehler beim Abrufen der Wohnung:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});

// DELETE: Wohnung löschen
app.delete("/api/wohnung/:id", async (req, res) => {
    try {
        const deletedWohnung = await queries.deleteWohnung(req.params.id);
        if (!deletedWohnung) {
            return res.status(404).json({ error: "Wohnung nicht gefunden!" });
        }
        res.status(200).json({ message: "Wohnung erfolgreich gelöscht!", data: deletedWohnung });
    } catch (error) {
        console.error("Fehler beim Löschen der Wohnung:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});


// Starten des Servers
app.listen(PORT, () => console.log(`Server läuft auf http://${process.env.DB_HOST}`));
