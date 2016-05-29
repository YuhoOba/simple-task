import {Injectable} from '@angular/core';
import {Storage, LocalStorage} from 'ionic-angular';
import {TimerHelper} from '../../helpers/timer-helper';
import {BaseCollection} from '../../providers/base-collection/base-collection';

/**
 * タスクの状態定数
 */
namespace TASK_STATUS{

  /**
   * 未処理
   * @type {number}
   */
  export const NONE          : number = 0;

  /**
   * 処理中
   * @type {number}
   */
  export const AWAKE         : number = 1;

  /**
   * 完了
   * @type {number}
   */
  export const END           : number = 2;

  /**
   * 中断
   * @type {number}
   */
  export const INTERRUPTION  : number = 3;
}

/**
 * タスクの汎用定数
 */
namespace TASK_DEFINE{

  /**
   * カウントダウン処理の実行頻度( ミリ秒 )
   * @type {number}
   */
  export const INTERVAL_MSEC      : number = 10;

  /**
   * 既定の時間文字列
   * @type {string}
   */
  export const DEFAULT_TIME_VALUE : string = '00:00';
}

/**
 * タスクデータモデルのインターフェイス
 */
interface ITaskModel{

  /**
   * タスクID
   * @type {number}
   */
  id           : number;

  /**
   * タスクタイトル
   * @type {string}
   */
  title        : string;

  /**
   * タスクの想定消化時間( hh:mm )
   * @type {string}
   */
  use_time     : string;

  /**
   * タスクの日付( YYYY-mm-dd )
   * @type {string}
   */
  task_date    : string;

  /**
   * タスクのメモ
   * @type {string}
   */
  memo_text    : string;

  /**
   * タスク開始時間
   * NOTE : JSON.parse でエラーが出るので Date.toStoring()したものを格納する
   * @type {string}
   */
  start_time   : string;

  /**
  * タスク完了時間
   * NOTE : JSON.parse でエラーが出るので Date.toStoring()したものを格納する
   * @type {string}
   */
  end_time     : string;

  /**
   * タスク開始からの経過時間カウンタ( 秒 )
   * @type {string}
   */
  count_second : string;

  /**
   * タスク状態
   * NOTE : TASK_STATUS で定義された値が入る
   * @type {number}
   */
  task_status  : number;
}

/**
 * タスクのデータモデル
 */
export class TaskModel implements ITaskModel{

  /**
   * タスク状態 : 未処理
   * @return {number} TASK_STATUS.NONE
   */
  public static get TASK_STAUS_NONE (): number{
    return TASK_STATUS.NONE;
  }

  /**
   * タスク状態 : 処理中
   * @return {number} TASK_STATUS.AWAKE
   */
  public static get TASK_STAUS_AWAKE (): number{
    return TASK_STATUS.AWAKE;
  }

  /**
   * タスク状態 : 中断
   * @return {number} TASK_STATUS.INTERRUPTION
   */
  public static get TASK_STAUS_INTERRUPTION (): number{
    return TASK_STATUS.INTERRUPTION;
  }

  /**
   * タスク状態 : 完了
   * @return {number} TASK_STATUS.END
   */
  public static get TASK_STAUS_END (): number{
    return TASK_STATUS.END;
  }

  /**
   * 空のオブジェクト生成
   * @return {TaskModel} 空の TaskModel オブジェクト
   */
  public static emptyItem(){
    return new TaskModel({
      id        : 0,
      title     : "",
      use_time  : "",
      task_date : "",
      memo_text : "",
      start_time    :null,
      end_time      :null,
      task_status   :TASK_STATUS.NONE,
      count_second  :null
    });
  }

  public id           : number;
  public title        : string;
  public use_time     : string;
  public task_date    : string;
  public memo_text    : string;
  public start_time   : string;
  public end_time     : string;
  public count_second : string;
  public task_status  : number;

  /**
   * コンストラクタ
   * @param  {ITaskModel} org タスクモデルの生成データ
   */
  constructor( org : ITaskModel ){
    this.start_time = null;
    this.end_time   = null;
    this.task_status = TASK_STATUS.NONE;

    if( org.start_time !== null ){
      this.start_time   = org.start_time;
    }
    if( org.end_time !== null ){
      this.end_time   = org.end_time;
    }
    if( org.task_status !== null ){
      this.task_status   = org.task_status;
    }
    if( org.count_second !== null ){
      this.count_second   = org.count_second;
    }
    this.id        = org.id;
    this.title     = org.title;
    this.use_time  = org.use_time;
    this.task_date = org.task_date;
    this.memo_text = org.memo_text;
  }

  /**
   * 整数値変換した日付
   * @return {number} YYYYmmdd の整数値
   */
  public get taskDateToNumber() : number{
    return TimerHelper.toDateNumber(this.task_date);
  }

  /**
   * 画面上に表示するタスク消化想定時間
   * @return {string} タスク消化想定時間( 既定文字列の場合は null )
   */
  public get disp_use_time () : string{
    if( this._isDefaultTimeValue( this.use_time ) ){
      return null;
    }
    return this.use_time;
  }

  /**
   * タスク消化スタート可能か否かを判定して返却
   * @return {boolean} タスクスタート可否
   */
  public get enableTaskStart():boolean{
    return  ( this.task_status === TASK_STATUS.NONE ) ||
            ( this.task_status === TASK_STATUS.INTERRUPTION )
            ;
  }

  /**
   * タスク消化中断可能か否かを判定して返却
   * @return {boolean} タスク消化中断可否
   */
  public get enableTaskStop():boolean{
    return ( this.task_status === TASK_STATUS.AWAKE );
  }

