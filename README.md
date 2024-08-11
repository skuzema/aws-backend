# Task 10 (Backend For Frontend)

1. Task: [Task 10 (Backend For Frontend)](https://github.com/rolling-scopes-school/aws/blob/main/aws-developer/10_backend_for_frontend/task.md)
2. Screenshot:
3. Deploy:
   **FrontEnd: https://dygwcz719ldx7.cloudfront.net/**
   **FrontEnd PR: https://github.com/skuzema/nodejs-aws-shop-react/pull/6**
4. Done 11.08.2024 / deadline 12.08.2024
5. Score: 80 / 100

- [x] Evaluation criteria (80 points for covering all criteria)
  - [x] link to the repo
        **https://github.com/skuzema/aws-backend/tree/task10**
  - [x] Product Service API URL
        **https://ecy2nn2cgk.execute-api.eu-north-1.amazonaws.com/prod**
  - [x] Cart Service API URL
        **https://vtxrcdhyeh.execute-api.eu-north-1.amazonaws.com/api**
  - [x] BFF Service API URL
        **http://skuzema-bff-api.eu-north-1.elasticbeanstalk.com**
        HTTPS proxy: **https://xflalntnt9.execute-api.eu-north-1.amazonaws.com**
  - [x] example of how to call createProduct lambda with all needed information: URL, payload, headers, etc.
        **POST https://ecy2nn2cgk.execute-api.eu-north-1.amazonaws.com/prod/products**
        {
        "title": "TestProductTitle",
        "description": "Test Product Description",
        "count": 10,
        "price": 111.00
        }
  - [x] example how to call Product Service and Cart Service via BFF Service URL
        **Product Service: GET http://skuzema-bff-api.eu-north-1.elasticbeanstalk.com/product/products**
        **Cart Service:**
        Authorization: Basic dXNlcjE6cGFzc3dvcmQx
        **GET http://skuzema-bff-api.eu-north-1.elasticbeanstalk.com/cart/api/profile**
- [ ] Additional (optional) tasks (20 points)
  - [ ] _+20 (All languages)_ - Add a cache at the BFF Service level for a request to the getProductsList lambda function of the Product Service. The cache should expire in 2 minutes.

## How to start

- clone repository
- `npm i` install packages
- `npm run build` compile typescript to js
- `cdk deploy` deploy this stack to your default AWS account/region
- `npm test` run unit test
