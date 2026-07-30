/**
 * NumberUtil 数字工具类
 * 提供数字格式化功能，如 11100 → 1.11w
 */
export class NumberUtil {
  /**
  * 格式化数量显示
  * >= 10000 显示为 x.xw
  * >= 100000000 显示为 x.xm
  * 小于 10000 直接显示原数
  */
  static formatCount(num: number | null | undefined): string {
    if (num === null || num === undefined) return '0';
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1) + 'm';
    }
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'w';
    }
    return num.toString();
  }
}

export default NumberUtil;
