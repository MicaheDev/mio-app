export interface CashRegisterDTO{
  transfer_id: string
  cash_bills: CashBillsDTO[]
}

export interface CashBillsDTO{
  denomination: number,
  serial_code: string
}
