import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { HttpService } from '../../../shared/http/http.service';
import { ConfigurationService } from '../../../config/services/configuration.service';
import { createContextWinston } from '../../../utils/logger.util';
import {
  ContentfulApiResponse,
  ContentfulEntry,
  ContentfulProductFields,
} from '../interface/contentful-product.interface';
import { Products } from '../entities/product.entity';

@Injectable()
export class ContenfulService {
  constructor(
    private readonly configService: ConfigurationService,
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async syncProductsFromApi(): Promise<Partial<Products>[]> {
    const context = createContextWinston(
      this.constructor.name,
      this.syncProductsFromApi.name,
    );
    //
    this.logger.log('Starting Contentful products sync job', context);
    // Get configuration values for Contentful API
    const apiUrl = this.configService.contentfulApi;
    const spaceId = this.configService.contentfulSpaceId;
    const accessToken = this.configService.contentfulAccessToken;
    const environment = this.configService.contentfulEnvironment;
    const contentType = this.configService.contentfulContentType;
    //
    // Make API call to Contentful
    const result = await this.httpService.get<
      ContentfulApiResponse<ContentfulProductFields>
    >(
      `${apiUrl}/spaces/${spaceId}/environments/${environment}/entries?access_token=${accessToken}&content_type=${contentType}`,
    );
    //
    // Check if we got data
    const itemsCount = result.data.items?.length || 0;
    // If no items, return empty array
    if (itemsCount === 0) return [];

    // Transform each item from Contentful format to our product format
    const products: Partial<Products>[] = result.data.items.map(
      (item: ContentfulEntry<ContentfulProductFields>) =>
        this.mapContentfulToProduct(item),
    );

    return products;
  }

  private mapContentfulToProduct(
    contentfulProduct: ContentfulEntry<ContentfulProductFields>,
  ): Partial<Products> {
    const fields = contentfulProduct.fields;
    return {
      externalId: contentfulProduct.sys.id,
      sku: fields.sku,
      name: fields.name,
      brand: fields.brand,
      model: fields.model,
      category: fields.category,
      color: fields.color,
      price: fields.price,
      currency: fields.currency,
      stock: fields.stock,
    };
  }
}
