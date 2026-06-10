////////////////////////////////////////////////////////////
//  Aufrufeparameter auslesen (querystring)
////////////////////////////////////////////////////////////

const origin = window.location.origin;
const urlParams = new URLSearchParams(window.location.search);
const dmsRepoId = urlParams.get('dmsRepoId');
const dmsObjectId = urlParams.get('dmsObjectId');

console.log("origin", origin);
console.log("dmsRepo", dmsRepoId);
console.log("dmsObject", dmsObjectId)

////////////////////////////////////////////////////////////
//  Endpunkte
////////////////////////////////////////////////////////////

let configURL   = ''; // see ./scripts
let wordURL     = ''; // see ./scripts

////////////////////////////////////////////////////////////
//  Initialisierung und Vorbelegung
////////////////////////////////////////////////////////////

async function init(form, data){
    console.log("### Init ###");
    console.log("Dokuart", data.dmsProperties.property_category)
    console.log(data);
    data.nutzer     = await loadCurrentUserInformation();
    console.log("Nutzer", data.nutzer.id)
    data.vorlagen   = await getVorlagen(data.dmsProperties.property_category);
    console.log(data.vorlagen)
    dapi.publishTitle('MaWuGi Kopfbögen');
    form.triggerRedraw();
}

////////////////////////////////////////////////////////////
//  getVorlagen()
////////////////////////////////////////////////////////////

async function getVorlagen(dokuart) {
    console.log('### getVorlagen() ####');
    console.log("Dokuart", dokuart);
    let response = await fetch(configURL);
    console.log(response.status);
    if (response.status != 200) {
        console.log(await response.text());
        return [];
    }
    const alle = await response.json();
    console.log("alle", alle);
    let liste = []
    for (const vorlage of alle.vorlagen) {
        let match = false
        console.log(vorlage.name);
        console.log(vorlage.displayName);
        for (const mapping of vorlage.mappings){
            console.log(mapping.doku_art);
            if (mapping.doku_art == dokuart || mapping.doku_art == "*") {
                match = true;
            }
        }
        console.log(match);
        if (match) {
            liste.push({"name": vorlage.name, "displayName": vorlage.displayName})
        }
    }
    console.log("liste", liste);
    return liste;
}

////////////////////////////////////////////////////////////
//  createVorlage()
////////////////////////////////////////////////////////////

async function createVorlage(doc_id, doku_art, vorlage, user) {
    console.log('### createVorlage() ###');
    console.log(doc_id);
    console.log(doku_art);
    console.log(vorlage);
    console.log(user);
    response = await fetch( wordURL,{
        method: 'POST',
        body: JSON.stringify({
            "doc_id": doc_id,
            "doku_art": doku_art,
            "vorlage": vorlage,
            "user": user
        })
    })
    let dialog = await response.text()
    console.log(dialog)
    window.location.href = dialog
}

////////////////////////////////////////////////////////////
//  Hilfsfunktionen
////////////////////////////////////////////////////////////

async function showAlert(form, message) {
    form.setAlert("success", message, {}); // "danger", "success", "warning" 
    await timeout(2500);
    form.setAlert("", "", {});
}

async function showError(form, message) {
    form.setAlert("danger", message, {}); // "danger", "success", "warning" 
    await timeout(2500);
    form.setAlert("", "", {});
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadCurrentUserInformation() {
    const response = await fetch("/identityprovider/validate", {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'application/json', 'origin': window.location.origin }
    });

    const status = response.status;
    if (status < 200 || status > 299) {
        throw new Error(`Unable to fetch HAL JSON from server. Received status ${status}`, response);
    }
    return response.json();
};
