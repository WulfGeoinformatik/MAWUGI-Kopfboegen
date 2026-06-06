module.exports = async (req, res) => {
  let config = {
        "vorlagen" : [
            {
                "name": "Kopfbogen-AP", 
                "displayName": "Kopfbogen Aktenplan", 
                "doc_id": "T000006945",
                "mappings": [
                    {
                        "doku_art": "AVORG",
                        "felder": [
                            {
                                "key": "Vorgangszeichen",
                                "value": "dms.1547"
                            },
                            {
                                "key": "Datum",
                                "value": "datum.heute"
                            },
                            {
                                "key": "Vorname",
                                "value": "ldap.givenName"
                            },
                            {
                                "key": "Fachbereich",
                                "value": "idp.department"
                            }
                        ]
                    }
                ]
            },
        ]
    }

    res.status(200).set("Content-Type", "application/json").send(config);
}
