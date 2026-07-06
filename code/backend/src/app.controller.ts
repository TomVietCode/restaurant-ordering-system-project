import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service.js';
import { Public } from './common/decorators/index.js';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('menu')
  getMenu() {
    return {
      categories: [
        { category_id: 1, name: 'Cà phê Phin API', description: 'Cà phê truyền thống đậm đà bản sắc (From API)' },
        { category_id: 2, name: 'Trà Sữa & Macchiato API', description: 'Trà sữa đậm vị, béo ngậy' },
      ],
      products: [
        {
          item_id: 101,
          name: 'Cà phê Đen Đá (API)',
          category_id: 1,
          price: 29000,
          is_remain: true,
          images_url: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80'],
          description: 'Cà phê robusta rang mộc nguyên chất, đậm vị đắng. (Fetched from API)',
        },
        {
          item_id: 201,
          name: 'Trà Sữa Oolong Nướng (API)',
          category_id: 2,
          price: 55000,
          is_remain: true,
          images_url: ['https://images.unsplash.com/photo-1558857563-b37102e96041?w=500&q=80'],
        }
      ]
    };
  }
}