  /**
   * タスク消化完了可能か否かを判定して返却
   * @return {boolean} タスク消化完了可否
   */
  public get enableTaskEnd():boolean{
    return ( this.task_status === TASK_STATUS.AWAKE );
  }

  /**
   * タスク消化開始からの経過秒加算
   */
  public addCountSecound(){
    this.count_second = this._addCountSecond();
  }

  /**
   * タスク消化開始
   * @return {[type]} [description]
   */
  public taskStart(){
    if(this.start_time === null){
      this.start_time = new Date().toString();
    }
    this.task_status = TASK_STATUS.AWAKE;
  }

  /**
   * タスク消化停止
   * @param  {number} status タスク状態
   */
  public taskStop( status : number ){
    if( this._isTaskStatusStop( status ) ){
      this.task_status = status;
      if( status === TASK_STATUS.END ){
        this.end_time = new Date().toString();
      }
    }
  }

  /**
   * タスク消化開始からの経過時間を加算する
   * @return {string} 経過時間( hh:mm )
   */
  private  _addCountSecond(){
    let startTime = new Date(this.start_time);
    let now       = TimerHelper.now;
    let diff      = ( now.getTime() - startTime.getTime() ) / 1000;
    if( diff <= 0 ){
      return null;
    }
    return TimerHelper.toTimeString(diff);
  }

  /**
   * タスク停止可否の判定
   * @param  {number}  status タスク状態
   * @return {boolean} タスク停止可なら true 
   */
  private _isTaskStatusStop( status : number ):boolean{
    return  status === TASK_STATUS.END ||
            status === TASK_STATUS.INTERRUPTION
            ;
  }

  /**
   * 時間の既定設定判定
   * @param  {string} target 判定対象
   * @return {boolean} 既定文字列であれば true
   */
  private _isDefaultTimeValue( target:string ){
    return ( target === TASK_DEFINE.DEFAULT_TIME_VALUE );
  }
}

/**
 * タスクデータコレクションクラス
 */
@Injectable()
export class TaskModelCollection extends BaseCollection{

  /**
   * シングルトンオブジェクト
   * @type {TaskModelCollection}
   */
  protected static self   : TaskModelCollection;

  /**
   * タスクリストバッファ
   * @type {Array<TaskModel>}
   */
  protected _list         : Array<TaskModel> = null;

  /**
   * カウントダウン管理用ハッシュテーブル
   * NOTE : key=item.id ,value=interval_id の形で格納する
   * @type {Map<number,number>}
   */
  private _intervalMap    : Map<number,number>;

  /**
   * クラスオブジェクトを生成
   * @return {TaskModelCollection} クラスオブジェクト
   */
  public static getInstance() : TaskModelCollection {
    if( TaskModelCollection.self !== null ){
      TaskModelCollection.self = new TaskModelCollection();
    }
    return TaskModelCollection.self;
  }

  /**
   * コンストラクタ
   */
  constructor(){
    super();
    this._list = [];
    this._intervalMap = new Map<number,number>();
  }

  /**
   * タスク追加
   * @param  {TaskModel} item 追加するタスク
   */
  public addItem( item : TaskModel ){
    super.addItem(item);
    this._listSort();
    this._saveStrage();
  }

  /**
   * タスク削除
   * @param  {TaskModel} item 削除するタスク
   */
  public removeItem( item : TaskModel ){
    this.taskStop( item, TASK_STATUS.INTERRUPTION );
    super.removeItem(item);
    this._listSort();
  }

  /**
   * ローカルストレージへの保存
   */
  public save(){
    super.save();
    this._listSort();
    this._list.forEach( row=>{
      if( row.task_status === TaskModel.TASK_STAUS_AWAKE ){
        this.taskStart(row);
      }
    });
  }

  /**
   * タスクの開始
   * @param  {TaskModel} item 開始するタスク
   */
  public taskStart( item : TaskModel ){
    let index = this.list.indexOf(item);
    if( index >= 0 && this._intervalMap.has( item.id ) === false  ){
      item.taskStart();
      let interval = setInterval(()=>{
        item.addCountSecound();
      }, TASK_DEFINE.INTERVAL_MSEC );
      this._intervalMap.set(item.id, interval);
    }
  }

  /**
   * タスクの停止
   * @param  {TaskModel} item   停止するタスク
   * @param  {number}    status 停止時のステータスion]
   */
  public taskStop( item : TaskModel, status : number ){
    let index = this.list.indexOf(item);
    if( index >= 0 && this._intervalMap.has(item.id) ){
      let interval = this._intervalMap.get(item.id);
      clearInterval(interval);
      item.taskStop(status);
      this._intervalMap.delete(item.id);
    }
  }

  /**
   * リストから ID の最大値取得
   * @return {number} リスト内の ID 最大値
   */
  protected getMaxId(){
    let rtn :number = 0;
    this._list.forEach( ( row : TaskModel ) =>{
      if( row.id > rtn ){
        rtn = row.id;
      }
    });
    return rtn;
  }

  /**
   * リストのソート
   */
  protected _listSort(){
    this._list.sort( ( a :TaskModel, b:TaskModel) =>{
        return a.taskDateToNumber - b.taskDateToNumber;
        ;
    });
  }

  /**
   * ローカルストレージの JSON テキストをオブジェクト化した直後に実行される処理
   * @param  {any}    obj JSON をパースしたオブジェクト
   */
  protected parseJsonToListFunction( obj :any ){
    obj.forEach( row => {
      let target = new TaskModel(row);
      this.addItem( target );
      if( target.task_status === TaskModel.TASK_STAUS_AWAKE ){
        this.taskStart(target);
      }
    });
    this._listSort();
  }
}
