import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { APIGatewayProxyHandler } from "aws-lambda";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log("Start importProductsFile.ts");
  const { name } = event.queryStringParameters || {};
  if (!name) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify({ message: "Name query parameter is required" }),
    };
  }

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `uploaded/${name}`,
  };

  try {
    console.log("ImportProductsFile, start try");
    const command = new PutObjectCommand(params);
    console.log("ImportProductsFile, command:", command);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    console.log("ImportProductsFile, signedUrl:", signedUrl);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (error) {
    console.error("Error creating signed URL:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify({ message: "Could not create signed URL" }),
    };
  }
};
