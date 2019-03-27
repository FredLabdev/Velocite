//==========================================================
// Création map avec API OpenStreetMap
var mymap = L.map('mapid').setView([47.750839, 7.335888], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZnJlZGRpZTcyIiwiYSI6ImNqb2loMWpqOTAzZDIzcW11a3NqN3IwaGUifQ.8AoMkz8pyByMXtacnUMQwQ'
}).addTo(mymap);

//==========================================================
// Création des variables relatives aux markers
var marker;
var Markers = [];

//==========================================================
// Ciblage des variables relatives à la station dans le DOM
var stationSelect = document.getElementById('station_select');
var sonStatut = document.getElementById('son_statut');
var sonAdresse = document.getElementById('son_adresse');
var sesPlaceslibres = document.getElementById('ses_placeslibres');
var sesVelosdispo = document.getElementById('ses_velosdispo');
var reservation = document.getElementById('resa_form');
var confirmReservation = document.getElementById('confirm_resa');
var annulReservation = document.getElementById('annulation');

//==========================================================
// Ciblage des variables relatives au visiteur dans le DOM
var nomVisiteur = document.getElementById("nom");
var prenomVisiteur = document.getElementById("prenom");

//==========================================================
// Ouverture de la requête ajaxGet à l'API JC Decaux
ajaxGet("https://api.jcdecaux.com/vls/v1/stations?contract=Mulhouse&apiKey=cd158430950d0ae8a591c59bab7d1a1178be4187", function (reponse) {
    var Stations = JSON.parse(reponse); // Récupération d'un tableau des "Stations" avec transformation des données JSON reponse en objets JS

    //------------------------------------------------------------
    // Récuparation des données stations sur l'API JC Decaux
    Stations.forEach(function (station) { // Passage en revue sur l'API de chaque objet "station" du tableau "Stations"
        marker = L.marker(station.position).addTo(mymap); // Création d'un marqueur à partir de l'objet position regroupant les propriétés latitude et longitude et ajout du marker à la map
        marker.nom = station.name; // ajout des propriétés récupérées de l'API pour chaque objet marker
        marker.adresse = station.address;
        marker.statut = station.status;
        marker.velos = station.available_bikes;
        marker.places = station.available_bike_stands;
        Markers.push(marker); // ajout du nombre de places retour libres sur la station en item à chaque objet marker
    });

    //------------------------------------------------------------
    // Evènements au click sur chaque marker de station 
    Markers.forEach(function (marker) { // Passage en revue de chaque objet "marker" du tableau "Markers"
        marker.addEventListener('click', function () { // Création d'un évènement 'click' sur chaque marker
            sessionStorage.clear();
            var nomStation = document.createTextNode("Station n° " + this.nom); // on créer un noeud texte portant le nom de la sation

            if (this.statut === "OPEN") { // si le statut de la staion est OPEN:
                this.statut = "Ouverte"; // on change son libellé
                sonStatut.style.backgroundColor = "green"; // on modifie son style
                reservation.style.display = "block"; // on affche et donc autorise la réseravation
                if (sessionStorage.getItem("nomVisit")) { // si visiteur avait déjà réservé sur cette session ...
                    nomVisiteur.value = sessionStorage.getItem("nomVisit"); // on restaure ses coordonnées
                } else if (localStorage.getItem("nomVisit")) { // sinon si visiteur avait déjà réservé sur précédente session ...
                    nomVisiteur.value = localStorage.getItem("nomVisit"); // on restaure ses coordonnées
                }
                if (sessionStorage.getItem("prenomVisit")) { // idem prénom
                    prenomVisiteur.value = sessionStorage.getItem("prenomVisit");
                } else if (localStorage.getItem("prenomVisit")) {
                    prenomVisiteur.value = localStorage.getItem("prenomVisit");
                }
            } else if (this.statut === "CLOSED") { // sinon si le statut de la staion est CLOSED:
                this.statut = "Fermée"; // on change son libellé
                sonStatut.style.backgroundColor = "red"; // on modifie son style
            };
            var statutStation = document.createTextNode(this.statut); // on créer un noeud texte portant le statut de la sation
            var adresseStation = document.createTextNode("Adresse : " + this.adresse); // idem
            var placesLibres = document.createTextNode(this.places + " emplacement(s) libre(s)");
            var velosDispo = document.createTextNode(this.velos + " vélo(s) disponible(s)");
            stationSelect.replaceChild(nomStation, stationSelect.firstChild); // on inserre chacune de ces valeurs dans le DOM
            sonStatut.replaceChild(statutStation, sonStatut.firstChild);
            sonAdresse.replaceChild(adresseStation, sonAdresse.firstChild);
            sesPlaceslibres.replaceChild(placesLibres, sesPlaceslibres.firstChild);
            sesVelosdispo.replaceChild(velosDispo, sesVelosdispo.firstChild);
        }); // Fermeture de l'évènement au "click" sur marker
    }); // Fermeture de la boucle sur chaque marker

});
// Fin de la requête ajaxGet à l'API JC Decaux
//==========================================================

