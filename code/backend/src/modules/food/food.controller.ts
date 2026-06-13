import { Controller, Get, Post, Body } from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';

@Controller('foods')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  async create(@Body() dto: CreateFoodDto) {
    return this.foodService.create(dto);
  }

  @Get()
  async findAll() {
    return this.foodService.findAll();
  }
}
