namespace TIME_DEFINE{
  export const TO_FIXED_PARAM     : number = 3;
}
export class TimerHelper{

  /**
   * 今日の Date Object 取得
   * @return {Date} 現在の Date オブジェクト
   */
  public static get now():Date{
    return new Date();
  }

  /**
   * Date オブジェクトを YYYY-mm-dd フォーマットに変換
   * @param  {Date = null} target 対象となる Date Object
   * @return {string} YYYY-mm-dd フォーマットへの変換
   */
  public static toDateString( target : Date = null ):string{
    let obj  = ( target === null )? new Date() : target;
    let year  : string = obj.getFullYear().toString();
    let month : string = (TimerHelper._padZero(obj.getMonth() + 1)).toString();
    let day   : string = TimerHelper._padZero(obj.getDate()).toString();
    return `${year}-${month}-${day}`;
  }

  /**
   * YYYY-mm-dd フォーマットの文字列を整数値に変換する
   * @param  {string} str YYYY-mm-dd フォーマットの文字列
   * @return {number} YYYYmmdd の整数値
   */
  public static toDateNumber( str:string ):number{
    return Number(str.replace(/-/g,''));
  }

  /**
   * 秒の hh:mm:ss フォーマット変換
   * @param  {number} sec 秒の整数値
   * @return {string} hh:mm:ss フォーマットの文字列
   */
  public static toTimeString( sec : number ):string{
  	let h :number = sec / 3600 | 0;
  	let m :number = sec % 3600 / 60 | 0;
  	let s :number = sec % 60;
    return this._padZero(h)
          + ":" + this._padZero(m)
          + ":" + this._padZero(s,true)
          ;
  }

  /**
   * 値の 0 埋め
   * @param  {number} num 整数値
   * @param  {boolean =   false}  enableFixed 小数点以下を表示するか否か
   * @return {string} 0 埋めした文字列
   */
  private static _padZero( num:number, enableFixed:boolean = false) :string{
		if( num < 10 ) {
      if(enableFixed){
        return "0" + num.toFixed( TIME_DEFINE.TO_FIXED_PARAM );
      }else{
        return "0" + num.toString();
      }
		} else {
      if(enableFixed){
        return num.toFixed( TIME_DEFINE.TO_FIXED_PARAM );
      }else{
        return num.toString();
      }
		}
	}

}
