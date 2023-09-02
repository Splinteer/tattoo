import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { Credentials } from 'src/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/auth/credentials/credentials.service';
import { BookingDTO } from './dto/booking.dto';
import { BookingService } from './booking.service';
import { ShopService } from 'src/shop/shop.service';
import { CustomerService } from 'src/customer/customer.service';
import { SessionService } from 'src/auth/session/session.service';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly customerService: CustomerService,
    private readonly sessionService: SessionService,
    private readonly shopService: ShopService,
  ) {}

  @Post(':shopUrl')
  @UseGuards(new AuthGuard())
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'illustrations' }, { name: 'locations' }]),
  )
  async createBooking(
    @Param('shopUrl') shopUrl: string,
    @Credentials()
    credentials: ICredentials,
    @UploadedFiles()
    files: {
      illustrations?: Express.Multer.File[];
      location?: Express.Multer.File[];
    },
    @Body() body: BookingDTO,
  ) {
    const shop = await this.shopService.getByUrl(shopUrl);
    if (!shop) {
      throw new NotFoundException();
    }

    const project = await this.bookingService.createProject(
      credentials.id,
      shop.id,
      body,
    );
    if (body.flashs.length) {
      await Promise.all(
        body.flashs.map((flash) =>
          this.bookingService.addFlashToProject(project.id, flash),
        ),
      );
    }
    await this.bookingService.createChatForProject(project.id);
    if (body.availabilities.length) {
      await this.bookingService.createAppointments(
        project.id,
        body.availabilities,
      );
    }

    await this.customerService.update(credentials.id, {
      firstname: body.customer_firstname,
      lastname: body.customer_lastname,
      birthday: new Date(body.customer_birthday),
      pronouns: body.customer_pronouns,
      phone: body.customer_phone,
      personal_information: body.customer_personal_information,
      instagram: body.customer_instagram,
      twitter: body.customer_twitter,
      address: body.customer_address,
      address2: body.customer_address2,
      city: body.customer_city,
      zipcode: body.customer_zipcode,
    });
    await this.sessionService.refreshSession(credentials.supertokens_id);
  }
}