//==========================================================
// Evènement au click sur bouton "Réserver"
reservation.addEventListener("submit", function (e) { // on écoute si le bouton "Réserver" est cliqué
    e.preventDefault(); // si oui on empêche toute nouvelle soumission
    Canvas.init(); // fonction appellant la méthode d'initialisation du Canvas (voir fichier canvas.js)
});

/*--Objet Compteur--*/

var Compteur = {

    /*--Ses propriétés--*/

    minutes: 20, // Minutes du compte à rebours
    secondes: 00, // Secondes du compte à rebours
    minutesElt: null, // Élément minutes (celui qui sera inséré dans le HTML)
    secondesElt: null, // Éléments secondes (celui qui sera inséré dans le HTML)
    compteARebour: null, // Attribut du compte à rebours
    compteARebourTerminer: null, // Attribut du compte à rebours terminé
    annulationReservation: false, // Demande de confirmation d'annulation de la réservation

    /*--Ses Méthodes--*/

    // Méthode d'Initialisation
    init: function () {
        /*-- Les évènements associés (--> qui appèleront les autres méthodes définies aprés méthode Init) --*/
        // Evènement au click sur bouton "Annuler"
        annulReservation.addEventListener('click', Compteur.annulerReservation); // Appel de la méthode d'annulation d'une réservation décrite plus bas    
    },

    // Méthode de lancement d'une réservation
    lancerReservation: function () {
        localStorage.setItem("nomVisit", nomVisiteur.value); // on sauve les nouveaux contenus des champs dans l'objet Local Storage
        localStorage.setItem("prenomVisit", prenomVisiteur.value);
        sessionStorage.setItem("nomVisit", nomVisiteur.value); // on sauve les nouveaux contenus des champs dans l'objet Session Storage
        sessionStorage.setItem("prenomVisit", prenomVisiteur.value);
        sessionStorage.setItem("stationResa", stationSelect.firstChild.nodeValue);
        var dataNom = localStorage.getItem("nomVisit");
        var dataPrenom = localStorage.getItem("prenomVisit");
        var dataStation = sessionStorage.getItem("stationResa");
        reservation.style.display = "none"; // on recache le bloc de réservation
        this.compteARebour = setInterval("Compteur.initCompteur()",
            1000);

        // Affichage de la réservation  
        document.getElementById("avant_resa").style.display = "none"; // Cache le message d'avant réservation
        document.getElementById("compteur_resa").style.display = "block"; // Affiche le compteur
        confirmReservation.style.display = "block"; // on affiche le message de confirmation de réservation
        var confirmNom = document.getElementById('confirm-nom'); // Recup des variables de la station dans le DOM
        var confirmPrenom = document.getElementById('confirm-prenom');
        var confirmStation = document.getElementById('confirm-station');
        var confirmNomText = document.createTextNode(dataNom); // on créer un noeud texte portant le nom de la sation
        var confirmPrenomText = document.createTextNode(dataPrenom);
        var confirmStationText = document.createTextNode(dataStation);
        confirmNom.replaceChild(confirmNomText, confirmNom.firstChild); // on inserre chacune de ces valeurs dans le DOM
        confirmPrenom.replaceChild(confirmPrenomText, confirmPrenom.firstChild);
        confirmStation.replaceChild(confirmStationText, confirmStation.firstChild);
    },

    // Méthode ré-initialisation du compte à rebours
    initCompteur: function () {
        if (this.minutes < 10) { // Si il reste moins de 10 minutes
            this.minutesElt = "0" + this.minutes; // Ajoute un 0 devant les minutes
        } else { // Sinon les minutes s'affichent normalement
            this.minutesElt = this.minutes;
        }
        if (this.secondes < 10) { // Si il reste moins de 10 secondes
            this.secondesElt = "0" + this.secondes; // Ajoute un 0 devant les secondes
        } else { // Sinon les secondes s'affichent normalement
            this.secondesElt = this.secondes;
        }
        document.getElementById("compteur").innerHTML = "... " + this.minutesElt + " min " + this.secondesElt + " sec"; // Insertion du compte à rebours dans le HTML
        this.compteurStart(); // Lance le fonctionnement du compte à rebours
    },

    // Méthode de fonctionnement du compte à rebours
    compteurStart: function () {
        if ((this.minutes >= 0) && (this.secondes > 0)) { // S'il il reste plus de 0 seconde
            this.secondes--; // On diminue les secondes
            sessionStorage.setItem("secondes", this.secondes); // Modification de la session storage
        } else if ((this.minutes > 0) && (this.secondes <= 0)) { //Sinon si les minutes sont Supérieures à 0 et les secondes inférieures ou égale à 0
            this.secondes = 59; // On replace les secondes à 59
            this.minutes--; // On diminue les minutes
            sessionStorage.setItem("minutes", this.minutes); // Modification des session storage
            sessionStorage.setItem("secondes", this.secondes);
        } else if ((this.minutes == 0) && (this.secondes == 0)) { // Sinon si les minutes et les secondes sont égales à 0(compte à rebours terminer)
            document.getElementById("fin_resa").style.display = "block"; // Affichage du message de fin de location
            this.compteARebourTerminer = setTimeout("Compteur.reservationTerminer()", 4000); // Appel de la méthode "reservationTerminer"
        }
    },

    // Méthode appelée à la fin de la réservation
    reservationTerminer: function () {
        clearInterval(this.compteARebour); // Arrêt du compte à rebours
        this.minutes = 20; // Reset des attributs du compte à rebours
        this.secondes = 00;
        this.minutesElt = null;
        this.secondesElt = null;
        sessionStorage.clear(); // Suppression de la session storage
        clearTimeout(this.compteARebourTerminer); // Arrêt de l'appel à la méthode
        document.getElementById("avant_resa").style.display = "block"; // Remets en place l'affichage par défaut des blocs
        document.getElementById("fin_resa").style.display = "none";
        document.getElementById("compteur_resa").style.display = "none"; // Cache le message de compteur
        confirmReservation.style.display = "none"; // on affiche le message de confirmation de réservation
    },

    // Méthode d'annulation d'une réservation (appelée par click sur bouton annuler)
    annulerReservation: function () {
        document.getElementById("annul_resa").style.display = "block"; // Fait apparaître le message de confirmation de la suppression
        setTimeout(function () { // Le message disparaît après 3 secondes
            document.getElementById("annul_resa").style.display = "none";
        }, 3000);
        Compteur.reservationTerminer(); // Appele de la méthode de Fin de réservation
    },

    /*--Fin Méthodes--*/
}

/*--Fin Objet Compteur--*/

/*--Mise en fonction de l'objet Compteur--*/
$(document).ready(function () { // Uniquement lorsque le document apparait comme entièrement chargé (toutes balises html présentes)(évite défaut)
    Compteur.init(); // fonction appellant la méthode d'initialisation du Compteur
});
