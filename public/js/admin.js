const users = db.collection('users');
const admin = document.getElementById('admin');
const generate = document.getElementById("users-list-generate");
const checkShow = document.getElementById("checkShow");
var orderBy = "nameDisplay";

function loadPage() {
    users.where("name", "==", userName)
        .onSnapshot((querySnapshot) => {
            data = querySnapshot.docs[0].data();
            if (data.admin || data.lead) {
                generateList(false);
            } else {
                window.location.replace("home.html");
            }
        })
}

function teamChange(id){
    let selection = document.getElementById(id);
    let newTeam = $(selection).find('select.teamSelect').val()
    users.doc(id).update({
        team: newTeam
    });
}
function titleChange(id) {
    let selection = document.getElementById(id);
    let newTitle = $(selection).find('select.roleSelect').val()
    users.doc(id).update({
        title: newTitle
    });
}
function adminChange(id) {
    let selection = document.getElementById(id);
    if ($(selection).find('input.admin').prop('checked')){
        users.doc(id).update({
            admin: true
        });
    } else {
        users.doc(id).update({
            admin: false
        });
    }
}
function storeChange(id) {
    let selection = document.getElementById(id);
    if ($(selection).find('input.manager').prop('checked')){
        users.doc(id).update({
            storeManager: true
        });
    } else {
        users.doc(id).update({
            storeManager: false
        });
    }
}



function deleteUser(id){

    users.doc(id).delete();
    clearTable();
    generateList();
    closeAllModals();
}

function generateList(all) {
    // console.log('generateList called');
    users.orderBy(orderBy, "asc").get()
        .then(function (documents) {
            let count = 1

            documents.forEach(function (doc) {
                // This will filter out anyone who is not actively on our team
                if ((doc.data().team != "default" && doc.data().team != "other" && doc.data().nameDisplay != "Demo Student") || all) {
                    if (count % 2 == 0) {
                        var interpolate = "grayYes"
                    }

                    let row = `<tr class='generated  p-2 ${interpolate}' id=${doc.id}>
                                    <td class="usernum admin-count">${count}</td>
                                    <td class="username">${doc.data().nameDisplay}</td>
                                    
                                    <td class="usertitle">
                                        <select onchange="titleChange('${doc.id}')" class = "table-select roleSelect">
                                            <option>Student Lead</option>
                                            <option>Human Resources</option>
                                            <option>Trainer</option>
                                            <option>Project Lead</option>
                                            <option>Team Member</option>
                                        </select>
                                    </td>`
                    if (doc.data().admin) {
                        row += `<td class="useradmin"><input onchange="adminChange('${doc.id}')" class="admin" type="checkbox" checked/></td>`
                    } else {
                        row += `<td class="useradmin"><input onchange="adminChange('${doc.id}')" class="admin" type="checkbox"/></td>`
                    }
                    if (doc.data().storeManager) {
                        row += `<td class="userstore"><input onchange="storeChange('${doc.id}')" class="manager" type="checkbox" checked/></td>`
                    } else {
                        row += `<td class="userstore"><input onchange="storeChange('${doc.id}')" class="manager" type="checkbox"/></td>`
                    }

                    // Adds Delete button and Modal

                    row += `<td>
                                <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#delete${doc.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                            <div class="modal fade" id="delete${doc.id}" tabindex="-1" role="dialog" aria-hidden="true">
                                <div class="modal-dialog" role="document">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="exampleModalLabel">Confirm Delete</h5>
                                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div class="modal-body">
                                            <h5>Are you sure you want to delete ${doc.data().nameDisplay}'s user?</h5>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                                            <button type="button" class="btn btn-warning white" onclick="deleteUser('${doc.id}')">Confirm <i class="fas fa-check"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                    generate.insertAdjacentHTML('beforeend', row);

                    count++;
                }
                
                let selection = document.getElementById(`${doc.id}`);
                $(function () {
                    $(selection).find('select.teamSelect').val(doc.data().team);
                    $(selection).find('select.roleSelect').val(doc.data().title);
                });
            });
        });
}
function clearTable() {
    // var rows = document.getElementsByClassName('generated');
    // var length = rows.length;
    // console.log(rows);
    // console.log(length);

    document.getElementById("users-list-generate").innerHTML = "";
}
function changeOrder(order) {
    orderBy = order;
    // console.log(order, orderBy);
    clearTable();
    generateList();
}


$(checkShow).change(() => {
    if ($(checkShow).is(':checked')) {
        $(generate).empty();
        generateList(true)
    } else {
        $(generate).empty();
        generateList(false);
    }
});

function editTime(firestore, time) {
    let notUsed = document.getElementsByClassName('notUsed');
    let selection = document.getElementById(firestore);
    if (notUsed.length == 0) {
        $(selection).find('.hours').append(`<span class="notUsed"><input id='value${firestore}' value="${time}" type="text"> <button onclick="updateDb('${firestore}', ${time}, ${'this'})" type="submit"> Send </button> <button onclick="deleteSpan(${'this'})" type="Text"> Close </button> </span>`);
    }
}

function updateDb(accessId, timeToAdd, element) {
    console.log(timeToAdd);
    var id = "value" + accessId;
    console.log(id);
    var value = Number(document.getElementById(id).value);
    users.doc(accessId).update({
            "time.accumulatedTime": value
        })
        .then(function () {
            console.log("Document Written with Success")
        })
        .catch(function (error) {
            console.log(error);
        })
    var updateHTML = "count" + accessId;
    document.getElementById(updateHTML).innerText = value;
    element.parentNode.remove();
}

function deleteSpan(element) {
    element.parentNode.remove();
}

