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
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { BookingDTO } from './dto/booking.dto';
import { BookingService } from './booking.service';
import { ShopService } from 'src/v1/shop/shop.service';
import { CustomerService } from 'src/v1/customer/customer.service';
import { SessionService } from 'src/v1/auth/session/session.service';
import { DbService } from '@app/common/db/db.service';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly customerService: CustomerService,
    private readonly db: DbService,
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
      locations?: Express.Multer.File[];
    },
    @Body() body: BookingDTO,
  ) {
    const shop = await this.shopService.getByUrl(shopUrl);
    if (!shop) {
      throw new NotFoundException();
    }

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const project = await this.bookingService.createProject(
        credentials.id,
        shop.id,
        body,
        client,
      );
      if (body.flashs && body.flashs.length) {
        await Promise.all(
          body.flashs.map((flash) =>
            this.bookingService.addFlashToProject(project.id, flash, client),
          ),
        );
      }
      await this.bookingService.createChatForProject(project.id, client);
      if (body.availabilities.length) {
        await this.bookingService.createAppointments(
          project.id,
          body.availabilities,
          client,
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
      await this.bookingService.generateBill(project.id, client);
      await this.sessionService.refreshSession(credentials.supertokens_id);

      if (files?.illustrations?.length) {
        await this.bookingService.addAttachments(
          project.id,
          files.illustrations,
          'illustration',
          client,
        );
      }

      if (files?.locations?.length) {
        await this.bookingService.addAttachments(
          project.id,
          files.locations,
          'location',
          client,
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
}
