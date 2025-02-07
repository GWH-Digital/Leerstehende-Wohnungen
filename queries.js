
// Prüfen, ob eine ObjektID bereits existiert
async function checkObjektIDExists(objektid) {
    const query = `SELECT objektid FROM wohnungen WHERE objektid = $1`;
    const { rows } = await pool.query(query, [objektid]);
    return rows.length > 0;
}

// Wohnung einfügen
async function insertWohnung(objektid, verfuegbar_ab, baujahr) {
    const query = `INSERT INTO wohnungen (objektid, verfuegbar_ab, baujahr) VALUES ($1, $2, $3)`;
    await pool.query(query, [objektid, verfuegbar_ab, baujahr]);
}

// Kontaktperson einfügen
async function insertKontaktperson(objektid, name, email, telephone) {
    const query = `INSERT INTO kontaktperson (objektid, name, email, telephone) VALUES ($1, $2, $3, $4)`;
    await pool.query(query, [objektid, name, email, telephone]);
}

// Flächen einfügen
async function insertFlachen(objektid, anzahlzimmer, wohnflaeche, balkon) {
    const query = `INSERT INTO flachen (objektid, anzahlzimmer, wohnflaeche, balkon) VALUES ($1, $2, $3, $4)`;
    await pool.query(query, [objektid, anzahlzimmer, wohnflaeche, balkon ? 1 : 0]);
}

// Ausstattung einfügen
async function insertAusstattung(objektid, aufzug, balkon) {
    const query = `INSERT INTO ausstattung (objektid, aufzug, balkon) VALUES ($1, $2, $3)`;
    await pool.query(query, [objektid, aufzug ? 1 : 0, balkon ? 1 : 0]);
}

// Preise einfügen
async function insertPreise(objektid, heizkosten, nebenkosten, kaltmiete, nettokaltmiete, freitext_preis) {
    const query = `
    INSERT INTO preise (objektid, heizkosten, nebenkosten, kaltmiete, nettokaltmiete, freitext_preis)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
    await pool.query(query, [objektid, heizkosten, nebenkosten, kaltmiete, nettokaltmiete, freitext_preis]);
}

// Freitexte einfügen
async function insertFreitexte(objektid, objekttitel, lage, ausstattungsbeschreibung) {
    const query = `
    INSERT INTO freitexte (objektid, objekttitel, lage, ausstattungsbeschreibung)
    VALUES ($1, $2, $3, $4)
  `;
    await pool.query(query, [objektid, objekttitel, lage, ausstattungsbeschreibung]);
}

// Adresse einfügen
async function insertGeo(objektid, strasse, hausnummer, plz, ort, etage) {
    const query = `
    INSERT INTO geo (objektid, strasse, hausnummer, plz, ort, etage)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
    await pool.query(query, [objektid, strasse, hausnummer, plz, ort, etage]);
}

// Abfrage: Alle Wohnungen abrufen
async function getAllWohnungen() {
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
    const { rows } = await pool.query(query);
    return rows;
}

// Abfrage: Einzelne Wohnung abrufen
async function getWohnungById(objektid) {
    const query = `
    SELECT *
    FROM wohnungen
             LEFT JOIN kontaktperson k ON wohnungen.objektid = k.objektid
             LEFT JOIN flachen f ON wohnungen.objektid = f.objektid
             LEFT JOIN ausstattung a ON wohnungen.objektid = a.objektid
             LEFT JOIN preise p ON wohnungen.objektid = p.objektid
             LEFT JOIN freitexte ft ON wohnungen.objektid = ft.objektid
             LEFT JOIN geo ad ON wohnungen.objektid = ad.objektid
    WHERE wohnungen.objektid = $1
  `;
    const { rows } = await pool.query(query, [objektid]);
    return rows[0];
}

// Wohnung löschen
async function deleteWohnung(objektid) {
    const query = `DELETE FROM wohnungen WHERE objektid = $1 RETURNING *`;
    const { rows } = await pool.query(query, [objektid]);
    return rows[0];
}

module.exports = {
    checkObjektIDExists,
    insertWohnung,
    insertKontaktperson,
    insertFlachen,
    insertAusstattung,
    insertPreise,
    insertFreitexte,
    insertGeo,
    getAllWohnungen,
    getWohnungById,
    deleteWohnung,
};