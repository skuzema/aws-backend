# Task 6 (SQS & SNS, Async Microservices Communication)

1. Task: [aws-developer/05_integration_with_s3/task.md](https://github.com/rolling-scopes-school/aws/blob/main/aws-developer/06_async_microservices_communication/task.md)
2. Screenshot:
3. Deploy:
   **FrontEnd:**
   **https://dygwcz719ldx7.cloudfront.net/**
   FrontEnd PR:
   https://github.com/skuzema/nodejs-aws-shop-react/pull/3
4. Done 02.07.2024 / deadline 08.07.2024
5. Score: 100 / 100

- [x] Evaluation criteria (70 points for covering all criteria)
  - [x] AWS CDK Stack contains configuration for catalogBatchProcess function
  - [x] AWS CDK Stack contains policies to allow lambda catalogBatchProcess function to interact with SNS and SQS
  - [x] AWS CDK Stack contains configuration for SQS catalogItemsQueue
  - [x] AWS CDK Stack contains configuration for SNS Topic createProductTopic and email subscription
- [x] Additional (optional) tasks (30 points)
  - [x] _+15 (All languages)_ - catalogBatchProcess lambda is covered by unit tests
  - [x] _+15 (All languages)_ - set a Filter Policy for SNS createProductTopic in AWS CDK Stack and create an additional email subscription to distribute messages to different emails depending on the filter for any product attribute

## How to start

- clone repository
- `npm i` install packages
- `npm run build` compile typescript to js
- `cdk deploy` deploy this stack to your default AWS account/region
- `npm test` run unit test
