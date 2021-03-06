provider "aws"    { region = "us-east-1" }

terraform {
  required_version = ">= 0.9.0"

  backend "s3" {
    bucket  = "acceptessa-tfstate"
    key     = "lambda-ses-receive.tfstate"
    region  = "ap-northeast-1"
  }
}

resource "aws_ses_receipt_rule_set" "ruleset" {
	rule_set_name = "default-rule-set"
}

resource "aws_ses_active_receipt_rule_set" "main" {
	rule_set_name = "${aws_ses_receipt_rule_set.ruleset.rule_set_name}"
}

resource "aws_ses_receipt_rule" "rule" {
	name          = "rule"
	rule_set_name = "${aws_ses_receipt_rule_set.ruleset.rule_set_name}"
	enabled       = true
	scan_enabled  = true

	recipients    = [
        "camelon.info",
        "7fes.com",
        "aquamarine-dream.info",
        "yoshiriko.info",
        "familiar-life.info",
    ]

  	s3_action {
    	bucket_name = "camelon-inbox"
		position = 0
  	}
}
