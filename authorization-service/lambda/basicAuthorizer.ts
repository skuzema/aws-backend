import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
  Context,
  Callback,
} from "aws-lambda";

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
  context: Context,
  callback: Callback<APIGatewayAuthorizerResult>
) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (!event.authorizationToken) {
    return callback(null, generatePolicy("user", "Deny", event.methodArn, 401));
  }

  const token = event.authorizationToken.split(" ")[1];
  const decodedCredentials = Buffer.from(token, "base64").toString("utf-8");
  const [username, password] = decodedCredentials.split(":");

  const expectedPassword = process.env[username];

  if (!expectedPassword || expectedPassword !== password) {
    return callback(
      null,
      generatePolicy(username, "Deny", event.methodArn, 403)
    );
  }

  return callback(
    null,
    generatePolicy(username, "Allow", event.methodArn, 200)
  );
};

const generatePolicy = (
  principalId: string,
  effect: string,
  resource: string,
  statusCode: number
) => {
  const authResponse: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect as "Allow" | "Deny",
          Resource: resource,
        },
      ],
    },
    context: {
      statusCode: statusCode.toString(),
    },
  };

  return authResponse;
};
