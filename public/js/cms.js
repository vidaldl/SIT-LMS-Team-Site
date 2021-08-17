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

async function addSlideShow(page) {
    // SLIDE SHOW ADD IMAGE
    const fileUpload = $('#slideUpload');
    const ref = firebase.storage().ref('test/');
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
    const ref = firebase.storage().ref('test/');

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