# Task 5 (Integration with S3)

1. Task: [aws-developer/05_integration_with_s3/task.md](https://github.com/rolling-scopes-school/aws/blob/main/aws-developer/05_integration_with_s3/task.md)
2. Screenshot:
3. Deploy:
   FrontEnd:
   https://dygwcz719ldx7.cloudfront.net/

   FrontEnd PR:
   https://github.com/skuzema/nodejs-aws-shop-react/pull/2

   API:
   https://ecy2nn2cgk.execute-api.eu-north-1.amazonaws.com/prod/products

   https://ecy2nn2cgk.execute-api.eu-north-1.amazonaws.com/prod/products/f371e24c-dbdf-4ff8-a6c2-12c6cdfaf275

   CreateProduct URL:
   **POST https://ecy2nn2cgk.execute-api.eu-north-1.amazonaws.com/prod/products**

4. Done 22.06.2024 / deadline 24.06.2024
5. Score: 100 / 100

- [x] Evaluation criteria (70 points for covering all criteria)
  - [x] AWS CDK Stack contains configuration for importProductsFile function
  - [x] The importProductsFile lambda function returns a correct response which can be used to upload a file into the S3 bucket
  - [x] Frontend application is integrated with importProductsFile lambda: https://dygwcz719ldx7.cloudfront.net/
  - [x] The importFileParser lambda function is implemented and AWS CDK Stack contains configuration for the lambda
- [x] Additional (optional) tasks (30 points)
  - [x] _+10 (All languages)_ - importProductsFile lambda is covered by unit tests. You should consider to mock S3 and other AWS SDK methods so not trigger actual AWS services while unit testing.
  - [x] _+10 (All languages)_ - importFileParser lambda is covered by unit tests.
  - [x] _+10 (All languages)_ - At the end of the stream the lambda function should move the file from the uploaded folder into the parsed folder (move the file means that file should be copied into a new folder in the same bucket called parsed, and then deleted from uploaded folder)

## How to start

- clone repository
- `npm i` install packages
- `npm run fill-tables` populate tables with sample data
- `npm run build` compile typescript to js
- `cdk deploy` deploy this stack to your default AWS account/region
