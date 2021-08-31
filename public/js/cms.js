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


async function populatePage() {
    homePage = db.collection("cms").doc("home");

    getPageTitle(homePage);
    getSlideShow(homePage);
    addSlideShow(homePage);
    getLinks(homePage);
    updateLinkModal(homePage);
    createLink(homePage);





}
//Page Title
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

async function addSlideShow(page) {
    // SLIDE SHOW ADD IMAGE
    const fileUpload = $('#slideUpload');
    const ref = firebase.storage().ref('banner_images/');
    let orders = await homePage.collection("banners").orderBy("order", "desc").limit(1).get();


    $(fileUpload).change(function (evt) {
        let firstFile = evt.target.files[0];
        /***
         * CropperJS init
         */
        let editor = $('.editor');
        // let imgThumbnail = $('#modal');
        $(fileUpload).addClass('d-none');
        // $(imgThumbnail).addClass('d-none');
        $(editor).removeClass('d-none');
        $(editor).addClass('d-block');


        // Create an image node for Cropper.js
        let image = new Image();
        image.src = URL.createObjectURL(firstFile);
        $(image).appendTo(editor)
        // Create Cropper.js
        let cropper = new Cropper(image, { aspectRatio: 11/2 });

        let buttonConfirm = $('.buttonConfirm');
        $(buttonConfirm).removeClass('d-none');
        $(buttonConfirm).addClass('d-block');

        $(buttonConfirm).click(function() {
            $('#overlay').fadeIn("slow");
            // Get the canvas with image data from Cropper.js
            let canvas = cropper.getCroppedCanvas({
                width: 1650,
                height: 300
            });
            // Turn the canvas into a Blob (file object without a name)
            canvas.toBlob(function(blob) {
                // Create a new Dropzone file thumbnail
                /********
                 *FIRESTORE Storage functionality, Save in Database as well.
                 */
                let nombre;
                page.collection("banners").add({
                    "image": '',
                    "order": orders.docs[0].data().order + 1,
                }).then(async function(doc) {
                    nombre = doc.id + '-slide';

                    //Upload New
                    const task = await ref.child(nombre).put(blob).then(snapshot => snapshot.ref.getDownloadURL())
                        .then( (url) => {
                            console.log(url);
                            page.collection("banners").doc(doc.id).update({
                                'image': url,
                            })
                        })
                        .catch(console.error);
                    setTimeout(function(){
                        location.reload();

                    }, 500);
                });

            }, 'image/png');
            // Remove the editor from the view
            $(buttonConfirm).removeClass('d-block');
            $(buttonConfirm).addClass('d-none');

            $(image).addClass('d-none');
            $(editor).removeClass('d-block');
            $(editor).addClass('d-none');
            // $(imgThumbnail).removeClass('d-none');
            // $(imgThumbnail).addClass('d-block');

            updateAlert('Content Added!!');

        });

    });
}


function getSlideShow(page) {

    page.collection("banners").orderBy("order", "asc").get().then(function (querySnapshot) {
        var slideShow = `<div class="owl-carousel owl-theme" id="homeSlideShow">`;

        var editSlidePic = "";

        var editSlideInput = "";

        // Get Images from DB | Initialize Elements for update
        querySnapshot.forEach((doc) => {
            //Banner Elements
            let banner = doc.data();
            slideShow += `<div class="item">
                        <img class="carousel-img" id="${doc.id}" src="${banner.image}">
                    </div>`;

            //Edit Elements
            editSlidePic += `<div class="row mt-3">
                                <img id="modal-${doc.id}" class="img-fluid col-md-8" src="${banner.image}" alt="Slide Show picture">
                                <div class="editor${doc.id} d-none" style="height:450px; width: 450px; background-color: #000;"></div>`;

                editSlidePic += `<div class="col-md-4 border rounded" >
                                    <div class="row pt-2">
                                        <button class="buttonConfirm${doc.id} btn btn-primary mx-auto my-auto d-none">Confirm</button>
                                    </div>
                                    <div class="row pt-2">
                                        <div class="col-md-8">
                                            <input class="form-control-file" id="slideUpload${doc.id}" value="Upload Image" type="file">
                                        </div>
                                        <div class="col-md-4">
                                            <button class="btn btn-danger float-right" onclick="deleteSlide('${doc.id}')"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>`

        })

        slideShow += `</div>`;


        //Append the elements from DB to DOM
        $(slideShow).appendTo('#slideShowDB');
        $(editSlidePic).appendTo('#editSlideShowPic');
        $(editSlideInput).appendTo('#editSlideShowInput');

        //Initialize Slide Show
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

        //Initialize Update

        querySnapshot.forEach((doc) => {
                // Update Slide Show Image

                slideShowUpdate(doc, page);
            });

    });

}


