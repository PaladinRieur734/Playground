// Plafonds ASI, qui changent au 1er avril chaque année
const plafonds = {
    "2017": { seul: 9658.13, couple: 15592.07 },
    "2018": { seul: 9820.46, couple: 15872.24 },
    "2019": { seul: 9951.84, couple: 16091.92 },
    "2020": { seul: 10068.00, couple: 16293.12 },
    "2021": { seul: 10183.20, couple: 16396.49 },
    "2022": { seul: 10265.16, couple: 16512.93 },
    "2023": { seul: 10320.07, couple: 16548.23 },
    "2024": { seul: 10536.50, couple: 16890.35 },
};

// Liste des abattements annuels
const abattements = {
    "2017": { seul: 1400, couple: 2400 },
    "2018": { seul: 1450, couple: 2450 },
    "2019": { seul: 1500, couple: 2500 },
    "2020": { seul: 1550, couple: 2550 },
    "2021": { seul: 1600, couple: 2600 },
    "2022": { seul: 1600, couple: 2600 },
    "2023": { seul: 1600, couple: 2600 },
    "2024": { seul: 1650, couple: 2650 },
};

// Fonction pour récupérer le plafond applicable en fonction de la date d'effet
function obtenirPlafond(dateEffet, statut) {
    const annee = dateEffet.getFullYear();
    const mois = dateEffet.getMonth() + 1;
    const anneePlafond = mois < 4 ? annee - 1 : annee;
    return plafonds[anneePlafond]?.[statut] || 0;
}

// Fonction pour obtenir l'abattement applicable
function obtenirAbattement(dateEffet, statut, salaires) {
    const annee = dateEffet.getFullYear();
    const mois = dateEffet.getMonth() + 1;
    const anneeAbattement = mois < 4 ? annee - 1 : annee;
    const abattementMax = abattements[anneeAbattement]?.[statut] || 0;
    return Math.min(salaires, abattementMax);
}
// Colonnes personnalisées (2 colonnes seulement)
let customColumns = ["Colonne personnalisée 1", "Colonne personnalisée 2"];

// Fonction pour générer le tableau des ressources
function genererTableauRessources() {
    const dateEffet = new Date(document.getElementById("dateEffet").value);
    const statut = document.getElementById("statut").value;

    if (isNaN(dateEffet.getTime())) return;

    const ressourcesContainer = document.getElementById("ressourcesContainer");
    ressourcesContainer.innerHTML = ""; // Réinitialise le contenu

    const tableDemandeur = createRessourceTable("Demandeur", dateEffet);
    ressourcesContainer.appendChild(tableDemandeur);

    if (statut === "couple") {
        const tableConjoint = createRessourceTable("Conjoint", dateEffet);
        ressourcesContainer.appendChild(tableConjoint);
    }
}

