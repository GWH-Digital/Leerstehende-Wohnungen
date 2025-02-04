const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({ origin: '*' })); 
app.use(express.static(path.join(__dirname, "public")));

const wohnungen = [];
// Hinzufügen von einer wohnung
app.post('/api/wohnung', (req, res) => {
    try {
        const { id, addresse, groesse, zimmer, grundmiete, gesamtmiete, verfuegbar, etage, baujahr } = req.body;

        const requiredFields = { 
            id: "number", 
            addresse: "string", 
            groesse: "number", 
            zimmer: "number", 
            grundmiete: "number", 
            gesamtmiete: "number", 
            verfuegbar: "string", 
            etage: "number", 
            baujahr: "number" 
        };

        const missingOrInvalidFields = Object.keys(requiredFields).filter(field => {
            return !(field in req.body) || typeof req.body[field] !== requiredFields[field];
        });

        if (missingOrInvalidFields.length > 0) {
            return res.status(400).json({    
                error: `Ungültige oder fehlende Felder: ${missingOrInvalidFields.join(", ")}` 
            });
        }

        if (wohnungen.some(wohnung => wohnung.id === id)) {
            return res.status(409).json({ error: "Diese ID existiert bereits!" });
        }

        const neueWohnung = { id, addresse, groesse, zimmer, grundmiete, gesamtmiete, verfuegbar, etage, baujahr };
        wohnungen.push(neueWohnung);

        res.status(201).json({ message: "Wohnung erfolgreich hinzugefügt!", data: neueWohnung });
    } catch (error) {
        console.error("Fehler beim Hinzufügen der Wohnung:", error);
        res.status(500).json({ error: "Interner Serverfehler" });
    }
});
// Gibt alle Wohnungsobjekte zurück
app.get('/api/wohnungen', (req, res) => {
    res.json(wohnungen);
});
// Überprüft ob wohnung schon vorhanden
app.get('/api/wohnung/:id', (req, res) => {
    const wohnung = wohnungen.find(w => w.id === parseInt(req.params.id));

    if (!wohnung) {
        return res.status(404).json({ error: "Wohnung nicht gefunden!" });
    }
    res.json(wohnung);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//löschge die wohnung (e.g. Wohnung wurde schon vermietet)
app.delete('/api/wohnung/:id', (req, res) => {
    const id = parseInt(req.params.id);
    // Sucht den index wo sich die wohnung in dem array befindet 
    const index = wohnungen.findIndex(w => w.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Wohnung nicht gefunden!" });
    }
    //.splice entfernt an position index, genau 1 element
    // die [0] gibt das erst gelöschte element zurück
    const deletedWohnung = wohnungen.splice(index, 1)[0];

    res.status(200).json({ message: "Wohnung erfolgreich gelöscht!", data: deletedWohnung });
});

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));
