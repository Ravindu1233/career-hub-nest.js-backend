import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';

@Global() // ← makes MailService available everywhere without re-importing
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
