const users = db.collection('users');


function loadPage() {
    users.where("name", "==", userName)
        .onSnapshot((querySnapshot) => {
            data = querySnapshot.docs[0].data();
            if (data.admin || data.lead) {
                populatePage();
            } else {
                window.location.replace("home.html");
            }
        })
}


function populatePage() {
    homePage = db.collection("cms").doc("home");

    getPageTitle(homePage);
    getSlideShow(homePage);

}

function getPageTitle(page) {

        page.onSnapshot((querrySnapshot) => {
            var pageTitle = querrySnapshot.data().pageTitle;
            $('#pageTitleDB').val(pageTitle);
        });


    // Update
    $('#updatePageTitle').click(function() {
        page.update({
            "pageTitle" : $('#pageTitleDB').val(),
        }).then(function() {
            updateAlert('Content Updated');
        }).catch((error) => {
            alert('Could not update for some reason');
            updateAlert('Could not update for some reason');
        });

    });
}

//SLIDE SHOW

function getSlideShow(page) {

    page.collection("banners").orderBy("order", "desc").get().then(function (querySnapshot) {
        var html2 = `<div class="owl-carousel owl-theme" id="homeSlideShow">`;
        querySnapshot.forEach((doc) => {
            let banner = doc.data();
            html2 += `<div class="item">
                        <img class="carousel-img" id="${doc.id}" src="${banner.image}">
                    </div>`;
        })

        html2 += `</div>`;
        console.log(html2);
        $(html2).appendTo('#slideShowDB');

        $('.owl-carousel').owlCarousel({
            loop:true,
            autoplay:true,
            autoplayHoverPause:true,
            nav:false,
            items: 1,
            singleItem:true,
            dots: true,
        });

    });

}


