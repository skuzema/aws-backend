# Task 4 (Integration with NoSQL Database)

1. Task: aws-developer/04_integration_with_nosql_database/task.md
2. Screenshot:
   ![image](https://github.com/skuzema/aws-backend/assets/70452303/8a1c87ed-3b22-4ea7-819c-3f52a32850f3)
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
  - [x] Task 4.1 is implemented. Command: **npm run fill-tables**.
  - [x] Task 4.2 is implemented lambda links are provided and returns data
  - [x] Task 4.3 is implemented lambda links are provided and products is stored in DB (call Task 4.2 to see the product). Your own Frontend application is integrated with Product Service (/products API) and products from Product Service are represented on Frontend. Link to a working Frontend application is provided for cross-check reviewer: https://dygwcz719ldx7.cloudfront.net/
- [x] Additional (optional) tasks (30 points)
  - [x] _+7.5 (All languages)_ - POST /products lambda functions returns error 400 status code if product data is invalid
  - [x] _+7.5 (All languages)_ - All lambdas return error 500 status code on any error (DB connection, any unhandled error in code)
  - [x] _+7.5 (All languages)_ - All lambdas do console.log for each incoming requests and their arguments
  - [x] _+7.5 (All languages)_ - Transaction based creation of product (in case stock creation is failed then related to this stock product is not created and not ready to be used by the end user and vice versa)

## How to start

- clone repository
- `npm i` install packages
- `npm run fill-tables` populate tables with sample data
- `npm run build` compile typescript to js
- `cdk deploy` deploy this stack to your default AWS account/region
