// Fonction générique requête Ajax GET

function ajaxGet(url, callback) { // (cible, fonction appelée en cas de succés)
    var req = new XMLHttpRequest(); // Formatage requête avec Constructeur en requête HTTP & JS
    req.open("GET", url); // création de la requête en méthode GET 
    req.addEventListener("load", function () { // Fonction à appelée aprés chargement réussi requête 
        if (req.status >= 200 && req.status < 400) {
            callback(req.responseText); // Récupérer réponse si status requête ok 
        } else {
            console.error(req.status + " " + req.statusText + " " + url) // Récupérer message erreur sinon 
        }
    });
    req.addEventListener("error", function () { // Récupérer message erreur si requête non chargée 
        console.error("Erreur réseau avec l'url" + url);
    });
    req.send(null); // envoie requête (uniquement des données à recevoir en GET donc rien=null à envoyer)
}
