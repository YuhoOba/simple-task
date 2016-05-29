import {Page, NavController, Modal, Alert, NavParams, Loading} from 'ionic-angular';
import {InputPage} from '../input-page/input-page';
import {TaskModelCollection,TaskModel} from '../../providers/task/task';

@Page({
  templateUrl: 'build/pages/home/home.html'
  ,providers : [TaskModelCollection]
})
/**
 * メインページクラス
 */
export class HomePage {

  /**
   * このページの NavController オブジェクト
   * @type {NavController}
   */
  nav     : NavController;

  /**
   * 遷移パラメータオブジェクト
   * @type {NavParams}
   */
  params  : NavParams;

  /**
   * タスクデータコレクション
   * @type {TaskModelCollection}
   */
  task    : TaskModelCollection;

  /**
   * 表示用リストバッファ
   * @type {Array<TaskModel>}
   */
  list    : Array<TaskModel> = null;

  /**
   * ローディング
   * @type {Loading}
   */
  loading : Loading;

  /**
   * コンストラクタ
   * @param  {NavController} nav    ナビゲーションコントローラ
   * @param  {NavParams}     params 遷移パラメータ
   */
  constructor(nav: NavController, params: NavParams){
    this.nav = nav;
    this._appearLoading();
    this.params = params;
    this.task = TaskModelCollection.getInstance();
    // データの展開
    this.task.load().then(()=>{
      this.list = this.task.list;
      this._disappearLoading();
    });
  }

  /**
   * タスク追加ボタンハンドラ
   */
  public onAddItem(){
    this.nav.push(InputPage,{
      target : this.task,
      is_create : true
    });
  }

  /**
   * 編集ボタンハンドラ
   * @param  {TaskModel} item  編集対象となるタスク
   */
  public onEditItem( item : TaskModel){
    this.nav.push(InputPage,{
      target : item,
      is_create : false,
      task : this.task
    });
  }

  /**
   * 削除ボタンイベントハンドラ
   * @param  {TaskModel} item  削除対象となるタスク
   */
  public onRemoveItem( item : TaskModel ){
    this._removeItem( item );
  }

  /**
   * タスク開始ボタンイベントハンドラ
   * @param  {TaskModel} item  開始対象となるタスク
   */
  public onTaskStart( item : TaskModel ){
    this.task.taskStart(item);
    this.task.save();
  }

  /**
   * タスク中断ボタンイベントハンドラ
   * @param  {TaskModel} item  中断対象となるタスク
   */
  public onTaskStop( item : TaskModel ){
    this.task.taskStop( item, TaskModel.TASK_STAUS_INTERRUPTION );
    this.task.save();
  }

  /**
   * タスク完了ボタンイベントハンドラ
   * @param  {TaskModel} item  完了対象となるタスク
   */
  public onTaskEnd( item : TaskModel ){
    this.task.taskStop( item, TaskModel.TASK_STAUS_END );
    this.task.save();
  }

  /**
   * タスク削除処理
   * @param  {TaskModel} item 削除対象となるタスク
   */
  private _removeItem(item : TaskModel){
    // 消す前に警告ポップアップを出す
    let confirm = Alert.create({
      title: 'タスクを削除',
      message: `${item.title} を削除しますか？`,
      buttons: [
        {
          text: 'キャンセル',
          handler: () => {

          }
        },
        {
          text: '削除',
          handler: () => {
            this.task.removeItem(item);
            this.list = this.task.list;
          }
        }
      ]
    });
    this.nav.present(confirm);
  }

  /**
   * ローディング表示
   * NOTE : Beta 7 で dismiss が意図通り動作しないので封鎖
   */
  private _appearLoading(){
    // this.loading = Loading.create({
    //   content: 'Please wait...'
    // });
    // this.nav.present(this.loading);
  }

  /**
   * ローディング消去
   * NOTE : Beta 7 で dismiss が意図通り動作しないので封鎖
   */
  private _disappearLoading(){
    // this.loading.dismiss();
  }
}
