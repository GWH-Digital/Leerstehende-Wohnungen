document.addEventListener("DOMContentLoaded", function () {
    async function ladeWohnungen() {
        try {
            const response = await fetch("/api/wohnungen");
            if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);

            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Ungültige API-Antwort: Erwartetes Array nicht erhalten.");

            const tbody = document.getElementById("wohnungen-body");
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
                tbody.appendChild(tr);
            });

            console.log("Wohnungsdaten erfolgreich geladen:", data);
        } catch (error) {
            console.error("Fehler beim Laden der wohnungen:", error.message || error);
            alert("Fehler beim Laden der Wohnungen.");
        }
    }

    ladeWohnungen();
});
