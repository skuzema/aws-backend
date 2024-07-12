import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
  Context,
  Callback,
} from "aws-lambda";

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent,
  context: Context,
  callback: Callback<APIGatewayAuthorizerResult>
) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  console.log(
    "event.headers:",
    event.headers,
    !event.headers || !event.headers.Authorization
  );
  if (!event.headers || !event.headers.Authorization) {
    return callback(null, generatePolicy("user", "Deny", event.methodArn, 401));
  }

  const token = event.headers.Authorization.split(" ")[1];
  const decodedCredentials = Buffer.from(token, "base64").toString("utf-8");
  const [username, password] = decodedCredentials.split(":");

  const expectedPassword = process.env[username];

  console.log(
    "expectedPassword:",
    expectedPassword,
    password,
    !expectedPassword || expectedPassword !== password
  );

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
  effect: "Allow" | "Deny",
  resource: string,
  statusCode: number
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
    context: {
      statusCode: statusCode.toString(),
    },
  };

  return authResponse;
};
