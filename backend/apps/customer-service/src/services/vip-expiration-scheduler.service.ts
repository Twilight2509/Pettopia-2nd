import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { AppService } from './app.service';
import { VIP_EXPIRATION_JOB_INTERVAL_MS } from 'src/common/vip.constants';

/** Định kỳ gỡ VIP cho các tài khoản đã hết hạn */
@Injectable()
export class VipExpirationSchedulerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(VipExpirationSchedulerService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly appService: AppService) {}

  onModuleInit(): void {
    void this.expireVipUsers();
    this.timer = setInterval(
      () => void this.expireVipUsers(),
      VIP_EXPIRATION_JOB_INTERVAL_MS,
    );
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async expireVipUsers(): Promise<void> {
    try {
      const { expiredCount } = await this.appService.expireVipUsers();
      if (expiredCount) {
        this.logger.log(`Đã gỡ VIP cho ${expiredCount} tài khoản hết hạn`);
      }
    } catch (error) {
      this.logger.error('Lỗi khi xử lý VIP hết hạn', error as Error);
    }
  }
}
