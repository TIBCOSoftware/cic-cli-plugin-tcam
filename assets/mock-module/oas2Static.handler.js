const { getDummyResponse, getStaticResponses } = require("./commom.function");
class Oas2StaticHandler {
  constructor() {}
  generateStaticResponse = (responses, schema) => {
    const examples = responses["200"].examples;
    if (examples && Object.keys(examples).length > 0) {
      return JSON.stringify(examples[Object.keys(examples)[0]]);
    }
    if (schema) {
      let response = getStaticResponses(schema.example);
      if (response) {
        return response;
      }
      const dummyExample = getDummyResponse(schema);
      return `${JSON.stringify(dummyExample, null, 4)}`;
    } else {
      return "'200 okay'";
    }
  };
}
module.exports = new Oas2StaticHandler();