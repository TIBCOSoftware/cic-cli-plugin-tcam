const Oas3StaticHandler = require("./oas3Static.handler");
const Oas2StaticHandler = require("./oas2Static.handler");
const OAS3 = "OAS3.0";
const OAS2 = "OAS2.0";
const CODE_200 = "200";
module.exports.generateResponse = (
  responses,
  spec,
  dynamic
) => {
  const oasType = spec.openapi ? OAS3 : OAS2;
  // check if responses contains 200 response
  if (responses[CODE_200]) {
    const schema =
      oasType === OAS3
        ? responses[CODE_200].content ? responses[CODE_200].content["application/json"]?.schema : undefined
        : responses[CODE_200].schema;
    // in case of dynamic responses
    if (dynamic) {
      if (schema) {
        return `await jsf.resolve(${JSON.stringify(schema, null, 4)})`;
      } else {
        return "'200 okay'";
      }
    }
    // in case of static responses for OAS3.0
    else if (oasType === OAS3) {
      return Oas3StaticHandler.generateStaticResponse(responses, schema);
    }
    // in case of static responses for OAS2.0
    else {
      return Oas2StaticHandler.generateStaticResponse(responses, schema);
    }
  } else {
    return "'200 okay'";
  }
};
