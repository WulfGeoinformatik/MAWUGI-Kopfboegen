const { Client } = require('ldapts');

module.exports = async (req, res) => {

  ////////////////////////////////////////////////////////////////////////////////
  // SSL
  //////////////////////////////////////////////////////////////////////////////// 
  
  //In Demo-Umgebungen wird mit "0" die Zertifikatsprüfung deaktiviert
  //in Prod-Umgebungen folgende Zeile auskommentieren 
  
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0 
  
  ////////////////////////////////////////////////////////////////////////////////
  // Umgebungsvariablen
  //////////////////////////////////////////////////////////////////////////////// 
  
  let pw    = req.variables()["passwort"];
  let url   = req.variables()["url"];
  let user   = req.variables()["user"];
  let such_string   = req.variables()["such_string"];

  ////////////////////////////////////////////////////////////////////////////////
  // Body
  //////////////////////////////////////////////////////////////////////////////// 
  
  let body = req.json();
  if (!body || !body.person) {
    console.log("Bad request")
    res.status(400).set("Content-Type", "text/plain").send("Bad request");
    return;
  }
  let person = body.person
  result = await searchUser(person, pw, user, url, such_string);

  res.status(200).set("Content-Type", "application/json").send(result[0]);
}

////////////////////////////////////////////////////////////////////////////////
// Nutzer abfrageb
//////////////////////////////////////////////////////////////////////////////// 

async function searchUser(username, pw, user, url, such_string) {
  const client = new Client({
    url: url
  });
  try {

    await client.bind(
      user,
      pw
    );
    console.log('Anmeldung erfolgreich');
    const { searchEntries } = await client.search(
      such_string,
      {
        scope: 'sub',
        filter: `(sAMAccountName=${username})`,
        attributes: [
          'givenName',
          'sn',
          'cn',
          'physicalDeliveryOfficeName',
          'mail',
          'telephoneNumber',
          'streetAddress',
          'l',
          'postalCode',
          'facsimileTelephoneNumber',
          'company',
          'division',
          'department'
        ]
      }
    );
    console.log(searchEntries);
    return searchEntries;

  } catch (error) {
    console.error('LDAP-Fehler:');
    console.error(error);
    console.error('Name:', error.name);
    console.error('Nachricht:', error.message);
    console.error('Code:', error.code);
  } finally {
    // Verbindung schließen
    await client.unbind().catch(() => {})
  }
}
