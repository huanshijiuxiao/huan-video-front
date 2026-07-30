/**
 * TimeUtil 时间工具类
 * 提供各种日期时间格式化和计算功能
 */
export class TimeUtil {
    /**
     * 将日期格式化为标准格式 (YYYY-MM-DD HH:MM:SS)
     * @param date 日期对象、时间戳或日期字符串
     * @param includeSeconds 是否包含秒 (默认: true)
     * @returns 格式化后的日期字符串，无效日期返回空字符串
     */
    static formatDateTime(date: Date | number | string | null | undefined, includeSeconds: boolean = true): string {
      if (date === null || date === undefined || date === '') {
        return '';
      }
  
      try {
        const dateObj = new Date(date);
        
        // 检查是否是有效日期
        if (isNaN(dateObj.getTime())) {
          return '';
        }
  
        const year = dateObj.getFullYear();
        // 确保月份和日期是两位数
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        
        if (includeSeconds) {
          const seconds = String(dateObj.getSeconds()).padStart(2, '0');
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } else {
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
      } catch (error) {
        console.error('Date formatting error:', error);
        return '';
      }
    }
  
    /**
     * 将日期格式化为中文格式 (YYYY年MM月DD日 HH时MM分)
     * @param date 日期对象、时间戳或日期字符串
     * @param includeSeconds 是否包含秒 (默认: false)
     * @returns 格式化后的中文日期字符串，无效日期返回空字符串
     */
    static formatDateTimeChinese(date: Date | number | string | null | undefined, includeSeconds: boolean = false): string {
      if (date === null || date === undefined || date === '') {
        return '';
      }
  
      try {
        const dateObj = new Date(date);
        
        // 检查是否是有效日期
        if (isNaN(dateObj.getTime())) {
          return '';
        }
  
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();
        
        if (includeSeconds) {
          const seconds = dateObj.getSeconds();
          return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
        } else {
          return `${year}年${month}月${day}日 ${hours}:${minutes}`;
        }
      } catch (error) {
        console.error('Date formatting error:', error);
        return '';
      }
    }
  
    /**
     * 格式化时间范围，以中文格式显示开始和结束时间
     * @param start 开始日期
     * @param end 结束日期
     * @returns 格式化后的时间范围字符串
     */
    static formatDateTimeRange(start: Date | number | string | null | undefined, end: Date | number | string | null | undefined): string {
      const startStr = this.formatDateTimeChinese(start);
      const endStr = this.formatDateTimeChinese(end);
      
      if (!startStr && !endStr) return '';
      if (!startStr) return endStr;
      if (!endStr) return startStr;
      
      return `${startStr} ~ ${endStr}`;
    }
  
    /**
     * 计算并格式化时间与当前时间的相对差值
     * 如"刚刚"、"5分钟前"、"2小时前"、"3天前"等
     * @param date 要比较的日期
     * @returns 相对时间字符串
     */
    static timeAgo(date: Date | number | string | null | undefined): string {
      if (date === null || date === undefined || date === '') {
        return '';
      }
  
      try {
        const dateObj = new Date(date);
        
        // 检查是否是有效日期
        if (isNaN(dateObj.getTime())) {
          return '';
        }
  
        const now = new Date().getTime();
        const timestamp = dateObj.getTime();
        const diffSeconds = Math.floor((now - timestamp) / 1000);
        
        // 判断时间是否是未来
        if (diffSeconds < 0) {
          return this.formatDateTime(date);
        }
  
        // 刚刚
        if (diffSeconds < 60) {
          return diffSeconds === 0 ? '刚刚' : `${diffSeconds}秒前`;
        }
        
        // 分钟前
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) {
          return `${diffMinutes}分钟前`;
        }
        
        // 小时前
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) {
          return `${diffHours}小时前`;
        }
        
        // 天前 (最多显示30天)
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 30) {
          return `${diffDays}天前`;
        }
        
