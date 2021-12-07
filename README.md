# How To Use 🤯

**including development notes 🐾**

![UltraInstinctGoku👋](https://steamuserimages-a.akamaihd.net/ugc/933813375174275464/A547CA1C4D425339D0D2043E6527DC24F8BF08CD/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false)

## 000 - AppleStore Auto Checkout

### 準備するもの

- profile.json
- webhook.txt

11/27 - まずは puppeteer を触ってみる セレクタの指定が難しい

11/28 - 公式ドキュメントをしっかりと確認し、メソッドを把握。リファクタリング, 最初はとりあえずドキュ
メント, Web 上の情報を用いて書いてみる。とりあえず完全に理解してなくても動けば OK -> そこから徐々に
書いて消してのリファクタリングをする

11/29, 11/30, 12/1 - Proxy 対応, ユーザーにモードを選択してもらう処理の追加し、Debug モードを追加 ->
一連の処理を完成!! <br> いずれ欲しいものを一回買ってみる。 + 支払い失敗時のリトライ作業, 例外処理の
追加を行う , タイマー機能の追加

<br>

---

## 001 - Restock Notification 1.0.0 for Disney Ticket

### 準備するもの

12/1 - 関数は全てアロー関数で書いてみる, その他触ったことのない Syntax で書く, ディズニーのサイト永
遠にリクエスト送ってもずっとエラーページ。全く他のページでもとりあえず情報が載っているのでそこをスク
レイピングし、通知させる。通知は LINE, SMS, Discord

12/8 更新ほぼ一旦動くまでは出来た。ただ待つ時間を設定しないとエラーになる。リトライ追加

- JavaScript でレンダリングするページについて、スクレイピングを行う
- 一旦 1.0.0 では通知のみで開発
- 次のアップデートで全自動購入まで仕上げる

12 月は毎日インプットしてコードを書く！, 戻れるように細かくコミットを癖付ける！

---

<br>

---

## 003 - Restock Monitor for Amazon

---

<br>

---

## 004 - Attach Private IP to Server Using NHN Toast API

---

<br>

### 今後の予定等

- CI/CD を Github Actions にて実装
- サーバーレスでの実装
- Electron 化

### メモ

- Promise
- ~~JS 条件分岐再度確認~~
