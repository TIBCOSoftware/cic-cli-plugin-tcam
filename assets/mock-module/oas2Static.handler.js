const { getDummyResponse, getStaticResponses } = require("./common.function");
  exports.generateStaticResponseOAS2 = (responses, schema) => {
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