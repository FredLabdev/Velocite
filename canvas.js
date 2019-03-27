/*--variables ciblant tous les éléments html realtifs au Canvas dans le DOM--*/
var signatureElt = document.getElementById('signature'); // Message de Signature obligatoire
var canvasElt = document.getElementById('signature_canvas'); // toile du Canvas
var validerElt = document.getElementById('valider'); // Bouton Valider sous Canvas
var effacerElt = document.getElementById('effacer'); // Bouton Effacer sous Canvas

/*--Objet Canvas--*/

var Canvas = {

    /*--Ses propriétés--*/

    mouseX: 0, // Propriété indiquant la position de la souris sur l'axe des X
    mouseY: 0, // Propriété indiquant la position de la souris sur l'axe des Y
    mouseDown: 0, // Propriété repérant sur la souris un click sur le bouton gauche
    touchX: 0, // Propriété indiquant la position du touché en mode tactile sur l'axe des X
    touchY: 0, // Propriété indiquant la position du touché en mode tactile sur l'axe des Y
    lastX: -1, // Propriété indiquant la dernière position du marqueur sur un tracé, sur l'axe des X (-1 au départ = hors du canvas = pas de tracé en cours)
    lastY: -1, // idem sur l'axe des Y

    /*--Ses Méthodes--*/

    /*--Méthode d'Initialisation--*/
    init: function () {
        ctx = canvasElt.getContext('2d'); // Contexte défini en 2D
        /*-- La configuration initiale des élèments html realtifs au Canvas dans le DOM--*/
        signatureElt.style.display = "block"; // Ouvre le Message de Signature obligatoire
        canvasElt.style.display = "block"; // Ouvre le canvas
        validerElt.style.display = "none"; // Le Bouton Valider est d'abord caché, avant début d'un tracé
        effacerElt.style.display = "none"; // Le Bouton Effacer idem
        /*-- Les évènements associés (--> qui appèleront les autres méthodes définies aprés méthode Init) --*/
        /*--     Evènements sur le canvas avec la souris --*/
        canvasElt.addEventListener('mousedown', Canvas.sketchpad_mouseDown); // L'enfoncement du bouton gauche (--> méthode sketchpad_mouseDown)
        canvasElt.addEventListener('mousemove', Canvas.sketchpad_mouseMove); // Le déplacement (--> méthode sketchpad_mouseMove)
        window.addEventListener('mouseup', Canvas.sketchpad_mouseUp); // Le relâchement du bouton gauche même hors du canvas (--> méthode sketchpad_mouseUp)
        /*--     Evènements sur le canvas en mode tactile --*/
        canvasElt.addEventListener('touchstart', Canvas.sketchpad_touchStart); // Le début du touché écran (--> méthode sketchpad_touchStart)
        canvasElt.addEventListener('touchend', Canvas.sketchpad_touchEnd); // L'arrêt du touché écran (--> méthode sketchpad_touchEnd)
        canvasElt.addEventListener('touchmove', Canvas.sketchpad_touchMove); // Le déplacement en contact maintenu (--> méthode sketchpad_touchMove)
        /*--     Evènement sur la Map après inititalisation du canvas--*/
        document.getElementById('mapid').addEventListener('click', Canvas.close); // un click sur Map (--> méthode close)
        /*--     Evènement au click sur bouton "Valider" --*/
        validerElt.addEventListener("click", function () { // converti le contenu du canvas en données texte URL (qu'on pourra rappeler via "src=")
            localStorage.setItem("signature", canvasElt.toDataURL()); // et le stocke en local 
            Canvas.close(); // Ferme le canvas (--> méthode close)
            if (!(sessionStorage.getItem("minutes"))) { // vérifie si une réservation existe déjà sur l'Objet Compteur
                Compteur.lancerReservation(); // Appel de la méthode de lancement d'une réservation sur l'Objet Compteur)
            } else { // sinon   
                Compteur.resetReservation(); // Appel de la méthode de suppression d'une réservation si existante sur l'Objet Compteur
            };
        });
        /*--     Evènement au click sur bouton "Effacer" --*/
        effacerElt.addEventListener('click', function () { // déclenche la méthode clearRect en chaque point du Canvas (coordonnées point de départ X, Y,
            ctx.clearRect(0, 0, canvasElt.width, canvasElt.height); // étendues à l'ensemble des points via propriétés de width et height du Canvas),
            validerElt.style.display = "none"; // fait disparaître le Bouton "Valider" comme avant début tracé
            this.style.display = "none"; // et disparaît lui-même
        });
    },

    /*--Méthode de Fermeture (appelée ci-dessus par évènement click sur "Valider" ou sur Map pendant signature)--*/
    close: function () {
        ctx.clearRect(0, 0, canvasElt.width, canvasElt.height); // déclenche la méthode d'éffacement clearRect détaillée ci-dessus
        signatureElt.style.display = "none"; // cache le message de signature obligatoire
        validerElt.style.display = "none"; // cache le boutons Valider
        effacerElt.style.display = "none"; // cache le boutons Effacer
        canvasElt.style.display = "none"; // cache la toile canvas
    },

    /*--Méthode de Dessin (principe: Déterminer que chaque position précédente = position actuelle, les relier, les marquer = suite de point = ligne--*/
    drawLine: function (ctx, x, y, size) { // (contexte du canevas, la position x d'un point, sa position y, sa taille)
        /*--Marquage du point de départ--*/
        if (Canvas.lastX == -1) { // Si dernière position du marqueur d'un tracé, sur l'axe des X vaut -1 = hors du canvas = pas de tracé en cours
            Canvas.lastX = x; // alors on détermine sur l'axe des X un 1er point précedent équivalent à la position du pointeur actuel 
            Canvas.lastY = y; // idem sur l'axe des Y
        }
        ctx.strokeStyle = "#212529"; // Couleur du remplissage
        ctx.lineCap = "round"; // Fin de ligne ronde (carrée par défaut)
        ctx.beginPath(); // Méthode d'initialisation d'un tracé
        ctx.moveTo(Canvas.lastX, Canvas.lastY); // Méthode déterminant l'origine du tracé (<< à la dernière position perçue, passée ci-dessus au point de départ)
        ctx.lineTo(x, y); // Méthode de suivi de tracé via une ligne reliant chaque position successive du pointeur
        ctx.lineWidth = size; // Epaisseur de la ligne
        ctx.stroke(); // Méthode faisant apparaître le contour du parcours tracé
        ctx.closePath(); // Méthode fermant le tracé en ramenant au point de départ
        Canvas.lastX = x; // on indique, sur l'axe des X, que le point précédent est = au point actuel (ce qui les relie et donc marque chaque nouveau point)
        Canvas.lastY = y; // idem sur l'axe des Y
        validerElt.style.display = "block"; // On fait apparaître le bouton Valider dés le 1er point
        effacerElt.style.display = "block"; // idem pour le bouton Effacer
    },

    /*--Méthode à l'enfoncement du bouton gauche souris (appelée par Init)--*/
    sketchpad_mouseDown: function () {
        Canvas.mouseDown = 1; // 1 vaut bouton gauche souris enfoncé (0 pour false)
        Canvas.drawLine(ctx, Canvas.mouseX, Canvas.mouseY, 4); // appelle la méthode drawLine ci-dessus pour dessiner un point (ligne avec mouseMove plus bas...) 
    },

    /*--Méthode au relâchement du bouton gauche souris (appelée par Init)--*/
    sketchpad_mouseUp: function () {
        Canvas.mouseDown = 0; // Réinitialise le bouton gauche en indiquant qu'il n'est plus enfoncé
        Canvas.lastX = -1; // Réinitialise, sur l'axe des X, le point précédent pour indiquer (fictif) qu'il était en dehors du canvas = plus de dessin possible
        Canvas.lastY = -1; // idem sur l'axe des Y
    },

    /*--Méthode au mouvement de la souris (appelée par Init) --*/
    sketchpad_mouseMove: function (e) {
        Canvas.getMousePos(e); // --> Appelle la méthode getMousePose qui suis la souris et relève chaque coordonnées
        if (Canvas.mouseDown == 1) { // Repère si le bouton gauche de la souris est enfoncé (soit après que méthode sketchpad_mouseDown ait été activée)
            Canvas.drawLine(ctx, Canvas.mouseX, Canvas.mouseY, 4); // appelle la méthode drawLine ci-dessus pour en marquer chaque point
        }
    },

    /*--Méthode de récupération des coordonnées de la souris (appelée par sketchpad_mouseMove)--*/
    getMousePos: function (e) { // L'argument (e) indique que cette cette méthode n'est valable que consécutivement à un évènement

        if (e.offsetX) { // si cet évènement fait référence à un élément cible (canvas), qui possède un point initial (angle supèrieur gauche) 
            Canvas.mouseX = e.offsetX; // on indique que la position de la souris, sur l'axe des X, est déterminée par rapport à ce point
            Canvas.mouseY = e.offsetY; // idem sur l'axe des Y
        } else if (e.layerX) { // si pas de zone cible (souris hors canvas), on cherche le point de référence de la zone cible la plus proche
            Canvas.mouseX = e.layerX; // et on indique que la position de la souris, sur l'axe des X, est déterminée par rapport à ce point
            Canvas.mouseY = e.layerY; // idem sur l'axe des Y
        }
    },

    /*--Méthode au début d'un touché écran (appelée par Init)--*/
    sketchpad_touchStart: function (e) { // L'argument (e) indique que cette méthode n'est valable que consécutivement à un évènement
        Canvas.getTouchPos(); // --> Appelle la méthode getTouchPos qui suit le touché et relève chaque coordonnées
        Canvas.drawLine(ctx, Canvas.touchX, Canvas.touchY, 4); // appelle la méthode drawLine ci-dessus pour en marquer chaque point 
        event.preventDefault(); // Empêche, au sein de cet évènement seul et donc du canvas, le défilement naturel de l'écran au touché
    },

    /*--Méthode à la fin d'un touché écran (appelée par Init)--*/
    sketchpad_touchEnd: function () { // L'argument (e) indique que cette méthode n'est valable que consécutivement à un évènement
        Canvas.lastX = -1; // Réinitialise, sur l'axe des X, le point précédent pour indiquer (fictif) qu'il était en dehors du canvas = plus de dessin possible
        Canvas.lastY = -1; // idem sur l'axe des Y
    },

    /*--Méthode au mouvement en touché écran (appelée par Init)--*/
    sketchpad_touchMove: function (e) { // L'argument (e) indique que cette méthode n'est valable que consécutivement à un évènement
        Canvas.getTouchPos(e); // --> Appelle la méthode getTouchPos qui suit le touché et relève chaque coordonnées
        /*--Ici lors d'un déplacement au touché, pas de MousDown à vérifier (actif avec l'écran par défaut)--*/
        Canvas.drawLine(ctx, Canvas.touchX, Canvas.touchY, 4); // appelle la méthode drawLine ci-dessus pour en marquer chaque point
        event.preventDefault(); // Empêche, au sein de cet évènement seul et donc du canvas, le défilement naturel de l'écran au touché
    },

    /*--Méthode de récupération des coordonnées du touché (appelée par sketchpad_touchMove)--*/
    getTouchPos: function (e) { // L'argument (e) indique que cette méthode n'est valable que consécutivement à un évènement

        if (e.touches.length == 1) { // pour un seul touché (inactif si plusieurs doigt simultannés) sur l'évènement (canvas)
            var touch = e.touches[0]; // le touché repéré est le 1er du tableau
            Canvas.touchX = touch.pageX - touch.target.offsetLeft; // les coordonnées du touché sont celles relatives à la page, diminuées...
            Canvas.touchY = touch.pageY - touch.target.offsetTop; // ... de celles du coin supérieur gauche de la cible (idem offsetX et Y de la cible e)

        }
    },

    /*--Fin Méthodes--*/
}

/*--Fin objet Canvas--*/
