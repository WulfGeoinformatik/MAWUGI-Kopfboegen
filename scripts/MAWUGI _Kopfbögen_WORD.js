const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

module.exports = async (req, res) => {
    
    ////////////////////////////////////////////////////////////////////////////////
    // Umgebungsvariablen
    //////////////////////////////////////////////////////////////////////////////// 
    console.log("### Umgebungsvariablen ###");
    
    const apiKey            = req.variables()["api_key"];
    const origin            = req.variables()["origin"];
    const repo              = req.variables()["repo"];
    const configURL         = req.variables()["configURL"];
    const ldapURL           = req.variables()["ldapURL"];   
    console.log('apiKey', apiKey);
    console.log('origin', origin);
    console.log('repo', repo);
    let vorlageID;
    let mappingFelder;
    let ldap;
    let dms = {};
    let idp = {};
    let datum = {};

    //////////////////////////////////////////////////////////////////////////////// 
    // Access to the request body (only possible with the POST, PUT and PATCH methods)
    //////////////////////////////////////////////////////////////////////////////// 
    console.log("### Body ###");
    
    let body = req.json();
    if (!body || !body.doc_id || !body.doku_art || !body.vorlage || !body.user) {
        res.status(400).set("Content-Type", "text/plain").send("Bad request");
        return;
    }
    console.log(body);

    ////////////////////////////////////////////////////////////
    // Config laden
    ////////////////////////////////////////////////////////////
    console.log("### Confi laden ###");
    
    let config_response = await fetch(configURL, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    });
    console.log(config_response.status);
    if (config_response.status != 200) {
        console.log(await config_response.text());
    }
    config = await config_response.json();
    for (const vorlage of config.vorlagen) {
        if (vorlage.name == body.vorlage) {
            vorlageID = vorlage.doc_id
            for (const mapping of vorlage.mappings) {
                if (mapping.doku_art == body.doku_art || mapping.doku_art == "*") {
                    mappingFelder = mapping.felder
                }
            }
        }
    }
    console.log(vorlageID);
    console.log(mappingFelder);

    ////////////////////////////////////////////////////////////
    // IDP-Daten holen
    ////////////////////////////////////////////////////////////
    console.log("### IDP-Daten holen ###");
    
    let idp_response = await fetch(`${origin}/identityprovider/scim/users/${body.user}`, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    });
    console.log(idp_response.status);
    let idp_json     = await idp_response.json();
    idp.userName     = idp_json.userName.split('\\')[1];
    idp.organization = (idp_json['urn:scim:schemas:extension:enterprise:1.0'].organization);
    idp.division     = (idp_json['urn:scim:schemas:extension:enterprise:1.0'].division);
    idp.department   = (idp_json['urn:scim:schemas:extension:enterprise:1.0'].department);
    console.log(idp);

    ////////////////////////////////////////////////////////////
    // LDAP-Daten holen
    ////////////////////////////////////////////////////////////
    console.log("### LDAP-Daten holen ###");
    
    let ldap_response = await fetch(ldapURL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            "person": idp.userName
        })
    });
    console.log(ldap_response.status);
    ldap = await ldap_response.json();
    console.log(ldap);

    ////////////////////////////////////////////////////////////
    // DMS-Daten holen
    ////////////////////////////////////////////////////////////
    console.log("### DMS-Daten holen ###");

    let dms_response = await fetch(`${origin}/dms/r/${repo}/o2m/${body.doc_id}`, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    });
    console.log(dms_response.status);
    if (!dms_response.ok) {
        console.log(await dms_response.text());
    }
    dms_data = await dms_response.json();
    for (const prop of dms_data.objectProperties) {
        dms[prop.id] = prop.value
    }
    console.log(dms)
    
    ////////////////////////////////////////////////////////////
    // Datum erzeugen
    ////////////////////////////////////////////////////////////
    console.log("### Datum erzeugen ###");
    
    const heute = new Date();
    const datumDeutsch = heute.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    datum.heute = datumDeutsch
    console.log(datum)

    ////////////////////////////////////////////////////////////
    // Daten zusammenstellen
    ////////////////////////////////////////////////////////////
    console.log("### Daten zusammenstellen ###");
    
    let jsonString = {};
    for (const feld of mappingFelder) {
        let type = feld.value.split('.')[0]
        let valueKey = feld.value.split('.')[1]
        if (type == 'ldap') {
            if (Array.isArray(ldap[valueKey]) && ldap[valueKey].length === 0) {
                ldap[valueKey] = '';
            }
            jsonString[feld.key] = ldap[valueKey];
        } else if (type == 'idp') {
            if (Array.isArray(idp[valueKey]) && idp[valueKey].length === 0) {
                idp[valueKey] = '';
            }
            jsonString[feld.key] = idp[valueKey];
        } else if (type == 'dms') {
            if (Array.isArray(dms[valueKey]) && dms[valueKey].length === 0) {
                dms[valueKey] = '';
            }
            jsonString[feld.key] = dms[valueKey];
        }
        else if (type == 'datum') {
            if (Array.isArray(datum[valueKey]) && datum[valueKey].length === 0) {
                datum[valueKey] = '';
            }
            jsonString[feld.key] = datum[valueKey];
        }
        else if (type == 'txt')
        {
            jsonString[feld.key] = valueKey;
        }
    };
    console.log(jsonString);

    ////////////////////////////////////////////////////////////
    // Links zu doc_id holen
    ////////////////////////////////////////////////////////////
    console.log("### Links zu doc_id holen ###");
    
    let link_response = await fetch(`${origin}/dms/r/${repo}/o2m/${vorlageID}`, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    });
    console.log(link_response.status);
    if (!link_response.ok) {
        console.log(await link_response.text());
    }
    link = await link_response.json();
    console.log(link._links.mainblobcontent.href);

    ////////////////////////////////////////////////////////////
    // Mainblob holen 
    ////////////////////////////////////////////////////////////
    console.log("### Mainblob holen ###");

    let template_response = await fetch(`${origin}${link._links.mainblobcontent.href}`, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    });
    console.log(template_response.status);
    const arrayBuffer = await template_response.arrayBuffer();

    ////////////////////////////////////////////////////////////
    // Dokument erzeugen
    ////////////////////////////////////////////////////////////
    console.log("### Dokument erzeugen ###");
    
    const zip = new PizZip(Buffer.from(arrayBuffer));
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    doc.render(jsonString);
    const buffer =  doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
    });
    console.log(buffer)

    ////////////////////////////////////////////////////////////
    // Dokument hochladen
    ////////////////////////////////////////////////////////////
    console.log("###  Dokument hochladen ###");
    
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    let chunkResponse = await fetch(`${origin}/dms/r/${repo}/blob/chunk/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Origin': origin,
            'Content-Type': 'application/octet-stream',
                
        },
        body: blob
    });
     var locationHeader = chunkResponse.headers.get('Location');
     console.log(chunkResponse.status);
     console.log(locationHeader);

    ////////////////////////////////////////////////////////////
    // Ablagedialog erzeugen
    ////////////////////////////////////////////////////////////
    console.log("### Ablagedialog erzeugen ###");
    
    let dialog_response = await  fetch(`${origin}/dms/r/${repo}/new`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/hal+json'
        },
        body: `{
            "storeObjects": [
                {
                   
                    "filename": "${body.vorlage}.docx",
                    "sourceId": "/dms/r/${repo}/source",
                    "contentLocationUri": "${locationHeader}"
                }
            ]
        }`
    });
    console.log(dialog_response.status);
    dialog = dialog_response.headers.get('Location');    
    console.log(dialog);

    ////////////////////////////////////////////////////////////
    // Ablagedialog zurückschicken
    ////////////////////////////////////////////////////////////
    console.log("### Ablagedialog zurückschicken ###");
    
    res.status(200).set("Content-Type", "text/plain").send(dialog);
}