        // 超过30天显示完整日期
        return this.formatDateTime(date);
      } catch (error) {
        console.error('Date calculation error:', error);
        return '';
      }
    }
  
    /**
     * 将秒数转换为时长格式 (HH:MM:SS 或 MM:SS)
     * @param seconds 秒数
     * @param alwaysShowHours 是否始终显示小时部分
     * @returns 格式化后的时长字符串
     */
    static formatDuration(seconds: number | string | null | undefined, alwaysShowHours: boolean = false): string {
      if (seconds === null || seconds === undefined || seconds === '') {
        return '';
      }
  
      try {
        // 确保输入是数字
        const totalSeconds = Number(seconds);
        
        if (isNaN(totalSeconds) || totalSeconds < 0) {
          return '';
        }
  
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = Math.floor(totalSeconds % 60);
        
        // 根据格式需求返回不同的字符串
        if (hours > 0 || alwaysShowHours) {
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        } else {
          return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        }
      } catch (error) {
        console.error('Duration formatting error:', error);
        return '';
      }
    }
  
    /**
     * 格式化为仅日期部分 (YYYY-MM-DD)
     * @param date 日期对象、时间戳或日期字符串
     * @returns 格式化后的日期字符串
     */
    static formatDate(date: Date | number | string | null | undefined): string {
      if (date === null || date === undefined || date === '') {
        return '';
      }
  
      try {
        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) {
          return '';
        }
  
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error('Date formatting error:', error);
        return '';
      }
    }
  
    /**
     * 格式化为仅时间部分 (HH:MM:SS)
     * @param date 日期对象、时间戳或日期字符串
     * @param includeSeconds 是否包含秒 (默认: true)
     * @returns 格式化后的时间字符串
     */
    static formatTime(date: Date | number | string | null | undefined, includeSeconds: boolean = true): string {
      if (date === null || date === undefined || date === '') {
        return '';
      }
  
      try {
        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) {
          return '';
        }
  
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        
        if (includeSeconds) {
          const seconds = String(dateObj.getSeconds()).padStart(2, '0');
          return `${hours}:${minutes}:${seconds}`;
        } else {
          return `${hours}:${minutes}`;
        }
      } catch (error) {
        console.error('Time formatting error:', error);
        return '';
      }
    }
    
    /**
     * 获取当前日期时间的字符串表示
     * @param format 格式化类型: 'date' | 'time' | 'datetime' | 'chinese'
     * @returns 当前日期时间的字符串
     */
    static now(format: 'date' | 'time' | 'datetime' | 'chinese' = 'datetime'): string {
      const now = new Date();
      
      switch (format) {
        case 'date':
          return this.formatDate(now);
        case 'time':
          return this.formatTime(now);
        case 'chinese':
          return this.formatDateTimeChinese(now);
        case 'datetime':
        default:
          return this.formatDateTime(now);
      }
    }
    
    /**
     * 检查日期是否是今天
     * @param date 要检查的日期
     * @returns 是否是今天
     */
    static isToday(date: Date | number | string): boolean {
      try {
        const dateObj = new Date(date);
        const today = new Date();
        
        return (
          dateObj.getDate() === today.getDate() &&
          dateObj.getMonth() === today.getMonth() &&
          dateObj.getFullYear() === today.getFullYear()
        );
      } catch (error) {
        return false;
      }
    }
    
    /**
     * 计算两个日期之间的天数差
     * @param date1 第一个日期
     * @param date2 第二个日期 (默认为当前日期)
     * @returns 天数差值
     */
    static daysBetween(date1: Date | number | string, date2: Date | number | string = new Date()): number {
      try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        
        // 将时间部分重置为0，只比较日期部分
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);
        
        // 计算毫秒差并转换为天数
        const diffMs = Math.abs(d2.getTime() - d1.getTime());
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      } catch (error) {
        console.error('Day calculation error:', error);
        return NaN;
      }
    }
  }
  
  // 为了保持向后兼容，提供与旧函数名相同的导出函数
  export const renderTime = (date: Date | number | string | null | undefined): string => 
    TimeUtil.formatDateTime(date);
  
  export const formateTimeToChinese = (date: Date | number | string | null | undefined): string => 
    TimeUtil.formatDateTimeChinese(date);
  
  export const formateTime = (start: Date | number | string | null | undefined, end: Date | number | string | null | undefined): string => 
    TimeUtil.formatDateTimeRange(start, end);
  
  export const timeToNowStrning = (date: Date | number | string | null | undefined): string => 
    TimeUtil.timeAgo(date);
  
  export const timeCover = (seconds: number | string | null | undefined): string => 
    TimeUtil.formatDuration(seconds);
  
// 默认导出整个工具类
export default TimeUtil;
  