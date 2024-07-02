# Task 5 (Integration with S3)

1. Task: [aws-developer/05_integration_with_s3/task.md](https://github.com/rolling-scopes-school/aws/blob/main/aws-developer/05_integration_with_s3/task.md)
2. Screenshot:
   ![image](https://github.com/skuzema/aws-backend/assets/70452303/1337d573-09c2-4a22-92f7-f6816dcff808)
   ![image](https://github.com/skuzema/aws-backend/assets/70452303/3c463786-678c-4c1c-bca1-c6ddffbef4be)
   ![image](https://github.com/skuzema/aws-backend/assets/70452303/c1faa711-01d1-40d1-b045-973b703dfb1a)
3. Deploy:
   **FrontEnd:**
   **https://dygwcz719ldx7.cloudfront.net/**
   FrontEnd PR:
   https://github.com/skuzema/nodejs-aws-shop-react/pull/3
   **API importProductsFile (Get signedURL):**
   **GET https://xh6s7nt1ga.execute-api.eu-north-1.amazonaws.com/prod/import?name=test.csv**
4. Done 30.06.2024 / deadline 01.07.2024
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
- `npm run build` compile typescript to js
- `cdk deploy` deploy this stack to your default AWS account/region
- `npm test` run unit test
