const jsf = require("json-schema-faker");
jsf.option({ alwaysFakeOptionals: true });

exports.getStaticResponses = (examples) => {
  if (!examples) {
    return false;
  }
  if (typeof examples === "array" && examples.length > 0) {
    return JSON.stringify(examples[0],null, 4);
  } else if (typeof examples === "object" && Object.keys(examples).length > 0) {
    return JSON.stringify(examples[Object.keys(examples)[0]] ,null, 4);
  }
  return false;
}

exports.getDummyResponse = (schema) => {
  return jsf.generate(schema);
}