function slideShowUpdate(doc, page) {
    //Slide Show IMAGE Update UPLOAD

    const fileUpload = $('#slideUpload' + doc.id);
    const ref = firebase.storage().ref('banner_update/');

    $(fileUpload).change(function (evt) {
        let firstFile = evt.target.files[0];
        /***
         * CropperJS init
         */
        let editor = $('.editor' + doc.id);
        let imgThumbnail = $('#modal-' + doc.id);
        $(fileUpload).addClass('d-none');
        $(imgThumbnail).addClass('d-none');
        $(editor).removeClass('d-none');
        $(editor).addClass('d-block');


        // Create an image node for Cropper.js
        let image = new Image();
        image.src = URL.createObjectURL(firstFile);
        // editor.appendChild(image);
        $(image).appendTo(editor)
        // Create Cropper.js
        let cropper = new Cropper(image, { aspectRatio: 11/2 });

        let buttonConfirm = $('.buttonConfirm' + doc.id);
        $(buttonConfirm).removeClass('d-none');
        $(buttonConfirm).addClass('d-block');

        $(buttonConfirm).click(function() {
            // Get the canvas with image data from Cropper.js
            let canvas = cropper.getCroppedCanvas({
                width: 1650,
                height: 300
            });
            // Turn the canvas into a Blob (file object without a name)
            canvas.toBlob(function(blob) {
                // Create a new Dropzone file thumbnail
                /********
                 *FIRESTORE Storage functionality, Save in Database as well.
                 */
                    // const file = document.querySelector('#photo').files[0]
                    // let firstFile = evt.target.files[0];
                const name = doc.id + '-slide';
                // const metadata = {
                //     contentType: file.type
                // };
                //Delete Old
                let deleteOld = ref.child(name).delete();
                deleteOld.catch(console.error);
                //Upload New
                const task = ref.child(name).put(blob);
                task
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then((url) => {
                        console.log(url);

                        $('#' + doc.id).attr("src", url);
                        imgThumbnail.attr("src", url);
                        page.collection("banners").doc(doc.id).update({
                            "image": url,
                        }).then(() => {
                            setTimeout(function(){
                                location.reload();

                            }, 500);
                        });
                    })
                    .catch(console.error);
            }, 'image/png');
            // Remove the editor from the view
            $(buttonConfirm).removeClass('d-block');
            $(buttonConfirm).addClass('d-none');

            $(image).addClass('d-none');
            $(editor).removeClass('d-block');
            $(editor).addClass('d-none');
            $(imgThumbnail).removeClass('d-none');
            $(imgThumbnail).addClass('d-block');

            updateAlert('Content Updated!');



        });

    });
}


