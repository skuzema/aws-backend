import { Controller, All, Req, Res, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import axios from 'axios';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

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

    const serviceUrl = serviceUrls[serviceName];

    if (!serviceUrl) {
      return res
        .status(502)
        .json({ message: 'Cannot process request: Unknown service' });
    }

    try {
      const authToken = req.headers['authorization'] || process.env.AUTH_TOKEN;

      const cert = fs.readFileSync(path.resolve(__dirname, '../ca/cert.pem'));
      const key = fs.readFileSync(path.resolve(__dirname, '../ca/key.pem'));
      const ca = fs.readFileSync(path.resolve(__dirname, '../ca/ca.key'));

      const response = await axios({
        method: req.method,
        url: `${serviceUrl}${req.originalUrl.replace(`/${serviceName}`, '')}`,
        data: req.body,
        headers: {
          ...req.headers,
          Authorization: `Basic ${authToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        httpsAgent: new https.Agent({
          // cert: ca,
          // key: key,
          ca: ca,
          rejectUnauthorized: false,
          secureProtocol: 'TLSv1_2_method',
          ciphers: 'DEFAULT:@SECLEVEL=0',
        }),
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      res
        .status(error.response?.status || 500)
        .json({ message: error.message });
    }
  }
}
