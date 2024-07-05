# Task 6 (SQS & SNS, Async Microservices Communication)

1. Task: [Task 6 (SQS & SNS, Async Microservices Communication)](https://github.com/rolling-scopes-school/aws/blob/main/aws-developer/06_async_microservices_communication/task.md)
2. Screenshot:
   ![image](https://github.com/skuzema/aws-backend/assets/70452303/1224abce-61a4-49fc-8ae6-46c30af95c49)
3. Deploy:
   **FrontEnd: https://dygwcz719ldx7.cloudfront.net/**
   **FrontEnd PR: https://github.com/skuzema/nodejs-aws-shop-react/pull/3**
4. Done 07.07.2024 / deadline 08.07.2024
5. Score: 100 / 100

- [x] Evaluation criteria (70 points for covering all criteria)
  - [x] AWS CDK Stack contains configuration for catalogBatchProcess function
  - [x] AWS CDK Stack contains policies to allow lambda catalogBatchProcess function to interact with SNS and SQS
  - [x] AWS CDK Stack contains configuration for SQS catalogItemsQueue
  - [x] AWS CDK Stack contains configuration for SNS Topic createProductTopic and email subscription
- [x] Additional (optional) tasks (30 points)
  - [x] _+15 (All languages)_ - catalogBatchProcess lambda is covered by unit tests

![image](https://github.com/skuzema/aws-backend/assets/70452303/c086e448-f1a8-4c0b-8b10-c053aed94465)

- [x] _+15 (All languages)_ - set a Filter Policy for SNS createProductTopic in AWS CDK Stack and create an additional email subscription to distribute messages to different emails depending on the filter for any product attribute.
      **Emails distributed by product price: if price < 100: it's send to email Nr.1, if price >=100: to email Nr.2**
      ![image](https://github.com/skuzema/aws-backend/assets/70452303/c36c9798-cd9a-41df-890d-7e689fed326e)
      ![image](https://github.com/skuzema/aws-backend/assets/70452303/52d7885e-6a6c-4321-9ad2-6487f3ea6a82)

## How to start

- clone repository
- `npm i` install packages
- `npm run build` compile typescript to js
- `cdk deploy` deploy this stack to your default AWS account/region
- `npm test` run unit test
