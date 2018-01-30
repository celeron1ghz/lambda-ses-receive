# lambda-ses-receive
Receive emails from SES and it forward to specified address


## SETUP ENVIRONMENT VARIABLES
Set these value to `EC2 Parameter Store`.

 * `ACCEPTESSA_ACCESS_TOKEN`
 * `SES_RECEIVER_MAIL_INFO_ENDPOINT`


## SETUP SERVERLESS SCRIPT AND TERRAFORM
```
git clone https://github.com/celeron1ghz/lambda-ses-receive.git
cd lambda-ses-receive
## setup like below...
sls deploy

cd terraform
terraform plan
terraform apply
```

### 1. Create MX record
`10 inbound-smtp.<region>.amazonaws.com`

### 2. Create config.js for receive email address
copy repo's `config.sample.js` into `config.js` and modify file.

key is **receive domain**, value is **forward email address**.

### 3. Rewrite terraform/main.tf
**aws_ses_receipt_rule** -> **recipients**

config to your domain list to receive email.


## SEE ALSO
 * https://github.com/celeron1ghz/lambda-ses-receive.git
