const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

require('dotenv').config();

exports.handler = async (event) => {

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2020-08-01',
    authenticator: new IamAuthenticator({
      apikey: process.env.API_KEY,
    }),
    serviceUrl: process.env.URL,
    disableSslVerification: true,
  });
  
    const analyzeParams = {
      'text': event.historial_clinico,
      'features': {
        'entities': {
          'emotion': true,
          'sentiment': true,
          'limit': 5,
        },
        'keywords': {
          'emotion': true,
          'sentiment': true,
          'limit': 5,
        },
      },
    };
  
    
   try{
    var result = (await naturalLanguageUnderstanding.analyze(analyzeParams)).result;

    var palabras_clave = result.keywords.map(getClave);
    var entidades = result.entities.map(getClave);
    var palabras_clave_desc = {}
    var entidades_desc = {}

    result.keywords.forEach(item =>{
      palabras_clave_desc[item.text]= {
        "sentimiento": item.sentiment.label,
        "relevancia": item.relevance,
        "repeticiones": item.count,
        "emocion": getEmotion(item.emotion)
      }
    });

    result.entities.forEach(item =>{
      entidades_desc[item.text]= {
        "tipo": item.type,
        "sentimiento": item.sentiment.label,
        "relevancia": item.relevance,
        "emocion": getEmotion(item.emotion),
        "repeticiones": item.count,
        "porcentaja_confianza": item.confidence
        
      }
    });


    return {
      "lenguaje_texto":  result["language"],
      "palabras_clave": palabras_clave,
      "entidades":  entidades,
      "palabras_clave_desc": palabras_clave_desc,
      "entidades_desc": entidades_desc
    }

   }catch(e){
    return e;
   }

   function getClave(item) {
    return item.text;
  }

  function getEmotion(emotions){
    return Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
  }

};