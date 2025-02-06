require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pgClient = require('./dbconnection');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(express.static(path.join(__dirname, "public")));

// POST: Neue Wohnung hinzufügen
app.post('/api/wohnung', async (req, res) => {
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

        // Prüfe, ob alle erforderlichen Felder enthalten sind
        if (
            !objektid ||
            !verfuegbar_ab ||
            !baujahr ||
            !kontaktperson ||
            !flachen ||
            !ausstattung ||
            !preise ||
            !freitexte ||
            !geo
        ) {
            return res.status(400).json({ error: "Fehlende oder ungültige Daten im Request-Body" });
        }

        // Prüfe, ob die ObjektID bereits existiert
        const checkObjektID = `SELECT objektid FROM wohnungen WHERE objektid = $1`;
        const existingObjekt = await pgClient.query(checkObjektID, [objektid]);
        if (existingObjekt.rows.length > 0) {
            return res.status(400).json({ error: "ObjektID existiert bereits." });
        }

        // In Tabelle 'wohnungen' einfügen
        const insertWohnung = `INSERT INTO wohnungen (objektid, verfuegbar_ab, baujahr) VALUES ($1, $2, $3)`;
        await pgClient.query(insertWohnung, [objektid, verfuegbar_ab, baujahr]);

        // Kontaktperson in die Tabelle 'kontaktperson' einfügen
        await pgClient.query(
            `INSERT INTO kontaktperson (objektid, name, email, telephone) VALUES ($1, $2, $3, $4)`,
            [objektid, kontaktperson.name, kontaktperson.email, kontaktperson.telephone]
        );

        // Flächen in die Tabelle 'flachen' einfügen
        await pgClient.query(
            `INSERT INTO flachen (objektid, anzahlzimmer, wohnflaeche, balkon) VALUES ($1, $2, $3, $4)`,
            [
                objektid,
                flachen.anzahlzimmer,
                flachen.wohnflaeche,
                flachen.balkon ? 1 : 0 // Boolean zu NUMERIC (true -> 1, false -> 0)
            ]
        );

        // Ausstattung in die Tabelle 'ausstattung' einfügen
        await pgClient.query(
            `INSERT INTO ausstattung (objektid, aufzug, balkon) VALUES ($1, $2, $3)`,
            [
                objektid,
                ausstattung.aufzug ? 1 : 0, // Boolean zu NUMERIC
                ausstattung.balkon ? 1 : 0  // Boolean zu NUMERIC
            ]
        );

        // Preise in die Tabelle 'preise' einfügen
        await pgClient.query(
            `INSERT INTO preise (objektid, heizkosten, nebenkosten, kaltmiete, nettokaltmiete, freitext_preis) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                objektid,
                preise.heizkosten,
                preise.nebenkosten,
                preise.kaltmiete,
                preise.nettokaltmiete,
                preise.freitext_preis
            ]
        );

        // Freitexte in die Tabelle 'freitexte' einfügen
        await pgClient.query(
            `INSERT INTO freitexte (objektid, objekttitel, lage, ausstattungsbeschreibung) VALUES ($1, $2, $3, $4)`,
            [
                objektid,
                freitexte.objekttitel,
                freitexte.lage,
                freitexte.ausstattungsbeschreibung
            ]
        );

        // Adresse in die Tabelle 'geo' einfügen
        await pgClient.query(
            `INSERT INTO geo (objektid, strasse, hausnummer, plz, ort, etage) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                objektid,
                geo.strasse,
                geo.hausnummer,
                geo.plz,
                geo.ort,
                geo.etage
            ]
        );

        res.status(201).json({ message: "Wohnung erfolgreich hinzugefügt!", objektid });
    } catch (error) {
        console.error("Fehler beim Speichern der Wohnung:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});

// GET: Alle Wohnungen abrufen
app.get('/api/wohnungen', async (req, res) => {
    try {
        const query = `
            SELECT w.objektid,
                   w.verfuegbar_ab,
                   w.baujahr,
                   k.name      AS kontakt_name,
                   k.email     AS kontakt_email,
                   k.telephone AS kontakt_telefon,
                   f.anzahlzimmer,
                   f.wohnflaeche,
                   f.balkon,
                   a.aufzug,
                   a.balkon    AS ausstattung_balkon,
                   p.heizkosten,
                   p.nebenkosten,
                   p.kaltmiete,
                   p.nettokaltmiete,
                   p.freitext_preis,
                   ft.objekttitel,
                   ft.lage,
                   ft.ausstattungsbeschreibung,
                   ad.strasse,
                   ad.hausnummer,
                   ad.plz,
                   ad.ort,
                   ad.etage
            FROM wohnungen w
                     LEFT JOIN kontaktperson k ON w.objektid = k.objektid
                     LEFT JOIN flachen f ON w.objektid = f.objektid
                     LEFT JOIN ausstattung a ON w.objektid = a.objektid
                     LEFT JOIN preise p ON w.objektid = p.objektid
                     LEFT JOIN freitexte ft ON w.objektid = ft.objektid
                     LEFT JOIN geo ad ON w.objektid = ad.objektid;
        `;

        const result = await pgClient.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Fehler beim Abrufen der Wohnungen:", error);
        res.status(500).json({error: "Interner Serverfehler"});
    }
});

// GET: Einzelne Wohnung abrufen
app.get('/api/wohnung/:id', async (req, res) => {
    try {
        const query = `
            SELECT
                w.objektid, w.verfuegbar_ab, w.baujahr,
                k.name AS kontakt_name, k.email AS kontakt_email, k.telephone AS kontakt_telefon,
                f.anzahlzimmer, f.wohnflaeche, f.balkon,
                a.aufzug, a.balkon AS ausstattung_balkon,
                p.heizkosten, p.nebenkosten, p.kaltmiete, p.nettokaltmiete, p.freitext_preis,
                ft.objekttitel, ft.lage, ft.ausstattungsbeschreibung
            FROM wohnungen w
                     LEFT JOIN kontaktperson k ON w.objektid = k.objektid
                     LEFT JOIN flachen f ON w.objektid = f.objektid
                     LEFT JOIN ausstattung a ON w.objektid = a.objektid
                     LEFT JOIN preise p ON w.objektid = p.objektid
                     LEFT JOIN freitexte ft ON w.objektid = ft.objektid
            WHERE w.objektid = $1;
        `;

        const result = await pgClient.query(query, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Wohnung nicht gefunden!" });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Fehler beim Abrufen der Wohnung:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});

// DELETE: Wohnung löschen
app.delete('/api/wohnung/:id', async (req, res) => {
    try {
        const result = await pgClient.query('DELETE FROM wohnungen WHERE objektid = $1 RETURNING *', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Wohnung nicht gefunden!" });
        }

        res.status(200).json({ message: "Wohnung erfolgreich gelöscht!", data: result.rows[0] });

    } catch (error) {
        console.error("Fehler beim Löschen der Wohnung:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});

// Starten des Servers
app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
