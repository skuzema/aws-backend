import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { APIGatewayProxyHandler } from "aws-lambda";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({});

export const handler: APIGatewayProxyHandler = async (event) => {
  const { name } = event.queryStringParameters || {};
  if (!name) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Name query parameter is required" }),
    };
  }

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `uploaded/${name}`,
  };

  try {
    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (error) {
    console.error("Error creating signed URL:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Could not create signed URL" }),
    };
  }
};
