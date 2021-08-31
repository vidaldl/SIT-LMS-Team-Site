/**********************************************
 * MAIN.JS | Quality Assurance Javascript File
 *
 *********************************************/
'use strict';

$('.alert').hide();
// Initialize Firebase
var config = {
    apiKey: "AIzaSyA_I75-CU5_GlNP1QSKvvH8nbYVkaAUgNA",
    authDomain: "techopsportal.firebaseapp.com",
    databaseURL: "https://techopsportal.firebaseio.com",
    projectId: "techopsportal",
    storageBucket: "techopsportal.appspot.com",
    messagingSenderId: "265124430634"
};
firebase.initializeApp(config);
// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();
db.settings({
    timestampsInSnapshots: true
});

var userName;
var userId;
var data;
var preferance = "light";
let root = document.documentElement;
var slideIndex = 0;
var slides = document.getElementsByClassName("mySlides");
var timeOutHandler;
var auth = firebase.auth();
var user = firebase.auth().currentUser;

auth.onAuthStateChanged((firebaseUser) => {
    //checks if the user is already logged in to the system
    if (firebaseUser) {

        userName = firebaseUser.displayName;
        changeTheme();
        getData();

        if (window.location.href.includes("index.html") || window.location.href.includes("signup.html") || window.location.pathname == "/") {
        // window.location.replace("home.html");
        }
    } else {
        userName = null;
        if (!window.location.href.includes("index.html") && !window.location.href.includes("signup.html") && !window.location.href.includes("store.html")) {
        window.location.replace('index.html');
        }
    }
    if (window.location.href.includes("home.html")) {
        loadTimer();
        startTime();
        plusSlides(1);
    } else{
        loadPage();
    }
});


//handles the sign out button
document.getElementById("signOut").addEventListener("click", () => {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
    });
})


function getData() {
    db.collection("cms").doc("home").onSnapshot((querrySnapshot) => {
        var pageTitle = querrySnapshot.data().pageTitle;
        $('#pageTitleDB').html(pageTitle);
    });

    db.collection("users").where("name", "==", userName)
        .onSnapshot((querySnapshot) => {
            data = querySnapshot.docs[0].data();
            userId = querySnapshot.docs[0].id;
            preferance = data.viewMode;
            if(data.info.photo === "default-image.png" || data.info.photo.includes('.jpg') || data.info.photo === "") {

            } else {
                document.querySelector('#profilePic').src = data.info.photo;
            }

        })
    setTimeout(function() {
        $('#overlay').fadeOut("slow");
    }, 1000);

}

function editDate(date) {
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var year = date.getFullYear();
    var hour = ("0" + date.getHours()).slice(-2);
    var minute = ("0" + date.getMinutes()).slice(-2);
    var setDate = `${year}-${month}-${day} ${hour}:${minute}`;
    return setDate;
}

function searchArray(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].name == item) {
            return i;
        }
    }
    return false;
}


/*******************************************************
 * This section is for the slideshow on the home page
 *******************************************************/
var slidesIndex = 0;        // Index of which slide is currently active
var myTimer;                // Automatic timer for the slideshow
const slideTimer = 8000;    // Each slide appears for 8 seconds.

function plusSlides(n = 1) {
    clearTimeout(myTimer);
    changeSlide(slidesIndex += n);
    myTimer = setTimeout(plusSlides, slideTimer);
}
function currentSlide(n) {
    changeSlide(slidesIndex = n);
}

