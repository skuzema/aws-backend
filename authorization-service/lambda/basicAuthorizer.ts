import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
  StatementEffect,
} from "aws-lambda";
import * as dotenv from "dotenv";

dotenv.config();

const generatePolicy = (
  principalId: string,
  effect: StatementEffect,
  resource: string
): APIGatewayAuthorizerResult => {
  const authResponse: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
  return authResponse;
};

export const handler = async (event: APIGatewayTokenAuthorizerEvent) => {
  if (!event.authorizationToken) {
    throw new Error(
      JSON.stringify({
        statusCode: 401,
        message: "Unauthorized",
      })
    );
  }

  const authToken = event.authorizationToken.split(" ")[1];
  const decodedCreds = Buffer.from(authToken, "base64").toString("utf-8");
  const [username, password] = decodedCreds.split(":");

  const expectedPassword = process.env[username];

  if (expectedPassword && expectedPassword === password) {
    return generatePolicy(username, "Allow", event.methodArn);
  } else {
    throw new Error(
      JSON.stringify({
        statusCode: 403,
        message: "Forbidden",
      })
    );
  }
};
