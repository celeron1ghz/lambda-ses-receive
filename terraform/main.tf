provider "aws"    { region = "us-east-1" }

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
        "7fes.com",
        "camelon.info",
    ]

  	s3_action {
    	bucket_name = "camelon-inbox"
		position = 0
  	}
}
