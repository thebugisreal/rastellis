import { formatMoney } from '@shopify/theme-currency'

export default (val) =>
  formatMoney(val, window.theme.moneyFormat || '${{amount}}')
