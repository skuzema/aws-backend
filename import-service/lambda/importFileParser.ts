import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { S3Event, Handler } from "aws-lambda";
import { Readable } from "stream";
import csv from "csv-parser";

const s3Client = new S3Client({});

export const handler: Handler = async (event: S3Event) => {
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
      stream
        .pipe(csv())
        .on("data", (data) => {
          console.log("Record:", data);
        })
        .on("end", async () => {
          console.log("CSV file successfully processed");

          const parsedKey = objectKey.replace("uploaded/", "parsed/");

          const copyObjectParams = {
            Bucket: bucketName,
            CopySource: `${bucketName}/${objectKey}`,
            Key: parsedKey,
          };

          const copyCommand = new CopyObjectCommand(copyObjectParams);
          await s3Client.send(copyCommand);

          const deleteObjectParams = {
            Bucket: bucketName,
            Key: objectKey,
          };

          const deleteCommand = new DeleteObjectCommand(deleteObjectParams);
          await s3Client.send(deleteCommand);

          console.log(
            `File moved to ${parsedKey} and deleted from ${objectKey}`
          );
        })
        .on("error", (error) => {
          console.error("Error processing CSV file:", error);
        });
    } catch (error) {
      console.error("Error processing S3 event:", error);
    }
  }
};
