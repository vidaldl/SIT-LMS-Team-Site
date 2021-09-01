const ssCanvas1 = "https://docs.google.com/spreadsheets/d/1qrrSnZcuTThKtrHlwndkOwEuk5e7QpYu4DBItT9VWow/edit#gid=266358356";
const ssCanvas2 = "https://docs.google.com/spreadsheets/d/1qrrSnZcuTThKtrHlwndkOwEuk5e7QpYu4DBItT9VWow/edit#gid=266358356";
const team = document.getElementById("teams");
const iframe = document.getElementById("spreadsheet");
const teamSelector = document.getElementById("selectTeam");
const newTab = document.getElementById("newTab");

function loadPage() {
    db.collection("cms").doc("schedule").onSnapshot((querrySnapshot) => {
        var scheduleLink = querrySnapshot.data().schedule_link;
        $('#newTab').attr("href", scheduleLink);
        $('#spreadsheet').attr("src", scheduleLink);

    });

}

loadPage();