// Création du tableau des ressources
function createRessourceTable(role, dateEffet) {
    const tableContainer = document.createElement("div");
    tableContainer.classList.add("table-container");

    const title = document.createElement("h3");
    title.textContent = `Ressources du ${role}`;
    tableContainer.appendChild(title);

    const table = document.createElement("table");
    table.id = `${role.toLowerCase()}Table`;

    const header = document.createElement("tr");
    [
        "Mois",
        "Pension d'invalidité",
        "Salaires",
        "Indemnités journalières",
        "Chômage",
        ...customColumns
    ].forEach((col, index) => {
        const th = document.createElement("th");
        if (index >= 5) {
            const input = document.createElement("input");
            input.type = "text";
            input.value = col;
            input.dataset.index = index - 5;
            input.oninput = (e) => updateCustomColumnNames(e.target, index - 5);
            input.style.wordWrap = "break-word";
            input.style.whiteSpace = "normal";
            input.style.width = "100%";
            th.appendChild(input);
        } else {
            th.textContent = col;
        }
        header.appendChild(th);
    });

    table.appendChild(header);

    for (let i = 3; i >= 1; i--) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const row = document.createElement("tr");

        const moisCell = document.createElement("td");
        moisCell.textContent = mois.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        row.appendChild(moisCell);

        ["invalidite", "salaires", "indemnites", "chomage"].forEach(type => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_${type}M${4 - i}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        // Colonnes personnalisées
        customColumns.forEach((col, index) => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_custom${index}M${4 - i}`;
            input.placeholder = "€";
            input.min = 0;
            cell.appendChild(input);
            row.appendChild(cell);
        });

        table.appendChild(row);
    }

    tableContainer.appendChild(table);
    return tableContainer;
}

// Mettre à jour les noms des colonnes personnalisées
function updateCustomColumnNames(input, index) {
    customColumns[index] = input.value;
}
// Calcul des ressources
function calculateRessources(role, dateEffet) {
    const details = [];
    let total = 0;
    let salairesTotal = 0;

    for (let i = 3; i >= 1; i--) {
        const mois = new Date(dateEffet);
        mois.setMonth(mois.getMonth() - i);

        const invalidite = parseFloat(document.getElementById(`${role.toLowerCase()}_invaliditeM${4 - i}`).value) || 0;
        const salaires = parseFloat(document.getElementById(`${role.toLowerCase()}_salairesM${4 - i}`).value) || 0;
        const indemnites = parseFloat(document.getElementById(`${role.toLowerCase()}_indemnitesM${4 - i}`).value) || 0;
        const chomage = parseFloat(document.getElementById(`${role.toLowerCase()}_chomageM${4 - i}`).value) || 0;

        let customTotal = 0;
        const customValues = {};
        customColumns.forEach((col, index) => {
            const value = parseFloat(document.getElementById(`${role.toLowerCase()}_custom${index}M${4 - i}`).value) || 0;
            customValues[col] = value;
            customTotal += value;
        });

        const moisTotal = invalidite + salaires + indemnites + chomage + customTotal;
        total += moisTotal;
        salairesTotal += salaires;

        details.push({
            mois: mois.toLocaleString("fr-FR", { month: "long", year: "numeric" }),
            invalidite,
            salaires,
            indemnites,
            chomage,
            customColumns: customValues,
            moisTotal,
        });
    }

    return { total, salaires: salairesTotal, details };
}

// Calcul des droits ASI
function calculerASI() {
    const statut = document.getElementById("statut").value;
    const dateEffet = new Date(document.getElementById("dateEffet").value);

    if (isNaN(dateEffet.getTime())) {
        alert("Veuillez sélectionner une date d'effet valide.");
        return;
    }

    const plafondAnnuel = obtenirPlafond(dateEffet, statut);
    const plafondTrimestriel = plafondAnnuel / 4;

    const demandeurRessources = calculateRessources("Demandeur", dateEffet);
    const conjointRessources = statut === "couple" ? calculateRessources("Conjoint", dateEffet) : { total: 0, salaires: 0 };

    const totalRessourcesAvantAbattement = demandeurRessources.total + conjointRessources.total;

    // Calcul des BIM
    const bimN1 = parseFloat(document.getElementById("bimN1").value) || 0;
    const montantBIMTrimestriel = (bimN1 * 0.03) / 4;

    const totalRessourcesAvecBIM = totalRessourcesAvantAbattement + montantBIMTrimestriel;

    // Calcul de l'abattement
    const totalSalaires = demandeurRessources.salaires + conjointRessources.salaires;
    const abattement = totalSalaires > 0 ? obtenirAbattement(dateEffet, statut, totalSalaires) : 0;

    const totalRessourcesApresAbattement = Math.max(0, totalRessourcesAvecBIM - abattement);

    afficherResultats(
        dateEffet,
        plafondTrimestriel,
        totalRessourcesAvecBIM,
        totalRessourcesApresAbattement,
        abattement,
        montantBIMTrimestriel,
        demandeurRessources.details,
        statut === "couple" ? conjointRessources.details : null
    );
}
// Affichage des résultats
function afficherResultats(
    dateEffet,
    plafondTrimestriel,
    ressourcesAvecBIM,
    ressourcesApresAbattement,
    abattement,
    montantBIMTrimestriel,
    demandeurDetails,
    conjointDetails
) {
    const result = document.getElementById("result");
    result.innerHTML = `
        <h2>Droits ASI au ${dateEffet.toLocaleDateString("fr-FR")}</h2>
    `;

    // Détails mois par mois pour le demandeur
    result.innerHTML += `<h3>Détails des ressources</h3>`;
    result.innerHTML += generateMonthlyDetails(demandeurDetails, "Demandeur");

    // Détails mois par mois pour le conjoint (si applicable)
    if (conjointDetails) {
        result.innerHTML += generateMonthlyDetails(conjointDetails, "Conjoint");
    }

    // Résumé des ressources
    result.innerHTML += `
        <h3>Résumé des ressources</h3>
        <table>
            <tr><td><strong>Total trimestriel avant abattement (incluant BIM) :</strong></td><td>${ressourcesAvecBIM.toFixed(2)} €</td></tr>
            <tr><td><strong>Montant BIM trimestriel :</strong></td><td>${montantBIMTrimestriel.toFixed(2)} €</td></tr>
            <tr><td><strong>Abattement appliqué :</strong></td><td>${abattement.toFixed(2)} €</td></tr>
            <tr><td><strong>Total trimestriel après abattement :</strong></td><td>${ressourcesApresAbattement.toFixed(2)} €</td></tr>
            <tr><td><strong>Plafond trimestriel applicable :</strong></td><td>${plafondTrimestriel.toFixed(2)} €</td></tr>
        </table>
    `;

    // Conclusion
    if (ressourcesApresAbattement > plafondTrimestriel) {
        result.innerHTML += `<p>Les ressources combinées au cours du trimestre de référence, soit ${ressourcesApresAbattement.toFixed(2)} € étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - ressourcesApresAbattement;
        const montantMensuelASI = montantASI / 3;
        result.innerHTML += `<p>Le montant trimestriel de l’allocation supplémentaire à servir était donc de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € [plafond] – ${ressourcesApresAbattement.toFixed(2)} € [ressources]). Seuls des arrérages d’un montant mensuel de ${montantMensuelASI.toFixed(2)} € étaient dus à compter du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    }
}

// Génération des détails mois par mois
function generateMonthlyDetails(details, role) {
    let html = `<h4>Détails des ressources pour ${role}</h4>`;
    details.forEach(detail => {
        html += `
            <h5>${detail.mois}</h5>
            <ul>
                <li>Pension d'invalidité : ${detail.invalidite.toFixed(2)} €</li>
                <li>Salaires : ${detail.salaires.toFixed(2)} €</li>
                <li>Indemnités journalières : ${detail.indemnites.toFixed(2)} €</li>
                <li>Chômage : ${detail.chomage.toFixed(2)} €</li>
                ${
                    Object.keys(detail.customColumns).length > 0
                        ? Object.entries(detail.customColumns)
                              .map(([col, val]) => `<li>${col} : ${val.toFixed(2)} €</li>`)
                              .join("")
                        : ""
                }
                <li><strong>Total mensuel :</strong> ${detail.moisTotal.toFixed(2)} €</li>
            </ul>`;
    });
    return html;
}