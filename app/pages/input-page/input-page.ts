import {Page, NavController,NavParams} from 'ionic-angular';
import {TimerHelper} from '../../helpers/timer-helper';
import {TaskModelCollection,TaskModel} from '../../providers/task/task';

/**
 * タスク状態の selet 内で表示するデータの interface
 */
export interface IOption{

  /**
   * ラベル
   * @type {string}
   */
  label : string;

  /**
   * 値
   * @type {number}
   */
  value : number;
}

/**
 * タスク入力時の定数
 */
namespace TASK_INPUT_DEFINE{

  /**
   * 新規作成時の確定ボタンラベル
   * @type {string}
   */
  export const SAVE_BUTTON_LABEL   :string = '追加';

  /**
   * 編集時の確定ボタンラベル
   * @type {string}
   */
  export const CREATE_BUTTON_LABEL :string = '保存';
}

@Page({
  templateUrl: 'build/pages/input-page/input-page.html'
  ,providers : [TaskModelCollection]
})
export class InputPage {

  /**
   * このページの NavController オブジェクト
   * @type {NavController}
   */
  nav : NavController;

  /**
   * 遷移パラメータオブジェクト
   * @type {NavParams}
   */
  params : NavParams;

  /**
   * タイトル
   * @type {string}
   */
  title  : string;

  /**
   * タスクの想定消化時間( hh:mm )
   * @type {string}
   */
  use_time : string = '00:00';

  /**
   * タスクの日付( YYYY-mm-dd )
   * @type {string}
   */
  task_date : string = TimerHelper.toDateString();

  /**
   * タスクのメモ
   * @type {string}
   */
  memo_text : string;

  /**
   * タスク状態
   * @type {number}
   */
  task_status : number = TaskModel.TASK_STAUS_NONE;

  /**
   * タスク開始からの経過時間カウンタ( 秒 )
   * @type {string}
   */
  count_second : string;

  /**
   * タスクデータコレクション
   * @type {TaskModelCollection}
   */
  task  : TaskModelCollection = null;

  /**
   * 入力対象タスク
   * @type {TaskModel}
   */
  item : TaskModel;

  /**
   * 保存ボタンの有効判定値
   * @type {boolean}
   */
  save_button_status  : boolean   = false;

  /**
   * 新規タスク作成フラグ
   * @type {boolean}
   */
  is_create  : boolean;

  /**
   * ボタンラベル
   * @type {string}
   */
  save_button_label : string;

  /**
   * タスク状態の select 用リスト
   * @type {Array<Options>}
   */
  task_status_options : Array<IOption>;

  /**
   * コンストラクタ
   * @param  {NavController} nav    [description]
   * @param  {NavParams}     params [description]
   */
  constructor( nav: NavController, params: NavParams) {
    this.nav    = nav;
    this.params = params;
    this.is_create = this.params.get('is_create');
    if( this.is_create === true ){
      this.task = this.params.get('target');
      this.save_button_label = TASK_INPUT_DEFINE.CREATE_BUTTON_LABEL;
    }else{
      this.item = this.params.get('target');
      this.task = this.params.get('task');
      this._initialize(this.item);
      this.save_button_label = TASK_INPUT_DEFINE.SAVE_BUTTON_LABEL;
      this._createTaskStatusOptions();
    }
  }

  /**
   * 戻るボタンハンドラ
   */
  public onClose() {
    this.nav.pop();
  }

  /**
   * 保存ボタンハンドラ
   */
  public onSave() {
    if( this.is_create === true ){
      let item : TaskModel = this._createSaveTaskItem(TaskModel.emptyItem());
      this.task.addItem(item);
    }else{
      this.item = this._createSaveTaskItem(this.item);
      this.task.save();
    }
    this.nav.pop();
  }

  /**
   * キーイベントハンドラ
   * @param  {[type]} event [description]
   */
  public onKeyup(){
    this.save_button_status = this._checkRequireParams();
  }

  /**
   * 必須パラメータ入力判定
   * @return {boolean} 必須パラメータが入力済みなら true
   */
  private _checkRequireParams(){
    return ( this.title )? true:false;
  }

  /**
   * 保存タスクのデータセット
   * @param  {TaskModel} item 保存対象となるタスク
   * @return {TaskModel} 保存データのセットされたタスク
   */
  private _createSaveTaskItem( item : TaskModel ):TaskModel{
    item.title     = this.title;
    item.use_time  = this.use_time;
    item.task_date = this.task_date;
    item.memo_text = this.memo_text;
    item.task_status = Number( this.task_status );
    return item;
  }

  /**
   * 初期化処理
   * @param  {TaskModel} item 初期化処理に使用されるタスク
   */
  private _initialize( item : TaskModel ){
    this.title      = item.title     ;
    if( item.use_time !== null ){
      this.use_time = item.use_time;
    }
    this.task_date  = item.task_date ;
    this.memo_text  = item.memo_text ;

    if( item.task_status !== null ){
      this.task_status = item.task_status;
    }
    if( item.count_second !== null ){
      this.count_second = item.count_second;
    }
    if( this.title ){
      this.save_button_status = true;
    }
  }

  /**
   * option リストの生成
   */
  private _createTaskStatusOptions(){
    this.task_status_options = [];
    this.task_status_options.push({
      label:"なし",
      value:TaskModel.TASK_STAUS_NONE
    });
    this.task_status_options.push({
      label:"実施中",
      value:TaskModel.TASK_STAUS_AWAKE
    });
    this.task_status_options.push({
      label:"中断",
      value:TaskModel.TASK_STAUS_INTERRUPTION
    });
    this.task_status_options.push({
      label:"完了",
      value:TaskModel.TASK_STAUS_END
    });
  }

}
