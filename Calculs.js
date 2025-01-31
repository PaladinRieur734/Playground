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

        // Colonnes personnalisées (ajout de la vérification pour afficher uniquement si des montants sont saisis)
        customColumns.forEach((col, index) => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `${role.toLowerCase()}_custom${index}M${4 - i}`;
            input.placeholder = "€";
            input.min = 0;
            input.oninput = () => hideEmptyCustomColumns(); // Appel de la fonction pour masquer/afficher dynamiquement
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

// Fonction pour cacher/afficher dynamiquement les colonnes personnalisées
function hideEmptyCustomColumns() {
    const tables = document.querySelectorAll("table");
    tables.forEach(table => {
        const rows = table.querySelectorAll("tr");
        rows.forEach(row => {
            const customCells = row.querySelectorAll("td input[type='number']");
            customCells.forEach((input, index) => {
                const th = table.querySelector(`th:nth-child(${index + 6})`);  // La 6e colonne correspond aux colonnes personnalisées
                if (input.value.trim() === "") {
                    th.style.display = "none";
                    row.cells[index + 5].style.display = "none";  // Masquer la cellule correspondante
                } else {
                    th.style.display = "";
                    row.cells[index + 5].style.display = "";  // Afficher la cellule correspondante
                }
            });
        });
    });
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
    const ressources = calculateRessources("Demandeur", dateEffet);

    // Calcul des droits
    const droits = plafondTrimestriel - ressources.total;

    // Affichage du résultat
    document.getElementById("resultat").textContent = `Droits ASI disponibles : ${droits.toFixed(2)} €`;
}

// Événements de génération du tableau et de calcul des droits
document.getElementById("genererTableauButton").addEventListener("click", genererTableauRessources);
document.getElementById("calculerASIButton").addEventListener("click", calculerASI);

// Fonctions supplémentaires pour l'actualisation dynamique des colonnes

// Fonction pour ajouter une nouvelle ligne de ressources (en fonction du statut)
function ajouterLigneRessources(role) {
    const table = document.getElementById(`${role.toLowerCase()}Table`);
    const newRow = table.insertRow(-1); // Ajoute une ligne à la fin du tableau

    const moisCell = newRow.insertCell(0);
    const moisInput = document.createElement("input");
    moisInput.type = "text";
    moisInput.placeholder = "Mois";
    moisCell.appendChild(moisInput);

    ["invalidite", "salaires", "indemnites", "chomage"].forEach((type, index) => {
        const cell = newRow.insertCell(index + 1);
        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = "€";
        cell.appendChild(input);
    });

    // Colonnes personnalisées (vérification si des montants sont saisis pour la visibilité)
    customColumns.forEach((col, index) => {
        const cell = newRow.insertCell(index + 5); // Commence après les 4 premières colonnes
        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = "€";
        input.oninput = () => hideEmptyCustomColumns(); // Appel pour la visibilité dynamique
        cell.appendChild(input);
    });

    hideEmptyCustomColumns(); // Met à jour la visibilité des colonnes après ajout de ligne
}

// Fonction pour supprimer une ligne de ressources
function supprimerLigneRessources(role, rowIndex) {
    const table = document.getElementById(`${role.toLowerCase()}Table`);
    if (table.rows.length > 1) {
        table.deleteRow(rowIndex); // Supprime la ligne à l'index spécifié
        hideEmptyCustomColumns(); // Met à jour la visibilité après suppression
    }
}

// Ajout d'un bouton pour ajouter des lignes dans le tableau de ressources
document.getElementById("ajouterLigneButton").addEventListener("click", () => {
    const statut = document.getElementById("statut").value;
    ajouterLigneRessources(statut === "couple" ? "Conjoint" : "Demandeur");
});

// Suppression de ligne (en passant l'index à supprimer, fonction à appeler à partir d'un bouton)
document.getElementById("supprimerLigneButton").addEventListener("click", () => {
    const statut = document.getElementById("statut").value;
    const table = document.getElementById(`${statut === "couple" ? "Conjoint" : "Demandeur"}Table`);
    const selectedRow = table.querySelector(".selected");
    if (selectedRow) {
        const rowIndex = selectedRow.rowIndex;
        supprimerLigneRessources(statut === "couple" ? "Conjoint" : "Demandeur", rowIndex);
    }
});

// Marquer une ligne comme sélectionnée (pour la suppression)
document.addEventListener("click", function (e) {
    if (e.target.tagName === "TR" && e.target.parentElement.tagName === "TABLE") {
        const rows = e.target.parentElement.rows;
        for (let row of rows) {
            row.classList.remove("selected");
        }
        e.target.classList.add("selected");
    }
});

// Fonction d'initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
    const statut = document.getElementById("statut").value;
    if (statut === "couple") {
        genererTableauRessources(); // Génère les ressources pour un couple si nécessaire
    }
});
// Fonction pour cacher les colonnes personnalisées si elles ne contiennent pas de montant
function hideEmptyCustomColumns() {
    const tables = document.querySelectorAll('.table-container table');
    
    tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            customColumns.forEach((col, index) => {
                const customCell = cells[index + 5]; // Les colonnes personnalisées commencent après les 4 premières colonnes
                const input = customCell ? customCell.querySelector('input') : null;

                if (input) {
                    if (input.value === "" || input.value === "0") {
                        customCell.style.display = "none"; // Masque la cellule si aucun montant n'est saisi
                    } else {
                        customCell.style.display = "table-cell"; // Affiche la cellule si un montant est saisi
                    }
                }
            });
        });
    });
}

// Mise à jour des noms de colonnes personnalisées en temps réel
function updateCustomColumnNames(input, index) {
    customColumns[index] = input.value;
    hideEmptyCustomColumns(); // Met à jour l'affichage des colonnes en fonction des nouvelles valeurs
}

// Fonction de génération des résultats pour l'affichage dynamique
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
        result.innerHTML += `<p>Le total des ressources au cours du trimestre de référence, soit ${ressourcesApresAbattement.toFixed(2)} € étant supérieures au plafond trimestriel de ${plafondTrimestriel.toFixed(2)} €, l’allocation supplémentaire d’invalidité ne pouvait pas être attribuée à effet du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    } else {
        const montantASI = plafondTrimestriel - ressourcesApresAbattement;
        const montantMensuelASI = montantASI / 3;
        result.innerHTML += `<p>Le montant trimestriel de l’allocation supplémentaire à servir était donc de ${montantASI.toFixed(2)} € (${plafondTrimestriel.toFixed(2)} € [plafond] – ${ressourcesApresAbattement.toFixed(2)} € [ressources]). Seuls des arrérages d’un montant mensuel de ${montantMensuelASI.toFixed(2)} € étaient dus à compter du ${dateEffet.toLocaleDateString("fr-FR")}.</p>`;
    }
}

// Fonction pour générer les détails mensuels pour chaque rôle (demandeur ou conjoint)
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

// Fonction d'initialisation pour afficher les colonnes personnalisées
document.addEventListener("DOMContentLoaded", () => {
    hideEmptyCustomColumns(); // Cache les colonnes personnalisées au départ si elles sont vides
});
