document.addEventListener("DOMContentLoaded", function () {
  async function ladeWohnungen() {
      try {
          const response = await fetch("/api/wohnungen");
          if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);

          const data = await response.json();
          const tbody = document.getElementById("wohnungen-body");

          tbody.innerHTML = ""; 

          if (data.length === 0) {
              tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Keine Wohnungen verfügbar</td></tr>`;
              return;
          }

          data.forEach((wohnung) => {
              const tr = document.createElement("tr");
              tr.innerHTML = `
                  <td>${wohnung.id}</td>
                  <td>${wohnung.addresse}</td>
                  <td>${wohnung.groesse} m²</td>
                  <td>${wohnung.zimmer}</td>
                  <td>${wohnung.grundmiete} €</td>
                  <td>${wohnung.gesamtmiete} €</td>
                  <td>${wohnung.verfuegbar}</td>
                  <td>${wohnung.etage}</td>
                  <td>${wohnung.baujahr}</td>
              `;
              tbody.appendChild(tr);
          });

          console.log("Wohnungsdaten erfolgreich geladen:", data);
      } catch (error) {
          console.error("Fehler beim Laden der Wohnungen:", error.message || error);
          alert("Fehler beim Laden der Wohnungen.");
      }
  }

  ladeWohnungen();
});
