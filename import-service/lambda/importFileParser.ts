import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { S3Event, Handler } from "aws-lambda";
import { Readable } from "stream";
import csv from "csv-parser";

const s3Client = new S3Client({});
const sqsClient = new SQSClient({});
const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

export const handler: Handler = async (event: S3Event) => {
  console.log("StartI CSV file process");
  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;

    const getObjectParams = {
      Bucket: bucketName,
      Key: objectKey,
    };

    try {
      const getObjectCommand = new GetObjectCommand(getObjectParams);
      const { Body } = await s3Client.send(getObjectCommand);

      if (!Body) {
        throw new Error("Object Body is empty");
      }

      const stream = Body as Readable;

      const parseCSV = new Promise<void>((resolve, reject) => {
        stream
          .pipe(csv())
          .on("data", async (data) => {
            const sendMessageCommand = new SendMessageCommand({
              QueueUrl: SQS_QUEUE_URL,
              MessageBody: JSON.stringify(data),
            });

            await sqsClient.send(sendMessageCommand);
          })
          .on("end", () => {
            console.log("CSV file successfully processed");
            resolve();
          })
          .on("error", (error) => {
            console.error("Error processing CSV file:", error);
            reject(error);
          });
      });

      await parseCSV;

      const parsedKey = objectKey.replace("uploaded/", "parsed/");

      const copyObjectParams = {
        Bucket: bucketName,
        CopySource: `${bucketName}/${objectKey}`,
        Key: parsedKey,
      };

      const copyCommand = new CopyObjectCommand(copyObjectParams);
      await s3Client.send(copyCommand);
      console.log(`File copied to ${parsedKey}`);

      const deleteObjectParams = {
        Bucket: bucketName,
        Key: objectKey,
      };

      const deleteCommand = new DeleteObjectCommand(deleteObjectParams);
      await s3Client.send(deleteCommand);

      console.log(`File deleted from ${objectKey}`);
    } catch (error) {
      console.error("Error processing S3 event:", error);
    }
  }
};
