import { ShopService } from './shop.service';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '../../libs/common/src/auth/auth.guard';
@Controller('shop')
// @UseGuards(AuthGuard)
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get()
  get() {
    this.shopService.get('oklm');
  }

  @Post('create')
  create(
    @Body('name') name: string,
    @Body('url') url: string,
    @Body('show_city') show_city: boolean,
    @Body('vacation_mode') vacation_mode: boolean,
  ) {
    return this.shopService.create(name, url, show_city, vacation_mode);
  }

  @Post('updateName')
  updateName(@Body('id') id: string, @Body('name') name: string) {
    return this.shopService.updateName(id, name);
  }

  @Post('updateUrl')
  updateUrl(@Body('id') id: string, @Body('url') url: string) {
    return this.shopService.updateUrl(id, url);
  }

  @Post('updateShowCity')
  updateShowCity(
    @Body('id') id: string,
    @Body('show_city') show_city: boolean,
  ) {
    return this.shopService.updateShowCity(id, show_city);
  }

  @Post('updateVacationMode')
  updateVacationMode(
    @Body('id') id: string,
    @Body('vacation_mode') vacation_mode: boolean,
  ) {
    return this.shopService.updateVacationMode(id, vacation_mode);
  }
}
