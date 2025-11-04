export interface CashRegisterDTO{
  transfer_id: string
  cash_bills: CashBillsDTO[]
  cash_photo_url: string
}

export interface CashBillsDTO{
  denomination: number,
  serial_code: string
}
