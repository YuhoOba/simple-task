import {Injectable} from '@angular/core';
import {Storage, LocalStorage} from 'ionic-angular';

@Injectable()
export class BaseCollection {

  /**
   * ストレージ保存用のキー
   */
  private STORAGE_KEY : string = this.getClassName();

  /**
   * データモデルのリストバッファ
   * @type {Array<any>}
   */
  protected _list        : Array<any> = null;

  /**
   * ストレージオブジェクト
   * @type {Storage}
   */
  protected _storage     : Storage;

  /**
   * クラス名の取得
   * @return {string} クラス名
   */
  public getClassName() : string{
      let funcNameRegex = /function (.{1,})\(/;
      let results  = (funcNameRegex).exec(this["constructor"].toString());
      return (results && results.length > 1) ? results[1] : "";
  }

  /**
   * コンストラクタ
   */
  constructor(){
    this._list = [];
    // TODO : ひとまずローカルストレージでオブジェクトは生成する
    this._storage = new Storage(LocalStorage);
  }

  /**
   * リストバッファ取得
   * @return {Array<any>} リストバッファ
   */
  public get list() : Array<any>{
    return this._list;
  }

  /**
   * リストバッファ内の 最大 ID の取得
   * NOTE : 走査ロジックは getMaxId を override して実装すること
   * @return {number} リストバッファ内の最大ID
   */
  public get maxId():number{
    if( this.hasItem ){
      return this.getMaxId();
    }
    return 0;
  }

  /**
   * リストバッファの項目有無
   * @return {boolean} リスト項目が存在する場合は true
   */
  public get hasItem(){
    return (this._list.length > 0);
  }

  /**
   * ストレージからのデータのロード
   * @return {Promise<any>} Storage.get の Promise オブジェクト
   */
  public load(){
    return this._loadStrage().then( data =>{
      this._parseJsonToList(data);
    });
  }

  /**
   * リスト項目の追加
   * @param  {any}    item 追加するリスト項目
   */
  protected addItem( item : any ){
    if(item.id === 0){
      item.id = this.maxId + 1;
    }
    this._list.push(item);
  }

  /**
   * リスト項目の除去
   * @param  {any}    item 除去するリスト項目
   */
  protected removeItem( item : any ){
    let index = this._list.indexOf(item);
    if( index >= 0 ){
      this._list.splice(index,1);
      this._saveStrage();
    }
  }

  /**
   * ストレージへのリストバッファ保存
   * @return {[type]} [description]
   */
  protected save(){
    this._saveStrage();
  }

  /**
   * リスト項目内の最大IDを取得
   * NOTE : 中身は DataModel 次第なので、継承したクラス内で override して中身は実装する
   * @return {number} 最大ID
   */
  protected getMaxId():number{
    let rtn :number = 0;
    this._list.forEach( ( row : any ) =>{
      if( row.id > rtn ){
        rtn = row.id;
      }
    });
    return rtn;
  }

  /**
   * ストレージへのデータ保存
   * NOTE : JSON.stringify で問題が発生した場合はエラーで止まる
   * TODO : データ量が肥大すると破綻するので、別のデータストアを検討する
   * @return {[type]} [description]
   */
  protected _saveStrage():Promise<any>{
    return this._storage.set( this.STORAGE_KEY, JSON.stringify(this._list))
  }

  /**
   * ストレージからのデータ取得
   * TODO : データ量が肥大すると破綻するので、別のデータストアを検討する
   * @return {[type]} [description]
   */
  protected _loadStrage():Promise<any>{
    return this._storage.get(this.STORAGE_KEY);
  }

  /**
   * リストバッファの内容ソート
   * NOTE : 中身は継承したクラス内で override して実装する
   */
  protected _listSort(){

  }

  /**
   * JSON 文字列のパース後に実行する処理
   * NOTE : 中身は継承したクラス内で override して実装する
   * @param  {any}    obj JSON オブジェクトのデータ
   */
  protected parseJsonToListFunction( obj : any ){

  }

  /**
   * JSON 文字列のオブジェクト化
   * @param  {string} json JSON 文字列
   */
  private _parseJsonToList( json : string ){
    let obj = JSON.parse(json);
    if(obj){
      this.parseJsonToListFunction(obj);
    }
  }

}
