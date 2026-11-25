import { AppointmentStatus } from 'src/schemas/appoinment.schema';

/** Trạng thái chiếm 1 slot trong ca khám */
export const APPOINTMENT_SLOT_OCCUPYING_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.Pending_Confirmation,
  AppointmentStatus.Confirmed,
  AppointmentStatus.Checked_In,
  AppointmentStatus.In_Progress,
  AppointmentStatus.Completed,
];

/** Chuyển trạng thái hợp lệ: from -> các trạng thái được phép chuyển tới */
export const APPOINTMENT_STATUS_TRANSITIONS: Record<
  AppointmentStatus,
  AppointmentStatus[]
> = {
  [AppointmentStatus.Pending_Confirmation]: [
    AppointmentStatus.Confirmed,
    AppointmentStatus.Cancelled,
  ],
  [AppointmentStatus.Confirmed]: [
    AppointmentStatus.Checked_In,
    AppointmentStatus.Cancelled,
    AppointmentStatus.No_Show,
  ],
  [AppointmentStatus.Checked_In]: [
    AppointmentStatus.In_Progress,
    AppointmentStatus.Cancelled,
  ],
  [AppointmentStatus.In_Progress]: [AppointmentStatus.Completed],
  [AppointmentStatus.Completed]: [],
  [AppointmentStatus.Cancelled]: [],
  [AppointmentStatus.No_Show]: [],
};

/** Khách hàng chỉ được tự huỷ khi lịch chưa check-in */
export const APPOINTMENT_USER_CANCELLABLE_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.Pending_Confirmation,
  AppointmentStatus.Confirmed,
];

/** Trạng thái cho thấy bác sĩ đang bận khám */
export const APPOINTMENT_VET_BUSY_STATUSES: AppointmentStatus[] = [
  AppointmentStatus.In_Progress,
];

export const APPOINTMENT_AUTO_CANCEL_REASON =
  'Tự động huỷ: phòng khám không xác nhận trước ngày hẹn';

/** Chu kỳ chạy job dọn lịch quá hạn (ms) — mặc định 1 giờ */
export const APPOINTMENT_STALE_JOB_INTERVAL_MS = 60 * 60 * 1000;
