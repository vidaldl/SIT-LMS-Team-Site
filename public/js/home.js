let homePage = db.collection("cms").doc("home");

getPageTitle(homePage);
getSlideShow(homePage);
getLinks(homePage);

function getPageTitle(page) {

    page.onSnapshot((querrySnapshot) => {
        var pageTitle = querrySnapshot.data().pageTitle;
        $('#pageTitleDB').val(pageTitle);
    });
}

function getSlideShow(page) {

    page.collection("banners").orderBy("order", "asc").get().then(function (querySnapshot) {
        var slideShow = `<div class="owl-carousel owl-theme" id="homeSlideShow">`;


        // Get Images from DB | Initialize Elements for update
        querySnapshot.forEach((doc) => {
            //Banner Elements
            let banner = doc.data();
            slideShow += `<div class="item">
                            <img class="carousel-img" id="${doc.id}" src="${banner.image}">
                        </div>`;

        })

        slideShow += `</div>`;
        console.log();

        //Append the elements from DB to DOM
        $(slideShow).appendTo('#slideShowDB');

        if(querySnapshot.size > 1) {
            $('.owl-carousel').owlCarousel({
                loop:true,
                autoplay:true,
                autoplayHoverPause:true,
                nav:false,
                items: 1,
                singleItem:true,
                dots: true,
            });
        } else {
            $('.owl-carousel').owlCarousel({
                loop:false,
                autoplay:false,
                mouseDrag:false,
                nav:false,
                items: 1,
                singleItem:true,
                dots: true,
            });
        }
        //Initialize Slide Show


    });

}

//Links

function getLinks(page) {
    page.collection("links").orderBy("order", "asc").get().then(function (querySnapshot) {

        var linksDB = "";

        // Get Images from DB | Initialize Elements for update
        querySnapshot.forEach((doc) => {
            //Link elements
            let linkData = doc.data();
            linksDB += `<div class="col-md-4">
                            <div class="box-link container">
                                <a href="${linkData.link}" target="_blank">
                                    <p>${linkData.title}</p>
                                    <img class="img-fluid" src="${linkData.image}" alt="${linkData.title} Icon"/>
                                </a>
                            </div>
                        </div>`;

        })
        //Append the elements from DB to DOM
        $(linksDB).prependTo('#homeLinks');


        //Initialize Update


    });
}