async function deleteSlide(docId) {
    const ref = firebase.storage().ref('test/');
    const nombre = docId + '-slide';

    console.log(ref.child(nombre));
    console.log(docId);

    if(confirm('are you sure?')) {
        $('#overlay').fadeIn();

        let deleteOld = await ref.child(nombre).delete()
            .then(() => {
                db.collection("cms").doc("home").collection("banners").doc(docId).delete()
                    .then(() => {
                        updateAlert('Image Deleted.');

                        setTimeout(function(){
                            location.reload();

                        }, 1000);
                    })
                    .catch(console.error);
            })
            .catch(console.error);

    }


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
                                <a data-toggle="modal" data-target="#${doc.id}-${linkData.title}">
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

function updateLinkModal(page) {


    page.collection("links").orderBy("order", "asc").get().then(function (querySnapshot) {

        var linkModalsDB = "";

        // Get Images from DB | Initialize Elements for update
        querySnapshot.forEach((doc) => {
            //Link elements
            let linkData = doc.data();
            linkModalsDB += `<div class="modal fade" id="${doc.id}-${linkData.title}" tabindex="-1" role="dialog" aria-labelledby="updateLinkModalLabel" aria-hidden="true">
                                <div class="modal-dialog modal-lg" role="document">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="createLinkModalLabel">Edit Link</h5>
                                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div class="modal-body">
                                            <h5>Info</h5>
                                            <hr style="margin-top: 0;" />
                                            <div class="form-group">
                                                <label for="linkTitle">Title</label>
                                                <input type="text" class="form-control" id="${doc.id}-linkTitle" placeholder="Link title" value="${linkData.title}">
                                            </div>
                                            <div class="form-group">
                                                <label for="linkAddress">Link Address</label>
                                                <input type="text" class="form-control" id="${doc.id}-linkAddress" placeholder="https://" value="${linkData.link}">
                                            </div>
                                            <div class="container">
                                                <div class="row">
                                                    <button class="btn btn-primary ml-auto" id="${doc.id}-update">Update</button>
                                                </div>
                                            </div>
                                            <h5>Image</h5>
                                            <hr style="margin-top: 0;" />                                     
                                            <div class="row mt-3 mb-5">
                                                <img class="img-fluid mx-auto" src="${linkData.image}" id="${doc.id}-image" style="width: 300px;"/>
                                                <!--EDITOR-->
                                                <div class="${doc.id}-editorLink d-none" style="height:450px; width: 450px; background-color: #000;">
                                                </div>
                                                
                                                <div class="mx-auto">
                                                    <label for="${doc.id}-linkImage">Update</label>                                        
                                                    <input class="form-control-file" id="${doc.id}-linkImageUpdate" value="Upload Image" type="file">
                                                    <button class="${doc.id}-buttonConfirmLink btn btn-primary float-right mt-2 d-none">Confirm</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;



        })
        //Append the elements from DB to DOM
        $(linkModalsDB).appendTo('#linkUpdateModals');

        //Initialize Updates
        querySnapshot.forEach((doc) => {
            // Update Slide Show Image

            editLink(doc, page);
            editLinkImage(doc, page);
        });

    });
}

async function editLink(docc, page) {
    let orders = await homePage.collection("banners").orderBy("order", "desc").limit(1).get();

    $('#' + docc.id + '-update').click(function() {

        page.collection("links").doc(docc.id).update({
            "title": $('#' + docc.id + '-linkTitle').val(),
            "link": $('#' + docc.id + '-linkAddress').val(),
        }).then(function() {
            updateAlert('Content Updated');
        }).catch((error) => {
            alert('Could not update for some reason');
            updateAlert('Could not update for some reason');
        });
    });
}

function editLinkImage(docc, page) {
    //Update Image
    const fileUpload = $('#' + docc.id + '-linkImageUpdate');
    const ref = firebase.storage().ref('links/');

    $(fileUpload).change(function (evt) {
        let firstFile = evt.target.files[0];
        /***
         * CropperJS init
         */
        let editor = $('.' + docc.id + '-editorLink');
        let imgThumbnail = $('#' + docc.id + '-image');
        $(fileUpload).addClass('d-none');
        $(imgThumbnail).addClass('d-none');
        $(editor).removeClass('d-none');
        $(editor).addClass('d-block');


        // Create an image node for Cropper.js
        let image = new Image();
        image.src = URL.createObjectURL(firstFile);
        // editor.appendChild(image);
        $(image).appendTo(editor)
        // Create Cropper.js
        let cropper = new Cropper(image, { aspectRatio: 1 });

        let buttonConfirm = $('.' + docc.id + '-buttonConfirmLink');
        $(buttonConfirm).removeClass('d-none');
        $(buttonConfirm).addClass('d-block');

        $(buttonConfirm).click(function() {
            // Get the canvas with image data from Cropper.js
            let canvas = cropper.getCroppedCanvas({
                width: 500,
                height: 500
            });
            // Turn the canvas into a Blob (file object without a name)
            canvas.toBlob(function(blob) {
                // Create a new Dropzone file thumbnail
                /********
                 *FIRESTORE Storage functionality, Save in Database as well.
                 */
                    // const file = document.querySelector('#photo').files[0]
                    // let firstFile = evt.target.files[0];
                const name = docc.id + '-image';
                // const metadata = {
                //     contentType: file.type
                // };
                //Delete Old
                let deleteOld = ref.child(name).delete();
                deleteOld.catch(console.error);
                //Upload New
                const task = ref.child(name).put(blob);
                task
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then((url) => {
                        console.log(url);
                        imgThumbnail.attr("src", url);
                        page.collection("links").doc(docc.id).update({
                            "image": url,
                        }).then(() => {
                            setTimeout(function(){
                                location.reload();

                            }, 500);
                        });
                    })
                    .catch(console.error);
            }, 'image/png');
            // Remove the editor from the view
            $(buttonConfirm).removeClass('d-block');
            $(buttonConfirm).addClass('d-none');

            $(image).addClass('d-none');
            $(editor).removeClass('d-block');
            $(editor).addClass('d-none');
            $(imgThumbnail).removeClass('d-none');
            $(imgThumbnail).addClass('d-block');
            updateAlert('Content Updated!');

        });

    });

}

async function createLink(page) {
    // SLIDE SHOW ADD IMAGE
    const fileUpload = $('#linkImage');
    const ref = firebase.storage().ref('links/');
    let title = $('#linkTitle').val();
    let link = $('#linkAddress').val();
    let orders = await homePage.collection("links").orderBy("order", "desc").limit(1).get();


    $(fileUpload).change(function (evt) {
        let firstFile = evt.target.files[0];
        /***
         * CropperJS init
         */
        let editor = $('.editorLink');
        // let imgThumbnail = $('#modal');
        $(fileUpload).addClass('d-none');
        // $(imgThumbnail).addClass('d-none');
        $(editor).removeClass('d-none');
        $(editor).addClass('d-block');


        // Create an image node for Cropper.js
        let image = new Image();
        image.src = URL.createObjectURL(firstFile);
        $(image).appendTo(editor)
        // Create Cropper.js
        let cropper = new Cropper(image, { aspectRatio: 1 });

        let buttonConfirm = $('.buttonConfirmLink');
        $(buttonConfirm).removeClass('d-none');
        $(buttonConfirm).addClass('d-block');

        $(buttonConfirm).click(function() {
            $('#overlay').fadeIn("slow");
            // Get the canvas with image data from Cropper.js
            let canvas = cropper.getCroppedCanvas({
                width: 500,
                height: 500
            });
            // Turn the canvas into a Blob (file object without a name)
            canvas.toBlob(function(blob) {
                // Create a new Dropzone file thumbnail
                /********
                 *FIRESTORE Storage functionality, Save in Database as well.
                 */
                let nombre;
                page.collection("links").add({
                    "title": $('#linkTitle').val(),
                    "link": $('#linkAddress').val(),
                    "order": orders.docs[0].data().order + 1,
                }).then(async function(doc) {
                    nombre = doc.id + '-image';

                    //Upload New
                    const task = await ref.child(nombre).put(blob).then(snapshot => snapshot.ref.getDownloadURL())
                        .then( (url) => {
                            console.log(url);
                            page.collection("links").doc(doc.id).update({
                                'image': url,
                            })
                        })
                        .catch(console.error);
                    setTimeout(function(){
                        location.reload();

                    }, 500);
                });

            }, 'image/png');
            // Remove the editor from the view
            $(buttonConfirm).removeClass('d-block');
            $(buttonConfirm).addClass('d-none');

            $(image).addClass('d-none');
            $(editor).removeClass('d-block');
            $(editor).addClass('d-none');
            // $(imgThumbnail).removeClass('d-none');
            // $(imgThumbnail).addClass('d-block');

            updateAlert('Content Added!!');

        });

    });
}