# lambda-ses-receive
SESでメールを受け取り、自分のメールアドレスに転送する。

別アプリケーションのサーバに情報を取りに行って表示するようにしているので
不必要であればcomment inしてもよい。


## PREREQUISITE
下記の設定を設定しておくこと。
 * Route53の設定
   * Route53でドメイン登録 or Route53へドメイン移行
   * ドメインに対応するHoztedZoneの作成
   * ドメインに対応するMXレコードの作成
     * Type: `MX`
     * Value: `10 inbound-smtp.us-east-1.amazonaws.com`

 * SESの設定
   * ドメインの登録
   * ドメインのVerify
   * DKIM
   * Notification(任意)

 * Terraformの設定
   * `aws_ses_receipt_rule` の `recipients` に、自分の受け取りたいドメインを追加する


## SETUP
```
## 必要な値をcredstashでセットしておく
credstash -r ap-northeast-1 put -a ACCEPTESSA_ACCESS_TOKEN ...
credstash -r ap-northeast-1 put -a SES_RECEIVER_MAIL_INFO_ENDPOINT ...

## serverlessでセットアップ
git clone https://github.com/celeron1ghz/lambda-ses-receive.git
cd lambda-ses-receive
sls deploy

cd terraform
terraform plan
terraform apply
```


## REQUIRED CREDSTASH VARIABLES
 * `ACCEPTESSA_ACCESS_TOKEN`
 * `SES_RECEIVER_MAIL_INFO_ENDPOINT`


## SEE ALSO
 * https://github.com/celeron1ghz/lambda-ses-receive.git
