document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search");
    const zimmerFilter = document.getElementById("filter-zimmer");
    const mieteFilter = document.getElementById("filter-miete");
    const applyFiltersButton = document.getElementById("apply-filters");
    const tbody = document.getElementById("wohnungen-body");

    async function ladeWohnungen() {
        try {
            const response = await fetch("/api/wohnungen");
            if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);

            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Ungültige API-Antwort: Erwartetes Array nicht erhalten.");

            tbody.innerHTML = "";

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;">Keine Wohnungen verfügbar</td></tr>`;
                return;
            }

            data.forEach((wohnung) => {
                const tr = document.createElement("tr");

                const kaltmiete = parseFloat(wohnung.kaltmiete) || 0;
                const nebenkosten = parseFloat(wohnung.nebenkosten) || 0;
                const gesamtmiete = (kaltmiete + nebenkosten).toFixed(2);

                tr.innerHTML = `
                <td>${wohnung.objektid || 'n/A'}</td>
                <td>${wohnung.strasse ? `${wohnung.strasse} ${wohnung.hausnummer}, ${wohnung.plz} ${wohnung.ort}` : 'n/A'}</td>
                <td>${wohnung.wohnflaeche ? `${wohnung.wohnflaeche} m²` : 'n/A'}</td>
                <td>${wohnung.anzahlzimmer || 'n/A'}</td>
                <td>${kaltmiete ? `${kaltmiete.toFixed(2)} €` : 'n/A'}</td>
                <td>${nebenkosten ? `${nebenkosten.toFixed(2)} €` : 'n/A'}</td>
                <td>${gesamtmiete !== "0.00" ? `${gesamtmiete} €` : 'n/A'}</td>
                <td>${wohnung.verfuegbar_ab || 'n/A'}</td>
                <td>${wohnung.etage || 'n/A'}</td>
                <td>${wohnung.baujahr || 'n/A'}</td>
            `;
                tr.dataset.zimmer = wohnung.anzahlzimmer || 0; // Speichern der Zimmeranzahl
                tr.dataset.kaltmiete = kaltmiete || 0; // Speichern der Kaltmiete
                tbody.appendChild(tr);
            });

            console.log("Wohnungsdaten erfolgreich geladen:", data);
        } catch (error) {
            console.error("Fehler beim Laden der Wohnungen:", error.message || error);
            alert("Fehler beim Laden der Wohnungen.");
        }
    }

    function filterTabelle() {
        const searchValue = searchInput.value.toLowerCase(); // Suchwert (klein geschrieben für Case-Insensitive-Suche)
        const zimmerValue = zimmerFilter.value; // Gewählte Zimmeranzahl
        const mieteValue = parseFloat(mieteFilter.value); // Maximale Kaltmiete
        const rows = tbody.getElementsByTagName("tr"); // Alle Tabellenzeilen

        Array.from(rows).forEach((row) => {
            const cells = row.getElementsByTagName("td");
            const rowText = Array.from(cells).map((cell) => cell.textContent.toLowerCase()).join(" "); // Alle Inhalte einer Zeile

            const rowZimmer = parseInt(row.dataset.zimmer, 10); // Zimmeranzahl aus dem Dataset
            const rowKaltmiete = parseFloat(row.dataset.kaltmiete); // Kaltmiete aus dem Dataset

            let visible = true;

            // Filter 1: Textsuche
            if (searchValue && !rowText.includes(searchValue)) {
                visible = false;
            }

            // Filter 2: Zimmeranzahl
            if (zimmerValue && zimmerValue !== "5+" && rowZimmer !== parseInt(zimmerValue, 10)) {
                visible = false;
            } else if (zimmerValue === "5+" && rowZimmer < 5) {
                visible = false;
            }

            // Filter 3: Max. Kaltmiete
            if (!isNaN(mieteValue) && rowKaltmiete > mieteValue) {
                visible = false;
            }

            // Zeile ein- oder ausblenden
            row.style.display = visible ? "" : "none";
        });
    }

    // Event-Listener für die Filter
    applyFiltersButton.addEventListener("click", (e) => {
        e.preventDefault(); // Verhindere Seitennavigation
        filterTabelle();
    });

    ladeWohnungen();
});