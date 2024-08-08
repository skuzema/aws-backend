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

    const serviceUrl = serviceUrls[serviceName];

    if (!serviceUrl) {
      return res.status(502).send('Cannot process request: Unknown service');
    }

    try {
      const response = await axios({
        method: req.method,
        url: `${serviceUrl}${req.originalUrl.replace(`/${serviceName}`, '')}`,
        data: req.body,
        headers: req.headers,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });

      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).send(error.message);
    }
  }
}
