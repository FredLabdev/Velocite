/*--variables ciblant tous les éléments html realtifs au Diaporama dans le DOM--*/
var Diapos = $('.plan'); // récupère un Tableau des Diapos
var play = $('.play'); // récupère le bouton Play
var stop = $('.stop'); // récupère le bouton Stop
var prev = $('.prev'); // récupère la bouton Previous
var next = $('.next'); // récupère la bouton Next

/*--Variable Position "p" de chaque Diapo (qu'on permuttera) et affectation d'un index de position (tel que défini dans le css)--*/
var p0 = 0; // 1ère Diapo au centre
var p1 = 1; // 2nde Diapo à droite +1
var p2 = 2; // 3ème Diapo à droite +2
var p3 = 3; // 4ème Diapo à droite +3
var p4 = 4; // 5ème Diapo à gauche -1
var p5 = 5; // 6ème Diapo à gauche -2
var p6 = 6; // 7ème Diapo à gauche -3


/*--Objet Diapo--*/

var Diaporama = {

    compteur: 0, // propriété Compteur de passes

    /*--Méthode d'Initialisation--*/
    init: function () {
        Diaporama.addClass(); // Appelle la méthode d'attribution des classes css de départ (pour afficher une 1ère fois les diapos dans l'ordre initial)
        Diaporama.diapoStartAndStop(); // Appelle la méthode de fonctionnement commandes du diaporama --*/
        Diaporama.autoDeclic(); // Appelle la méthode de lecture automatique 1 seule fois au départ
        /*-- Les évènements qui déclencheront des méthodes (--> méthodes appelées définies plus bas, hors méthode Init) --*/
        /*--     Evènements sur les boutons << et >>--*/
        prev.click(function () {
            Diaporama.prevDiaporama(); // Appelle la méthode de Passage au Diapo précédent
        });
        next.click(function () {
            Diaporama.nextDiaporama(); // Appelle la méthode de Passage au Diapo suivant
        });
        Diaporama.controleClavier(); // Appelle la méthode de contrôle (avance/retour) avec clavier ordi (évènement keypress)
    },

    /*--Méthode de Contrôles Play et Stop et d'incrémentation du numéro de diapo--*/
    diapoStartAndStop: function () {
        play.click(function () { // on lui ajoute un évènement click
            document.getElementById('stopButton').style.display = "block"; // Affiche le bouton Stop
            document.getElementById('playButton').style.display = "none"; // Cache le bouton Play
            document.getElementById('prevButton').style.display = "none"; // Cache le bouton Prev
            document.getElementById('nextButton').style.display = "none"; // Cache le bouton Next
            var timer = setInterval(function () {
                Diaporama.resetClass(); // Appelle la méthode de suppression des classes css attribuées au tour d'avant
                Diaporama.indexPlus(); // Appelle la méthode de réaffectation des index de positions des Diapos en fonction du compteur
                Diaporama.addClass(); // Appelle la méthode d'attribution des nouvelles classes css
            }, 5000); // toutes les 5 secondes
            stop.click(function () { // on lui ajoute un évènement click
                clearInterval(timer); // on le fait réagir au click, en stoppant le défilement de timer
                document.getElementById('stopButton').style.display = "none"; // Cache le bouton Stop
                document.getElementById('playButton').style.display = "block"; // Affiche le bouton Play
                document.getElementById('prevButton').style.display = "block"; // Affiche le bouton Prev
                document.getElementById('nextButton').style.display = "block"; // Affiche le bouton Next
            });
        });
    },

    /*--Méthode de Passage << à la Diapo Précédente --*/
    prevDiaporama: function () {
        Diaporama.resetClass(); // Appelle la méthode de suppression des classes css attribuées au tour d'avant
        Diaporama.indexMoins(); // Appelle la méthode de réaffectation << des index de positions des Diapos en fonction du compteur
        Diaporama.addClass(); // Appelle la méthode d'attribution des nouvelles classes css
    },

    /*--Méthode de Passage >> à la Diapo Précédente --*/
    nextDiaporama: function () {
        Diaporama.resetClass(); // Appelle la méthode de suppression des classes css attribuées au tour d'avant
        Diaporama.indexPlus(); // Appelle la méthode de réaffectation des index >> de positions des Diapos en fonction du compteur
        Diaporama.addClass(); // Appelle la méthode d'attribution des nouvelles classes css
    },

    /*--Méthode de suppression des classes css 'p'--*/
    resetClass: function () {
        for (var j = 0, c = Diapos.length; j < c; j++) {
            $('.p' + j).removeClass('p' + j); // Boucle retirant toutes les classes css '.p0' jusqu'à 'p6' aux Diapos
        }
    },

    /*--Méthode de réaffectation des index >> de positions des Diapos en fonction du compteur--*/
    indexPlus: function () {
        if (Diaporama.compteur >= Diapos.length) {
            Diaporama.compteur = 0;
            [p0, p1, p2, p3, p4, p5, p6] = [p0, p1, p2, p3, p4, p5, p6]; // Rien ne change
        } else if (Diaporama.compteur = 0) {
            [p0, p1, p2, p3, p4, p5, p6] = [p0, p1, p2, p3, p4, p5, p6]; // Rien ne change

        } else if (Diaporama.compteur = 1) { // Décale l'ordre des positions dans le tableau des positions  
            [p0, p1, p2, p3, p4, p5, p6] = [p6, p0, p1, p2, p3, p4, p5]; // de 1 cran vers la gauche

        } else if (Diaporama.compteur = 2) {
            [p0, p1, p2, p3, p4, p5, p6] = [p5, p6, p0, p1, p2, p3, p4]; // de 2 crans vers la gauche

        } else if (Diaporama.compteur = 3) {
            [p0, p1, p2, p3, p4, p5, p6] = [p4, p5, p6, p0, p1, p2, p3]; // de 3 crans vers la gauche

        } else if (Diaporama.compteur = 4) {
            [p0, p1, p2, p3, p4, p5, p6] = [p3, p4, p5, p6, p0, p1, p2]; // de 4 crans vers la gauche

        } else if (Diaporama.compteur = 5) {
            [p0, p1, p2, p3, p4, p5, p6] = [p2, p3, p4, p5, p6, p0, p1]; // de 5 crans vers la gauche

        } else {
            [p0, p1, p2, p3, p4, p5, p6] = [p1, p2, p3, p4, p5, p6, p0]; // de 6 crans vers la gauche
        }
    },

    /*--Méthode de réaffectation des index << de positions des Diapos en fonction du compteur--*/
    indexMoins: function () {
        if (Diaporama.compteur >= Diapos.length) {
            Diaporama.compteur = 0;
            [p0, p1, p2, p3, p4, p5, p6] = [p0, p1, p2, p3, p4, p5, p6]; // Rien ne change
        } else if (Diaporama.compteur = 0) {
            [p0, p1, p2, p3, p4, p5, p6] = [p0, p1, p2, p3, p4, p5, p6]; // Rien ne change

        } else if (Diaporama.compteur = 1) { // Décale l'ordre des positions dans le tableau des positions  
            [p0, p1, p2, p3, p4, p5, p6] = [p1, p2, p3, p4, p5, p6, p0]; // de 1 cran vers la droite

        } else if (Diaporama.compteur = 2) {
            [p0, p1, p2, p3, p4, p5, p6] = [p2, p3, p4, p5, p6, p0, p1]; // de 2 crans vers la droite

        } else if (Diaporama.compteur = 3) {
            [p0, p1, p2, p3, p4, p5, p6] = [p3, p4, p5, p6, p0, p1, p2]; // de 3 crans vers la droite

        } else if (Diaporama.compteur = 4) {
            [p0, p1, p2, p3, p4, p5, p6] = [p4, p5, p6, p0, p1, p2, p3]; // de 4 crans vers la droite

        } else if (Diaporama.compteur = 5) {
            [p0, p1, p2, p3, p4, p5, p6] = [p5, p6, p0, p1, p2, p3, p4]; // de 5 crans vers la droite

        } else {
            [p0, p1, p2, p3, p4, p5, p6] = [p6, p0, p1, p2, p3, p4, p5]; // de 6 crans vers la droite
        }
    },

    /*--Méthode de réattribution des classes css 'p' aux Diapos--*/
    addClass: function () {
        Diapos.eq(0).toggleClass('p' + p0); // On attribue leurs positions en classe css à chaque Diapo
        Diapos.eq(1).toggleClass('p' + p1);
        Diapos.eq(2).toggleClass('p' + p2);
        Diapos.eq(3).toggleClass('p' + p3);
        Diapos.eq(4).toggleClass('p' + p4);
        Diapos.eq(5).toggleClass('p' + p5);
        Diapos.eq(6).toggleClass('p' + p6);
    },

    /*--Méthode appuyant automatiquement sur Play au chargement page--*/
    autoDeclic: function () {
        play.trigger('click'); // execute tous les évènements click liés au bouton play (soit la méthode diapoCommandes)
    },

    /*-- Méthode de commandes avec les touches du clavier --*/
    controleClavier: function () {
        $('body').keydown(function (e) { // Evènement touche clavier enfoncée (sur 'body') avec élément d'origine en référence 
            if (e.which === 39) { // si l'élément d'origine est (which= propriété retournant le keyCode) la touche clavier >
                Diaporama.nextDiaporama(); // Appelle la méthode de Passage au Diapo suivant
            } else if (e.which === 37) { // si l'élément d'origine est (which= propriété retournant le keyCode) la touche clavier <
                Diaporama.prevDiaporama(); // Appelle la méthode de Passage au Diapo précédent
            }
        })
    },

    /*--Fin Méthodes--*/

}

/*--Fin objet Diaporama--*/

$(function () {
    Diaporama.init(); // fonction appellant la méthode d'initialisation du Diaporama
});