function changeSlide(n) {
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");

    if (n > slides.length) {
        slidesIndex = 1;
    }
    if (n < 1) {
        slidesIndex = slides.length;
    }

    for (var i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    for (var i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slides[slidesIndex - 1].style.display = "block";
    dots[slidesIndex - 1].className += " active";
}


/********************************************************************
 *  This Section is for the theme changer. Instead of have multiple css files
 * and switch the files (which is complicated and just why) we are using CSS
 * variables and JS functions to change it.
 *
 *********************************************************************/

// const navbarImage = document.getElementById("nav-img");

// This const sets a var for all the buttons to change themes
const dataThemeButtons = document.querySelectorAll('[data-theme]');
for (let i = 0; i < dataThemeButtons.length; i++) {
    dataThemeButtons[i].addEventListener('click', () => {
        changeTheme(i);
    })
}

// This is the main function for theme swapping
// If you want to add a new theme(s) just copy one of the switches
// and else if statements and edit away. Then you will need to add a new
// button somewhere. There is NO NEED to copy and paste new css files.
// Please and thank you
function changeTheme(preferance) {
    if (preferance == 0) {
        preferance = "light";
        changeViewMode(preferance);
    } else if (preferance == 1) {
        preferance = "dark-blue";
        changeViewMode(preferance);
    } else if (preferance == 2) {
        preferance = "dark";
        changeViewMode(preferance);
    }

    db.collection("users").where("name", "==", userName)
        .onSnapshot((querySnapshot) => {
            preferance = querySnapshot.docs[0].data().viewMode;
            switch (preferance) {
                case 'light':
                    setTheme({
                        'first': '#0076c6',
                        'second': '#6c757d',
                        'third': '#343a40',
                        'background': '#ffffff',
                        'backgroundSecondary': '#ffffff',
                        'backgroundGrade': 'none',
                        'shadow': 'var(--gray)',
                        'fontPrime': '#000000'
                    });
                    // navbarImage.src="";
                    break;
                case 'dark-blue':
                    setTheme({
                        'first': '#000121',
                        'second': '#000121',
                        'third': '#000121',
                        'background': '#087096',
                        'backgroundSecondary': '#087096',
                        'backgroundGrade': 'none',
                        'shadow': 'none',
                        'fontPrime': '#ffffff'
                    });
                    // navbarImage.src="";
                    break;
                case 'dark':
                    setTheme({
                        'first': '#343a40',
                        'second': '#06439F',
                        'third': '#06439F',
                        'background': '#1c1b1b',
                        'backgroundSecondary': '#777777',
                        'backgroundGrade': 'none',
                        'shadow': 'none',
                        'fontPrime': '#ffffff'
                    });
                    // navbarImage.src="";
                    break;
                case 'falllight':
                    setTheme({
                        'first': '#eb8a00',
                        'second': '#c79763',
                        'third': '#c79763',
                        'background': 'none',
                        'backgroundSecondary': '#ffffff',
                        'backgroundGrade': 'linear-gradient(0deg, rgba(241,90,41,1) 0%, rgba(241,90,41,1) 100%)',
                        'shadow': 'var(--gray-dark)',
                        'fontPrime': '#000000'
                    });
                    navbarImage.src="./assets/logos/leavesColored.png";
                    break;
                case 'falldark':
                    setTheme({
                        'first': '#f57600',
                        'second': '#890000',
                        'third': '#890000',
                        'background': '#1c1b1b',
                        'backgroundSecondary': '#777777',
                        'backgroundGrade': 'linear-gradient(180deg, rgba(245,118,0,1) 0%, rgba(137,0,0,1) 100%)',
                        'shadow': 'none',
                        'fontPrime': '#ffffff'
                    });
                    navbarImage.src="./assets/logos/turkeys.png";
                    break;
                case 'christmaslight':
                    setTheme({
                        'first': '#054d00',
                        'second': '#054d00',
                        'third': '#054d00',
                        'background': '#eeffed',
                        'backgroundSecondary': '#eeffed',
                        'backgroundGrade': 'linear-gradient(0deg, rgba(133,0,0,1) 0%, rgba(191,0,0,1) 100%)',
                        'shadow': 'none',
                        'fontPrime': '#000000'
                    });
                    navbarImage.src="./assets/logos/treelight.png";
                    break;
                case 'christmasdark':
                    setTheme({
                        'first': '#9c0000',
                        'second': '#9c0000',
                        'third': '#9c0000',
                        'background': '#032e00',
                        'backgroundSecondary': '#032e00',
                        'backgroundGrade': 'linear-gradient(0deg, rgba(133,0,0,1) 0%, rgba(191,0,0,1) 100%)',
                        'shadow': 'none',
                        'fontPrime': '#ffffff'
                    });
                    navbarImage.src="./assets/logos/treedark.png";
                    break;
            }
        })

}

// This function draws from and saves to the database.
function changeViewMode(newTheme) {
    db.collection('users').doc(userId).update({
        viewMode: newTheme
        })
        .then(function () {})
        .catch(function (error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
        });

}


// setTheme and setValue are interconnected. setTheme goes through the JSON
// we created in the main function and passes each one to setValue. Then setValue
// will replace the CSS var with a new value. Pretty nifty and got help thanks to
// Ashley and the internet. AN AVACADO, THANKS!

function setTheme(options) {
    for (let option of Object.keys(options)) {
        const property = option;
        const value = options[option];

        setValue(property, value);
        localStorage.setItem(property, value);
    }
}

function setValue(property, value) {
    if (value) {
        document.documentElement.style.setProperty(`--${property}`, value);

        const input = document.querySelector(`#${property}`);
        if (input) {
            value = value.replace('px', '');
            input.value = value;
        }
    }
}

//CLOSE ALL MODALS

function closeAllModals() {

    // get modals
    const modals = document.getElementsByClassName('modal');

    // on every modal change state like in hidden modal
    for(let i=0; i<modals.length; i++) {
        modals[i].classList.remove('show');
        modals[i].setAttribute('aria-hidden', 'true');
        modals[i].setAttribute('style', 'display: none');
    }

    // get modal backdrops
    const modalsBackdrops = document.getElementsByClassName('modal-backdrop');

    // remove every modal backdrop
    for(let i=0; i<modalsBackdrops.length; i++) {
        document.body.removeChild(modalsBackdrops[i]);
    }
}


// Reminder
const notificationOnButton = document.getElementById('notificationOnButton');
const notificationOffButton = document.getElementById('notificationOffButton');

var notify = false;
// request permission on page load
document.addEventListener('DOMContentLoaded', function() {


    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== 'granted')
        Notification.requestPermission();
});


function notificationTimer(time) {
    setInterval(() => {

        if(time <= 8) {
            var notification = new Notification('Hourly Report Reminder', {
                icon: 'assets/misc/clockWhite.png',
                body: 'Hey there! Remember to fill up the Hourly Update form.',
                requireInteraction: true,
            });
            notification.onclick = function() {
                window.open('https://docs.google.com/forms/d/e/1FAIpQLSeeuUJwLyqxQokMFLHxgBAWCOOc_0485mTcoFk92LbMr-MkKA/viewform');
            };
            notification.onshow = function(){
                alert('Hey there! Remember to fill up the Hourly Update form.');
            };

            console.log(time);
            if (notify === true) {
                time++;
            } else {
                time = 15;
            }
        }

    // }, (60 * 60000));
    }, 10000);

}
function notifyMe(isTrue) {
    var time = 0;
    if (isTrue === true) {
        notify = true;
        notificationOnButton.classList.add('hide');
        notificationOffButton.classList.remove('hide');
        if (Notification.permission !== 'granted')
            Notification.requestPermission();
        else {
            notificationTimer(time);
        }
    } else {
        notify = false;
        notificationOffButton.classList.add('hide');
        notificationOnButton.classList.remove('hide');

    }


}


// NEW SLIDE SHOW CODE


// Update Alert
function updateAlert(message) {

    let alerta = $('.alert');
    alerta.html(message);
    alerta.fadeIn();
    setTimeout(function() {
        alerta.fadeOut();
    },1000)
}