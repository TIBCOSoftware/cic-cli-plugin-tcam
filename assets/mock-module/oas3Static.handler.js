const { getDummyResponse, getStaticResponses } = require("./commom.function");
class Oas3StaticHandler {
  constructor() {}
  generateStaticResponse = (responses, schema) => {
    const examples = responses["200"].content["application/json"].example
      ? responses["200"].content["application/json"].example
      : responses["200"].content["application/json"].examples;
    let response = getStaticResponses(examples);
    if (response) {
      return response;
    }
    if (schema) {
      response = getStaticResponses(schema.example);
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
module.exports = new Oas3StaticHandler();