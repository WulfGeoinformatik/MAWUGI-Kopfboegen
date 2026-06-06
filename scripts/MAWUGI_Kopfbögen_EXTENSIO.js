module.exports = async (req, res) => {
  
  ////////////////////////////////////////////////////////////////////////////////
  // Default returnValue
  ////////////////////////////////////////////////////////////////////////////////
  
    result = { "status" : 200, "txt" : "OK"}
  
  ////////////////////////////////////////////////////////////////////////////////
  // Umgebungsvariablen
  //////////////////////////////////////////////////////////////////////////////// 
   
  const apiKey            = req.variables()["api_key"];
  const origin            = req.variables()["origin"];
  const repo              = req.variables()["repo"];
  const id                = req.variables()["id"];
  const formURI           = req.variables()["formURI"];
  const iconURI           = req.variables()["iconURI"];
  const caption           = req.variables()["caption"];
    
  console.log('apiKey', apiKey);
  console.log('origin', origin);
  console.log('repo', repo);
  console.log('id', id);
  console.log('formURI', formURI);
  console.log('iconURI', iconURI);
  console.log('caption', caption);

  ////////////////////////////////////////////////////////////////////////////////
  // CREATE EXTENSION
  //////////////////////////////////////////////////////////////////////////////// 

  response = await fetch(`${origin}/dms/extensions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      id: id,
      activationConditions: [{
        "propertyId": "repository.id",
			  "operator": "or",
			  "values": [repo]
      }],
      captions: [{
        culture: 'de',
        caption: caption
      }],
      context: 'DmsObjectDetailsContextAction',
      uriTemplate: `${formURI}?dmsObjectId={dmsobject.property_document_id}&dmsRepoId={repository.id}`,
      iconUri: iconURI,
      target: 'dapi_inner_supply'
    })
  })

  if(response.status != 200) {
    result.status = response.status
    result.txt = await response.text()
    console.log('response', response)
  }
  
  res.status(result.status).set("Content-Type", "application/json").send(result);
}
