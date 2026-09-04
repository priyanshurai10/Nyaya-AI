terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "environment" {
  default = "production"
}

# AWS S3 Data Lake Bucket
resource "aws_s3_bucket" "analytics_lake" {
  bucket        = "global-analytics-lakehouse-${var.environment}"
  force_destroy = true
}

resource "aws_s3_bucket_versioning" "analytics_lake_versioning" {
  bucket = aws_s3_bucket.analytics_lake.id
  versioning_configuration {
    status = "Enabled"
  }
}

# IAM Role for Cloud Container Task
resource "aws_iam_role" "app_execution_role" {
  name = "gae_cloud_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

output "s3_bucket_name" {
  value = aws_s3_bucket.analytics_lake.bucket
}
