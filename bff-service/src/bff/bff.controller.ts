import { Controller, All, Req, Res, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import axios from 'axios';
import * as https from 'https';

@Controller(':serviceName')
export class BffController {
  constructor(private readonly configService: ConfigService) {}

  @All('*')
  async proxyRequest(
    @Param('serviceName') serviceName: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const serviceUrls = {
      product: this.configService.get<string>('PRODUCT_SERVICE_URL'),
      cart: this.configService.get<string>('CART_SERVICE_URL'),
    };

    console.log('serviceName:', serviceName);
    const serviceUrl = serviceUrls[serviceName];
    console.log('serviceUrl:', serviceUrl);

    if (!serviceUrl) {
      return res.status(502).send('Cannot process request: Unknown service');
    }

    try {
      const authToken = req.headers['authorization'] || process.env.AUTH_TOKEN;

      if (!authToken) {
        return res.status(401).send('Authorization token is missing');
      }

      const response = await axios({
        method: req.method,
        url: `${serviceUrl}${req.originalUrl.replace(`/${serviceName}`, '')}`,
        data: req.body,
        headers: {
          ...req.headers,
          Authorization: `Basic ${authToken}`,
          'Content-Type': 'application/json',
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
          secureProtocol: 'TLSv1_2_method',
          ciphers: 'DEFAULT:@SECLEVEL=0',
        }),
      });

      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).send(error.message);
    }
  }
}
