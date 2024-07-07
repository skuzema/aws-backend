# Task 7 (Authorization)

1. Task: [Task 7 (Authorization)](https://github.com/rolling-scopes-school/aws/blob/main/aws-developer/07_authorization/task.md)
2. Screenshot:
3. Deploy:
   **FrontEnd: https://dygwcz719ldx7.cloudfront.net/**
   **FrontEnd PR: https://github.com/skuzema/nodejs-aws-shop-react/pull/3**
4. Done 14.07.2024 / deadline 15.07.2024
5. Score: 100 / 100

- [x] Evaluation criteria (70 points for covering all criteria)
      Provide your reviewers with the link to the repo, client application and URLs to execute the /import path of the Import Service`
  - [x] authorization-service is added to the repo, has correct basicAuthorizer lambda and correct AWS CDK Stack
  - [x] Import Service AWS CDK Stack has authorizer configuration for the importProductsFile lambda. Request to the importProductsFile lambda should work only with correct authorization_token being decoded and checked by basicAuthorizer lambda. Response should be in 403 HTTP status if access is denied for this user (invalid authorization_token) and in 401 HTTP status if Authorization header is not provided.
  - [x] Client application is updated to send "Authorization: Basic authorization_token" header on import. Client should get authorization_token value from browser localStorage
- [x] Additional (optional) tasks (30 points)
  - [x] _+30 (All languages)_ - Client application should display alerts for the responses in 401 and 403 HTTP statuses. This behavior should be added to the nodejs-aws-fe-main/src/index.tsx file.

## How to start

- clone repository
- `npm i` install packages
- `npm run build` compile typescript to js
- `cdk deploy` deploy this stack to your default AWS account/region
- `npm test` run unit test
