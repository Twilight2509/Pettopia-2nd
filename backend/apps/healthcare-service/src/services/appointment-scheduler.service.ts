import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repositories';
import { AppointmentStatus } from '../schemas/appoinment.schema';
import {
  APPOINTMENT_AUTO_CANCEL_REASON,
  APPOINTMENT_STALE_JOB_INTERVAL_MS,
} from 'src/common/appointment.constants';

/**
 * Dọn lịch hẹn đã qua ngày mà chưa được xử lý:
 * - Confirmed nhưng khách không đến -> No_Show
 * - Pending_Confirmation mà phòng khám chưa xác nhận -> Cancelled
 */
@Injectable()
export class AppointmentSchedulerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(AppointmentSchedulerService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly appointmentRepositories: AppointmentRepository) {}

  onModuleInit(): void {
    void this.processStaleAppointments();
    this.timer = setInterval(
      () => void this.processStaleAppointments(),
      APPOINTMENT_STALE_JOB_INTERVAL_MS,
    );
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async processStaleAppointments(): Promise<void> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    try {
      const noShow = await this.appointmentRepositories.updateStatusForDateBefore(
        todayStart,
        [AppointmentStatus.Confirmed],
        AppointmentStatus.No_Show,
      );
      const autoCancelled =
        await this.appointmentRepositories.updateStatusForDateBefore(
          todayStart,
          [AppointmentStatus.Pending_Confirmation],
          AppointmentStatus.Cancelled,
          APPOINTMENT_AUTO_CANCEL_REASON,
        );

      if (noShow || autoCancelled) {
        this.logger.log(
          `Đã chuyển ${noShow} lịch sang No_Show, tự hủy ${autoCancelled} lịch chưa xác nhận`,
        );
      }
    } catch (error) {
      this.logger.error('Lỗi khi xử lý lịch hẹn quá hạn', error as Error);
    }
  }
}
